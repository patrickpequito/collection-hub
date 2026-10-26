/**
 * Build featured weekly-challenge icon candidate gallery from Bungie manifest
 * and curated external research (DIM, systems_reward_*, rgateway_*, etc.).
 *
 * Output:
 *   data/featured-icon-candidates.json
 *   public/featured-icon-picker.html
 *   public/images/rad-loot/featured-icon-candidates/*
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
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
if (!API_KEY) {
  console.error('Missing BUNGIE_API_KEY in .env.local');
  process.exit(1);
}

const OUT_DIR = resolve('public/images/rad-loot/featured-icon-candidates');
const DATA_PATH = resolve('data/featured-icon-candidates.json');
const HTML_PATH = resolve('public/featured-icon-picker.html');

const FEATURED_SLUGS = [
  'vault-of-glass',
  'crotas-end',
  'warlords-ruin',
  'grasp-of-avarice',
];
const FEATURED_RE = /vault of glass|crota'?s end|warlord'?s ruin|grasp of avarice/i;

/** Curated paths from external research (DIM, Update 9.7 docs, DestinyIconDefinition). */
const EXTERNAL_CURATED = [
  // systems_reward_* — Director Ops UI badges (Edge of Fate / 9.x)
  { path: '/common/destiny2_content/icons/7208v900_systems_reward_pinnacle_ops.v2.png', source: 'external:systems_reward', name: 'Pinnacle Ops reward badge' },
  { path: '/common/destiny2_content/icons/7217v900_systems_reward_fireteam_ops.v2.png', source: 'external:systems_reward', name: 'Fireteam Ops reward badge' },
  { path: '/common/destiny2_content/icons/7201v900_systems_reward_solo_ops.v2.png', source: 'external:systems_reward', name: 'Solo Ops reward badge' },
  { path: '/common/destiny2_content/icons/7225v900_systems_reward_crucible_ops.v2.png', source: 'external:systems_reward', name: 'Crucible Ops reward badge' },
  { path: '/common/destiny2_content/icons/7226v900_systems_reward_all_ops.v2.png', source: 'external:systems_reward', name: 'All Ops reward badge' },
  { path: '/common/destiny2_content/icons/7219v900_systems_reward_extra_engram.v2.png', source: 'external:systems_reward', name: 'Extra engram reward badge' },
  { path: '/common/destiny2_content/icons/7220v900_systems_reward_extra_engram.v2.png', source: 'external:systems_reward', name: 'Extra engram reward badge (alt)' },
  { path: '/common/destiny2_content/icons/7221v900_systems_reward_extra_engram.v2.png', source: 'external:systems_reward', name: 'Extra engram reward badge (alt 2)' },
  { path: '/common/destiny2_content/icons/7216v900_systems_reward_jackpot.v2.png', source: 'external:systems_reward', name: 'Jackpot reward badge' },
  { path: '/common/destiny2_content/icons/7222v900_systems_reward_daily_bonus.v2.png', source: 'external:systems_reward', name: 'Daily bonus badge' },
  { path: '/common/destiny2_content/icons/29960v900_p_origin_pinnacle_pve_000_000.v2.png', source: 'external:systems_reward', name: 'Pinnacle PvE origin badge' },
  // rgateway — raid vendor tier engrams (Monument of Triumph / 9.7)
  { path: '/common/destiny2_content/icons/20791v910_rgateway_raid_vendor_engram_tier_5.v2.png', source: 'external:rgateway', name: 'Raid vendor engram tier 5' },
  { path: '/common/destiny2_content/icons/20792v910_rgateway_raid_vendor_engram_tier_4.v2.png', source: 'external:rgateway', name: 'Raid vendor engram tier 4' },
  { path: '/common/destiny2_content/icons/20793v910_rgateway_raid_vendor_engram_tier_3.v2.png', source: 'external:rgateway', name: 'Raid vendor engram tier 3' },
  { path: '/common/destiny2_content/icons/20794v910_rgateway_raid_vendor_engram_tier_2.v2.png', source: 'external:rgateway', name: 'Raid vendor engram tier 2' },
  { path: '/common/destiny2_content/icons/20795v910_rgateway_raid_vendor_engram_tier_1.v2.png', source: 'external:rgateway', name: 'Raid vendor engram tier 1' },
  { path: '/common/destiny2_content/icons/20802v910_rgateway_raid_vendor_boost_1.v2.png', source: 'external:rgateway', name: 'Raid vendor boost 1 (raid icon)' },
  { path: '/common/destiny2_content/icons/20801v910_rgateway_raid_vendor_boost_2.v2.png', source: 'external:rgateway', name: 'Raid vendor boost 2' },
  { path: '/common/destiny2_content/icons/20800v910_rgateway_raid_vendor_boost_3.v2.png', source: 'external:rgateway', name: 'Raid vendor boost 3' },
  { path: '/common/destiny2_content/icons/20799v910_rgateway_raid_vendor_boost_4.v2.png', source: 'external:rgateway', name: 'Raid vendor boost 4' },
  // Weekly / pinnacle / starburst (community “golden starburst” guides)
  { path: '/common/destiny2_content/icons/v736_starburst_watermark_000_000.v2.png', source: 'external:starburst', name: 'Starburst watermark (manifest)' },
  { path: '/common/destiny2_content/icons/20429v700_weekly_hot_bubble.v2.png', source: 'external:weekly', name: 'Weekly hot bubble' },
  { path: '/common/destiny2_content/icons/20410v700_weekly_hot_bubble.v2.png', source: 'external:weekly', name: 'Weekly hot bubble (alt)' },
  { path: '/common/destiny2_content/icons/4157v956_bounties_platinum_pinnacle_ops.v2.png', source: 'external:pinnacle', name: 'Platinum pinnacle ops bounty' },
  { path: '/common/destiny2_content/icons/30709v970_vendor_attunement_pinnacle_ops_.v2.png', source: 'external:pinnacle', name: 'Pinnacle ops attunement vendor' },
  { path: '/common/destiny2_content/icons/20070vendor_kiosk_exotic_archive_pinnacle.v2.png', source: 'external:pinnacle', name: 'Exotic archive pinnacle kiosk' },
  // generic_event engram tiers (turquoise hex family)
  { path: '/common/destiny2_content/icons/4253generic_event_engram_tier1.v2.png', source: 'external:engram-tier', name: 'generic_event engram tier 1' },
  { path: '/common/destiny2_content/icons/4252generic_event_engram_tier2.v2.png', source: 'external:engram-tier', name: 'generic_event engram tier 2' },
  { path: '/common/destiny2_content/icons/4251generic_event_engram_tier3.v2.png', source: 'external:engram-tier', name: 'generic_event engram tier 3' },
  { path: '/common/destiny2_content/icons/4250generic_event_engram_tier4.v2.png', source: 'external:engram-tier', name: 'generic_event engram tier 4' },
  { path: '/common/destiny2_content/icons/4249generic_event_engram_tier5.v2.png', source: 'external:engram-tier', name: 'generic_event engram tier 5' },
  { path: '/common/destiny2_content/icons/generic_event_engram_tier5_large.v2.png', source: 'external:engram-tier', name: 'generic_event engram tier 5 (large)' },
  { path: '/common/destiny2_content/icons/30586v900_sack_engram_generic_tier5.v2.png', source: 'external:engram-tier', name: 'sack engram generic tier 5 (purple)' },
  { path: '/common/destiny2_content/icons/7258v900_sack_engram_generic_tier5.v2.png', source: 'external:engram-tier', name: 'sack engram generic tier 5 (alt)' },
  { path: '/common/destiny2_content/icons/3777v900_engram_solstice_tier5.v2.png', source: 'external:engram-tier', name: 'Solstice engram tier 5' },
  // order_icon — Director objective rich-text icons (DIM uses these)
  { path: '/common/destiny2_content/icons/30884order_icon_generic_activity.v2.png', source: 'external:order_icon', name: 'order_icon generic activity' },
  { path: '/common/destiny2_content/icons/30928order_icon_generic_activity.v2.png', source: 'external:order_icon', name: 'order_icon generic activity (v2)' },
  // DestinyInventoryItemConstantsDefinition static UI
  { path: '/img/destiny_content/items/inventory-item-tier1.png', source: 'external:ui-static', name: 'Gear tier 1 overlay' },
  { path: '/img/destiny_content/items/inventory-item-tier2.png', source: 'external:ui-static', name: 'Gear tier 2 overlay' },
  { path: '/img/destiny_content/items/inventory-item-tier3.png', source: 'external:ui-static', name: 'Gear tier 3 overlay' },
  { path: '/img/destiny_content/items/inventory-item-tier4.png', source: 'external:ui-static', name: 'Gear tier 4 overlay' },
  { path: '/img/destiny_content/items/inventory-item-tier5.png', source: 'external:ui-static', name: 'Gear tier 5 overlay' },
  { path: '/img/destiny_content/items/featured-flag.png', source: 'external:ui-static', name: 'Featured item flag (DIM iconWatermarkFeatured)' },
  { path: '/img/destiny_content/items/watermark-layer.png', source: 'external:ui-static', name: 'Watermark drop shadow' },
];

const NAME_STRICT = /weekly\s+(raid|dungeon)\s+challenge|weekly\s+challenge|director\s+challenge/i;
const NAME_BROAD = /\bchallenge\b|\bweekly\b/i;
const ICON_FILE_RE =
  /challenge|weekly|skull|order_icon|tier5|tier_5|engram_tier|generic_event|pinnacle|starburst|hot_bubble|rgateway|systems_reward/i;

async function fetchManifest() {
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

async function downloadIcon(iconPath) {
  const localName = basename(iconPath);
  const localPath = resolve(OUT_DIR, localName);
  const res = await fetch(`https://www.bungie.net${iconPath}`);
  if (!res.ok) return null;
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(localPath, buf);
  return { icon: iconPath, localName, bytes: buf.length };
}

function addIcon(map, iconPath, source) {
  if (!iconPath || iconPath.includes('missing_icon')) return;
  const key = iconPath;
  if (!map.has(key)) {
    map.set(key, { icon: iconPath, localName: basename(iconPath), sources: [] });
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
  return `<div class="card"><img src="/images/rad-loot/featured-icon-candidates/${esc(entry.localName)}" alt="">
        <div class="tag">${esc(src.kind)}</div><div class="file">${esc(entry.localName)}</div>
        <div class="name">${esc(src.name || entry.localName)}</div>
        <div class="ctx">${esc(src.detail || src.activity || '')}</div></div>`;
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const manifest = await fetchManifest();

  const [
    objectives,
    modifiers,
    activities,
    milestones,
    records,
    presentation,
    collectibles,
    items,
    icons,
    itemConstants,
  ] = await Promise.all([
    fetchComponent(manifest, 'DestinyObjectiveDefinition'),
    fetchComponent(manifest, 'DestinyActivityModifierDefinition'),
    fetchComponent(manifest, 'DestinyActivityDefinition'),
    fetchComponent(manifest, 'DestinyMilestoneDefinition'),
    fetchComponent(manifest, 'DestinyRecordDefinition'),
    fetchComponent(manifest, 'DestinyPresentationNodeDefinition'),
    fetchComponent(manifest, 'DestinyCollectibleDefinition'),
    fetchComponent(manifest, 'DestinyInventoryItemDefinition'),
    fetchComponent(manifest, 'DestinyIconDefinition'),
    fetchComponent(manifest, 'DestinyInventoryItemConstantsDefinition'),
  ]);

  const iconMap = new Map();
  const weeklyHits = [];

  // Live weekly raid/dungeon challenge objectives (from featured activities API pattern)
  for (const [hash, obj] of Object.entries(objectives)) {
    const name = obj?.displayProperties?.name ?? '';
    if (NAME_STRICT.test(name)) {
      weeklyHits.push({ type: 'objective-strict', hash, name });
      if (obj?.displayProperties?.icon) {
        addIcon(iconMap, obj.displayProperties.icon, {
          kind: 'objective-strict',
          name,
          activity: 'featured',
          detail: String(hash),
        });
      }
    } else if (NAME_BROAD.test(name) && obj?.displayProperties?.icon) {
      addIcon(iconMap, obj.displayProperties.icon, {
        kind: 'objective',
        name,
        activity: 'any',
        detail: String(hash),
      });
    }
  }

  const defs = [
    ['modifier', modifiers],
    ['activity', activities],
    ['milestone', milestones],
    ['record', records],
    ['presentation', presentation],
    ['collectible', collectibles],
    ['item', items],
  ];

  for (const [kind, data] of defs) {
    for (const [hash, entry] of Object.entries(data)) {
      const name = entry?.displayProperties?.name ?? '';
      const icon = entry?.displayProperties?.icon;
      if (!icon) continue;
      const activity = FEATURED_RE.test(name)
        ? FEATURED_SLUGS.find((s) => name.toLowerCase().includes(s.replace(/-/g, ' ')) || FEATURED_RE.test(name))
        : 'any';
      if (NAME_BROAD.test(name) || (kind === 'activity' && FEATURED_RE.test(name))) {
        addIcon(iconMap, icon, { kind, name, activity: activity ?? 'any', detail: String(hash) });
      }
      if (kind === 'activity' && FEATURED_RE.test(name)) {
        addIcon(iconMap, icon, { kind: 'featured-activity', name, activity: 'featured', detail: String(hash) });
        if (entry?.pgcr?.image) {
          addIcon(iconMap, entry.pgcr.image, { kind: 'pgcr', name, activity: 'featured', detail: 'pgcr' });
        }
      }
    }
  }

  // Icon definition file-name search
  for (const [hash, entry] of Object.entries(icons)) {
    for (const p of [entry?.foreground, entry?.highResForeground]) {
      if (!p || !ICON_FILE_RE.test(p)) continue;
      addIcon(iconMap, p, {
        kind: 'icon-file',
        name: basename(p),
        activity: 'all',
        detail: `hash ${hash}`,
      });
    }
  }

  // Item constants overlays
  const constants = itemConstants['1'] ?? Object.values(itemConstants)[0];
  if (constants?.gearTierOverlayImagePaths) {
    for (const [i, p] of constants.gearTierOverlayImagePaths.entries()) {
      addIcon(iconMap, p, {
        kind: 'ui-static',
        name: `Gear tier ${i + 1} overlay`,
        activity: 'DIM ItemIcon',
        detail: 'DestinyInventoryItemConstantsDefinition',
      });
    }
  }
  if (constants?.featuredItemFlagPath) {
    addIcon(iconMap, constants.featuredItemFlagPath, {
      kind: 'ui-static',
      name: 'Featured item flag',
      activity: 'DIM isFeaturedItem',
      detail: constants.featuredItemFlagPath,
    });
  }

  // External curated list
  for (const ext of EXTERNAL_CURATED) {
    addIcon(iconMap, ext.path, {
      kind: ext.source,
      name: ext.name,
      activity: 'external research',
      detail: ext.path,
    });
  }

  // Download all
  let downloaded = 0;
  for (const entry of iconMap.values()) {
    const result = await downloadIcon(entry.icon);
    if (result) downloaded++;
  }

  const iconsArr = [...iconMap.values()].sort((a, b) => a.localName.localeCompare(b.localName));
  writeFileSync(DATA_PATH, JSON.stringify({ weeklyHits, icons: iconsArr }, null, 2));

  const byKind = (kind) => iconsArr.filter((e) => e.sources.some((s) => s.kind === kind || s.kind?.startsWith(kind)));

  const sections = [
    { id: 'featured', title: '⭐ Destacadas esta semana', items: byKind('featured-activity').concat(byKind('presentation').filter((e) => FEATURED_RE.test(e.sources[0]?.name ?? ''))) },
    { id: 'external-systems', title: '🔬 Externo: systems_reward_* (Director Ops UI)', items: iconsArr.filter((e) => e.sources.some((s) => s.kind === 'external:systems_reward')) },
    { id: 'external-rgateway', title: '🔬 Externo: rgateway raid vendor (9.7)', items: iconsArr.filter((e) => e.sources.some((s) => s.kind === 'external:rgateway')) },
    { id: 'external-engram', title: '🔬 Externo: engramas generic_event / tier 5', items: iconsArr.filter((e) => e.sources.some((s) => s.kind === 'external:engram-tier')) },
    { id: 'external-starburst', title: '🔬 Externo: starburst / weekly / pinnacle', items: iconsArr.filter((e) => e.sources.some((s) => ['external:starburst', 'external:weekly', 'external:pinnacle'].includes(s.kind))) },
    { id: 'external-order', title: '🔬 Externo: order_icon (DIM rich text)', items: iconsArr.filter((e) => e.sources.some((s) => s.kind === 'external:order_icon')) },
    { id: 'objective-strict', title: 'Weekly Raid/Dungeon Challenge (objetivos)', items: byKind('objective-strict') },
    { id: 'objective', title: 'Otros objetivos challenge/weekly', items: byKind('objective') },
    { id: 'modifier', title: 'Modificadores de actividad', items: byKind('modifier') },
    { id: 'ui-static', title: 'UI estático Bungie (tier overlays, featured flag)', items: byKind('ui-static') },
    { id: 'icon-file', title: 'Iconos API (challenge, weekly, tier5…)', items: byKind('icon-file') },
    { id: 'record', title: 'Triunfos (Editor\'s Choice, etc.)', items: byKind('record').filter((e) => /editor|choice|challenge|weekly/i.test(e.sources[0]?.name ?? '')) },
  ];

  const nav = sections.map((s) => `<a href="#${s.id}">${esc(s.title)}</a>`).join('');
  const body = sections
    .map((s) => {
      const unique = [...new Map(s.items.map((i) => [i.localName, i])).values()];
      return `<section id="${s.id}"><h2>${esc(s.title)}</h2><div class="count">${unique.length} iconos</div><div class="grid">${unique.map(card).join('')}</div></section>`;
    })
    .join('');

  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><title>Iconos desafíos</title>
<style>body{font-family:system-ui,sans-serif;background:#0a0a0a;color:#eee;padding:24px;max-width:1600px;margin:0 auto}
h1{margin:0 0 8px}.sub{color:#999;margin:0 0 20px;line-height:1.6}
nav{background:#161616;padding:12px 16px;border-radius:8px;margin-bottom:28px;display:flex;flex-wrap:wrap;gap:8px 14px}
nav a{color:#7ec8ff;font-size:12px}section{margin:44px 0}h2{font-size:1.05rem;border-bottom:1px solid #333;padding-bottom:8px}
.count{color:#666;font-size:12px;margin:8px 0 14px}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:12px}
.card{background:#141414;border:1px solid #262626;border-radius:10px;padding:12px}.card:hover{border-color:#5b9aff}
.card img{width:80px;height:80px;object-fit:contain;background:#000;border-radius:6px;display:block;margin:0 auto 8px}
.file{font-family:monospace;font-size:10px;color:#7ec8ff;word-break:break-all}.name{font-size:11px;font-weight:600;margin:6px 0 2px}
.ctx{font-size:10px;color:#777}.tag{font-size:9px;background:#1a2a1a;color:#8f8;padding:1px 5px;border-radius:3px}
.note{background:#1a1a2a;border:1px solid #333;border-radius:8px;padding:14px 16px;margin:0 0 24px;font-size:13px;line-height:1.6;color:#bbb}
</style></head><body><h1>Iconos — Desafío semanal / destacadas</h1>
<p class="sub"><code>npm run dev</code> → <a href="/featured-icon-picker.html" style="color:#7ec8ff">/featured-icon-picker.html</a><br>
Dime el <strong>nombre del archivo</strong> del icono correcto (hexágono turquesa + triángulo blanco).</p>
<div class="note"><strong>Búsqueda externa (DIM, destiny-icons, guías 9.7):</strong> Los objetivos &quot;Weekly Raid/Dungeon Challenge&quot; no tienen icono en el manifiesto (<code>iconHash: 0</code>). DIM no aloja este badge del Director — usa <code>featured-flag.png</code> solo para ítems <code>isFeaturedItem</code>. Las guías mencionan un &quot;starburst dorado&quot;, pero <code>v736_starburst_watermark</code> es el triunfo Editor&apos;s Choice. Los badges <code>systems_reward_*</code> y <code>rgateway_*</code> son los candidatos más nuevos del Update 9.7 / Edge of Fate.</div>
<nav>${nav}</nav>${body}</body></html>`;

  writeFileSync(HTML_PATH, html);

  console.log(`Downloaded ${downloaded}/${iconMap.size} icons → ${OUT_DIR}`);
  console.log(`Data → ${DATA_PATH}`);
  console.log(`Gallery → ${HTML_PATH}`);
  for (const s of sections) {
    const n = [...new Map(s.items.map((i) => [i.localName, i])).values()].length;
    console.log(`  ${s.id}: ${n}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
