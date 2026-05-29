# Homepage banner images

Drop your artwork here. The homepage loads these files automatically.

## Recommended size

| | |
|---|---|
| **Dimensions** | **2400 × 640 px** (or **1200 × 320 px** minimum) |
| **Aspect ratio** | **15 : 4** (wide banner) |
| **Format** | WebP (preferred) or JPG |
| **Color profile** | sRGB |

Use **2400 × 640** if you want sharp results on Retina / high-DPI screens.

## File names (required)

| Banner | File path |
|--------|-----------|
| Exotics | `public/images/banners/exotics.webp` |
| Armor sets | `public/images/banners/armor-sets.webp` |

You can also use `.jpg` or `.png` — if you do, update `imageFile` in `src/app/page.tsx`.

## Design tips

- Keep important artwork in the **center** and **right**; text sits on the **bottom-left**.
- Avoid tiny details at the far edges (cropping on small screens).
- Darker images work best; a dark gradient overlay is applied for readability.
- Until you add images, the banners show a colored gradient fallback.
