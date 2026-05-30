# RAD Loot images

## Home banner (`RAD Loot`)

| | |
|---|---|
| **Path** | `public/images/banners/rad-loot.webp` |
| **Size** | **2400 × 640 px** (same as other home banners) |
| **Ratio** | 15 : 4 |

## Activity page header (e.g. Vault of Glass)

Full-width strip, **200 px tall** on screen. The image uses `background-size: cover`, so it crops to fill width on any device.

| | |
|---|---|
| **Path** | `public/images/rad-loot/headers/vault-of-glass-header.webp` |
| **Recommended size** | **2400 × 400 px** (6 : 1) |
| **Minimum** | **1200 × 200 px** |

**Design tips:**

- Keep the **bottom-left** area readable for the title (dark or uncluttered).
- Important art in the **center/right**; edges may crop on mobile.
- Export as WebP or JPG, sRGB.

## Small activity banners

Banners are **140 px** tall on screen. The page layout stays narrow (two columns, ~470 px wide each on desktop).

Design your image at **1400 px** wide — that is the artboard size, not the CSS width on screen. A 1400 px-wide file avoids the heavy cropping you get with ultra-wide images (e.g. 2400 px).

| | |
|---|---|
| **Path** | `public/images/rad-loot/activities/{filename}` |
| **Recommended size** | **1400 × 350 px** (4 : 1) |
| **Format** | WebP or JPG, sRGB |

Images use `object-cover` anchored to the **left**. Keep title and key art on the left; the right edge may crop slightly on desktop columns (~3.4 : 1 visible).
