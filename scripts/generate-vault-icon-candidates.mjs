/**
 * Build vault icon candidate gallery (DIM, Bungie manifest, static UI).
 *
 * Output:
 *   data/vault-icon-candidates.json
 *   public/vault-icon-picker.html
 *   public/images/vault-icon-candidates/*
 */
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';

function loadEnv() {
  try {
    const raw = readFileSync('.env.local', 'utf8');
    for (const line of raw.split('\n')) {
      const t = line.trim();
      if (!t || t.startsWith('#')) continue;
      const eq = t.indexOf('=');
      if (eq === -1) continue;
      if (!process.env[t.slice(0, eq).trim()]) {
        process.env[t.slice(0, eq).trim()] = t.slice(eq + 1).trim();
      }
    }
  } catch {
    /* optional */
  }
}

loadEnv();
const API_KEY = process.env.BUNGIE_API_KEY;

const OUT_DIR = resolve('public/images/vault-icon-candidates');
const DATA_PATH = resolve('data/vault-icon-candidates.json');
const HTML_PATH = resolve('public/vault-icon-picker.html');

/** DIM uses a local vault.svg (not from Bungie). */
const EXTERNAL_CURATED = [
  {
    path: 'https://raw.githubusercontent.com/DestinyItemManager/DIM/master/src/images/vault.svg',
    source: 'external:dim',
    name: 'DIM vault.svg (official)',
    isAbsolute: true,
  },
  {
    path: 'https://raw.githubusercontent.com/DestinyItemManager/DIM/master/src/images/vault-background.svg',
    source: 'external:dim',
    name: 'DIM vault-background.svg',
    isAbsolute: true,
  },
  {
    path: 'https://raw.githubusercontent.com/DestinyItemManager/DIM/master/src/images/arrows-in.png',
    source: 'external:dim',
    name: 'DIM arrows-in (move to character)',
    isAbsolute: true,
  },
  {
    path: 'https://raw.githubusercontent.com/DestinyItemManager/DIM/master/src/images/arrows-out.png',
    source: 'external:dim',
    name: 'DIM arrows-out (move to vault)',
    isAbsolute: true,
  },
  {
    path: '/icons/d2/vault.svg',
    source: 'local:current',
    name: 'Current d2-collector vault.svg',
    isLocal: true,
  },
  // Static Bungie UI (inventory / storage)
  { path: '/img/destiny_content/items/inventory-item-tier5.png', source: 'external:ui-static', name: 'Gear tier 5 (reference)' },
  { path: '/img/destiny_content/items/watermark-layer.png', source: 'external:ui-static', name: 'Watermark layer' },
  { path: '/img/destiny_content/items/featured-flag.png', source: 'external:ui-static', name: 'Featured flag' },
  { path: '/img/theme/destiny/bgs/emblem_header_bg.jpg', source: 'external:ui-static', name: 'Emblem header bg (unlikely)' },
];

const VAULT_FILE_RE = /vault|storage|locker|lockbox|safe|deposit|stash|strongbox|postmaster/i;
const RAID_VAULT_RE = /vault of glass|vog_|hezen|praedyth|fatebringer|kabr|timelost|oracle/i;

async function fetchManifest() {
  if (!API_KEY) return null;
  const res = await fetch('https://www.bungie.net/Platform/Destiny2/Manifest/', {
    headers: { 'X-API-Key': API_KEY },
  });
  const json = await res.json();
  return json.Response;
}

async function fetchComponent(manifest, name) {
  const path = manifest.jsonWorldComponentContentPaths.en[name];
  const res = await fetch(`https://www.bungie.net${path}`);
  return res.json();
}

async function downloadIcon(entry) {
  const localName = entry.localName;
  const localPath = resolve(OUT_DIR, localName);
  const sourcePath = entry.icon ?? entry.path;
  if (!sourcePath) return null;

  if (entry.isLocal) {
    copyFileSync(resolve('public', sourcePath.replace(/^\//, '')), localPath);
    return { bytes: readFileSync(localPath).length };
  }

  const url = entry.isAbsolute
    ? sourcePath
    : `https://www.bungie.net${sourcePath}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(localPath, buf);
  return { bytes: buf.length };
}

function addIcon(map, iconPath, source) {
  if (!iconPath || iconPath === 'undefined' || iconPath.includes('missing_icon')) return;
  if (typeof iconPath !== 'string' || !iconPath.startsWith('/')) return;
  const key = iconPath;
  if (!map.has(key)) {
    map.set(key, {
      icon: iconPath,
      localName: basename(iconPath.split('?')[0]),
      sources: [],
    });
  }
  map.get(key).sources.push(source);
}

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function card(entry) {
  const src = entry.sources[0];
  const isWhiteSvg = entry.localName.endsWith('.svg');
  const previewClass = isWhiteSvg ? 'icon-on-dark' : 'icon-color';
  return `<div class="card"><div class="icon-frame ${previewClass}"><img src="/images/vault-icon-candidates/${esc(entry.localName)}" alt=""></div>
        <div class="tag">${esc(src.kind)}</div><div class="file">${esc(entry.localName)}</div>
        <div class="name">${esc(src.name || entry.localName)}</div>
        <div class="ctx">${esc(src.detail || src.source || '')}</div></div>`;
}

function section(id, title, entries) {
  if (!entries.length) return '';
  return `<section id="${esc(id)}"><h2>${esc(title)}</h2><div class="count">${entries.length} iconos</div><div class="grid">${entries.map(card).join('')}</div></section>`;
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const iconMap = new Map();
  const sections = [];

  for (const item of EXTERNAL_CURATED) {
    const localName = item.isLocal
      ? `local-${basename(item.path)}`
      : item.source === 'external:dim'
        ? `dim-${basename(item.path)}`
        : basename(item.path.split('?')[0]);
    const key = item.isLocal ? item.path : item.path;
    iconMap.set(key, {
      icon: item.path,
      localName,
      isAbsolute: item.isAbsolute,
      isLocal: item.isLocal,
      sources: [
        {
          kind: item.source,
          name: item.name,
          source: item.source,
        },
      ],
    });
  }

  if (API_KEY) {
    const manifest = await fetchManifest();
    if (manifest) {
      const [icons, items, presentation, itemConstants] = await Promise.all([
        fetchComponent(manifest, 'DestinyIconDefinition'),
        fetchComponent(manifest, 'DestinyInventoryItemDefinition'),
        fetchComponent(manifest, 'DestinyPresentationNodeDefinition'),
        fetchComponent(manifest, 'DestinyInventoryItemConstantsDefinition'),
      ]);

      for (const [hash, icon] of Object.entries(icons)) {
        const image = icon?.imagePath ?? '';
        const file = basename(image);
        if (!VAULT_FILE_RE.test(file) && !VAULT_FILE_RE.test(image)) continue;
        if (RAID_VAULT_RE.test(file) || RAID_VAULT_RE.test(image)) continue;
        addIcon(iconMap, image, {
          kind: 'manifest:icon',
          name: file,
          detail: `DestinyIconDefinition ${hash}`,
          source: 'manifest',
        });
      }

      for (const [hash, item] of Object.entries(items)) {
        const name = item?.displayProperties?.name ?? '';
        const icon = item?.displayProperties?.icon ?? '';
        const file = basename(icon);
        const nameMatch = /\bvault\b/i.test(name) && !/vault of glass/i.test(name);
        const iconMatch =
          VAULT_FILE_RE.test(file) && !RAID_VAULT_RE.test(file) && !RAID_VAULT_RE.test(name);
        if (!nameMatch && !iconMatch) continue;
        addIcon(iconMap, icon, {
          kind: 'manifest:item',
          name: name || file,
          detail: `DestinyInventoryItemDefinition ${hash}`,
          source: 'manifest',
        });
      }

      for (const [hash, node] of Object.entries(presentation)) {
        const name = node?.displayProperties?.name ?? '';
        const icon = node?.displayProperties?.icon ?? '';
        const file = basename(icon);
        if (!/\bvault\b/i.test(name) && !VAULT_FILE_RE.test(file)) continue;
        if (/vault of glass/i.test(name)) continue;
        addIcon(iconMap, icon, {
          kind: 'manifest:presentation',
          name: name || file,
          detail: `DestinyPresentationNodeDefinition ${hash}`,
          source: 'manifest',
        });
      }

      for (const [key, value] of Object.entries(itemConstants)) {
        if (typeof value !== 'string' || !value.startsWith('/')) continue;
        if (!VAULT_FILE_RE.test(value) && !VAULT_FILE_RE.test(String(key))) continue;
        addIcon(iconMap, value, {
          kind: 'manifest:constants',
          name: key,
          detail: 'DestinyInventoryItemConstantsDefinition',
          source: 'manifest',
        });
      }
    }
  }

  const downloaded = [];
  for (const entry of iconMap.values()) {
    if (!entry.icon || entry.icon === 'undefined') continue;
    const result = await downloadIcon(entry);
    if (result) downloaded.push({ ...entry, bytes: result.bytes });
  }

  const byKind = new Map();
  for (const entry of downloaded) {
    const kind = entry.sources[0]?.kind ?? 'other';
    const group = kind.split(':')[0];
    if (!byKind.has(group)) byKind.set(group, []);
    byKind.get(group).push(entry);
  }

  const sectionDefs = [
    ['external', '⭐ DIM y local (recomendados)', byKind.get('external') ?? []],
    ['local', '📁 Local actual', byKind.get('local') ?? []],
    ['manifest', '📦 Manifiesto Bungie (vault / storage)', byKind.get('manifest') ?? []],
  ];

  for (const [id, title, entries] of sectionDefs) {
    if (entries.length) sections.push(section(id, title, entries));
  }

  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><title>Iconos Vault</title>
<style>body{font-family:system-ui,sans-serif;background:#0a0a0a;color:#eee;padding:24px;max-width:1600px;margin:0 auto}
h1{margin:0 0 8px}.sub{color:#999;margin:0 0 20px;line-height:1.6}
nav{background:#161616;padding:12px 16px;border-radius:8px;margin-bottom:28px;display:flex;flex-wrap:wrap;gap:8px 14px}
nav a{color:#7ec8ff;font-size:12px}section{margin:44px 0}h2{font-size:1.05rem;border-bottom:1px solid #333;padding-bottom:8px}
.count{color:#666;font-size:12px;margin:8px 0 14px}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:12px}
.card{background:#141414;border:1px solid #262626;border-radius:10px;padding:12px}.card:hover{border-color:#5b9aff}
.icon-frame{width:96px;height:96px;margin:0 auto 8px;background:#2d2d2d;border:1px solid #555;border-radius:8px;display:flex;align-items:center;justify-content:center}
.icon-frame img{width:72px;height:72px;object-fit:contain}
.icon-frame.icon-on-dark{background:#3a3a3a}
.icon-frame.icon-color{background:#1a1a1a}
.file{font-family:monospace;font-size:10px;color:#7ec8ff;word-break:break-all}.name{font-size:11px;font-weight:600;margin:6px 0 2px}
.ctx{font-size:10px;color:#777}.tag{font-size:9px;background:#1a2a1a;color:#8f8;padding:1px 5px;border-radius:3px}
.note{background:#1a1a2a;border:1px solid #333;border-radius:8px;padding:14px 16px;margin:0 0 24px;font-size:13px;line-height:1.6;color:#bbb}
</style></head><body><h1>Iconos — Vault (inventario)</h1>
<p class="sub"><code>npm run dev</code> → <a href="/vault-icon-picker.html" style="color:#7ec8ff">/vault-icon-picker.html</a><br>
Dime el <strong>nombre del archivo</strong> del icono correcto (como en DIM: cofre con candado).</p>
<div class="note"><strong>Nota:</strong> DIM no usa un icono de Bungie para el vault — usa su propio <code>vault.svg</code>. Los candidatos del manifiesto incluyen iconos con &quot;vault&quot; en el nombre, excluyendo Vault of Glass.</div>
<nav>${sectionDefs.filter(([, , e]) => e.length).map(([id, title]) => `<a href="#${id}">${esc(title)}</a>`).join('')}</nav>
${sections.join('')}
</body></html>`;

  writeFileSync(HTML_PATH, html);
  writeFileSync(
    DATA_PATH,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        count: downloaded.length,
        icons: downloaded.map((e) => ({
          localName: e.localName,
          icon: e.icon,
          sources: e.sources,
        })),
      },
      null,
      2,
    ),
  );

  console.log(`Wrote ${downloaded.length} icons → ${OUT_DIR}`);
  console.log(`Open /vault-icon-picker.html (${HTML_PATH})`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
