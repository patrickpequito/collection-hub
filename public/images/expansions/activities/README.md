# Expansion index banners

Small cards on **Expansions & Seasons** (`/expansions`), left column.

Same specs as RAD Loot activity banners (**140 px** tall on screen).

| | |
|---|---|
| **Path** | `public/images/expansions/activities/{slug}.webp` |
| **Recommended size** | **480 × 140 px** (desktop column) |
| **Alternative** | **960 × 280 px** Retina, or **1400 × 350 px** (4 : 1) with key art on the left |
| **Format** | WebP or JPG, sRGB |

Images use `object-cover` anchored to the **left**. Keep the title area readable on the left.

Until a dedicated file exists, the page falls back to RAD activity art when configured.

## Filenames

| Expansion | File |
|-----------|------|
| Red War | `red-war.webp` |
| Curse of Osiris | `curse-of-osiris.webp` |
| Warmind | `warmind.webp` |
| Forsaken | `forsaken.webp` |
| Shadowkeep | `shadowkeep.webp` |
| Beyond Light | `beyond-light.webp` |
| The Witch Queen | `the-witch-queen.webp` |
| Lightfall | `lightfall.webp` |
| The Final Shape | `the-final-shape.webp` |
| The Edge of Fate | `the-edge-of-fate.webp` |
| Renegades | `renegades.webp` |

## Page headers (hub pages)

Full-width strip on `/expansions/{slug}`:

`public/images/headers/{slug}-header.webp`

Example: `public/images/headers/the-witch-queen-header.webp`

Recommended **2400 × 400 px** (6 : 1). Until provided, hubs fall back to `public/images/banners/expansions-seasons.webp`.
