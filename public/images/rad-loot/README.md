# RAD Loot images

## Home banner (`RAD Loot`)

| | |
|---|---|
| **Path** | `public/images/banners/rad-loot.webp` |
| **Size** | **2400 × 640 px** (same as other home banners) |
| **Ratio** | 15 : 4 |

## Activity page header (e.g. Vault of Glass, Crota's End)

Full-width strip, **200 px tall** on screen. The image uses `background-size: cover`, so it crops to fill width on any device.

| | |
|---|---|
| **Path** | `public/images/rad-loot/headers/{slug}-header.webp` (e.g. `vault-of-glass-header.webp`, `crotas-end-header.webp`) |
| **Recommended size** | **2400 × 400 px** (6 : 1) |
| **Minimum** | **1200 × 200 px** |

**Design tips:**

- Keep the **bottom-left** area readable for the title (dark or uncluttered).
- Important art in the **center/right**; edges may crop on mobile.
- Export as WebP or JPG, sRGB.

## Small activity banners

Banners are **140 px** tall on screen. The page uses two columns on desktop (~470 px wide each).

Design your image at a proportion close to what is visible on screen (~**3.4 : 1**), not ultra-wide art that will crop heavily with `object-cover`.

| | |
|---|---|
| **Path** | `public/images/rad-loot/activities/{filename}` |
| **Recommended size** | **480 × 140 px** (matches desktop column width) |
| **Alternative** | **960 × 280 px** for Retina, or **1400 × 350 px** (4 : 1) with key art on the left |
| **Format** | WebP or JPG, sRGB |

Images use `object-cover` anchored to the **left**. Keep title and key art on the left; the right edge may crop slightly on wider viewports.

## Featured icon (weekly rotator)

| | |
|---|---|
| **Path** | `public/images/rad-loot/featured.png` |
| **Border** | `#24b4b3` on featured raid/dungeon banners |
| **Usage** | Top-left badge on featured raid/dungeon banners on the RAD Loot index |
| **Data** | Computed at runtime from weekly reset schedule + Bungie milestones (`featured-activities.json` is a fallback snapshot) |

## Armor set previews (activity pages)

One image per activity (all three classes), below the piece icons in the **Armor sets** panel.

| | |
|---|---|
| **Path** | `public/images/armor-set-previews/{slug}.webp` |
| **Recommended width** | **1200 px** (height as needed) |
| **Details** | See `../armor-set-previews/README.md` for the full filename list |
