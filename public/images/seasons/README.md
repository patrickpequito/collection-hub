# Season & expansion badge icons

High-resolution PNGs for the clickable version badges on weapon pages (`WeaponSeasonBadges`).

## Location

Place each file here:

```
public/images/seasons/{slug}.png
```

## Naming

The filename is the **season label slug**: lowercase, no apostrophes, non-alphanumeric characters become hyphens. Same rules as weapon slugs in `generate-all-loot.mjs`.

| File | Season / expansion label |
|------|--------------------------|
| `monument-of-triumph.png` | Monument of Triumph |
| `renegades.png` | Renegades |
| `the-edge-of-fate.png` | The Edge of Fate |
| `s26-episode-heresy.png` | S26 Episode: Heresy |
| `s25-episode-revenant.png` | S25 Episode: Revenant |
| `s24-episode-echoes.png` | S24 Episode: Echoes |
| `the-final-shape.png` | The Final Shape |
| `into-the-light.png` | Into the Light |
| `s23-season-of-the-wish.png` | S23 Season of the Wish |
| `s22-season-of-the-witch.png` | S22 Season of the Witch |
| `s21-season-of-the-deep.png` | S21 Season of the Deep |
| `s20-season-of-defiance.png` | S20 Season of Defiance |
| `lightfall.png` | Lightfall |
| `s19-season-of-the-seraph.png` | S19 Season of the Seraph |
| `s18-season-of-plunder.png` | S18 Season of Plunder |
| `s17-season-of-the-haunted.png` | S17 Season of the Haunted |
| `s16-season-of-the-risen.png` | S16 Season of the Risen |
| `the-witch-queen.png` | The Witch Queen |
| `s15-season-of-the-lost.png` | S15 Season of the Lost |
| `s14-season-of-the-splicer.png` | S14 Season of the Splicer |
| `s13-season-of-the-chosen.png` | S13 Season of the Chosen |
| `s12-season-of-the-hunt.png` | S12 Season of the Hunt |
| `beyond-light.png` | Beyond Light |
| `s11-season-of-arrivals.png` | S11 Season of Arrivals |
| `s10-season-of-the-worthy.png` | S10 Season of the Worthy |
| `s9-season-of-dawn.png` | S9 Season of Dawn |
| `s8-season-of-the-undying.png` | S8 Season of the Undying |
| `shadowkeep.png` | Shadowkeep |
| `s7-season-of-opulence.png` | S7 Season of Opulence |
| `s6-season-of-the-drifter.png` | S6 Season of the Drifter |
| `s5-season-of-the-forge.png` | S5 Season of the Forge |
| `forsaken.png` | Forsaken |
| `warmind.png` | Warmind |
| `curse-of-osiris.png` | Curse of Osiris |
| `red-war.png` | Red War |

You only need files for seasons you have art for. Missing files fall back to the Bungie watermark icon automatically.

## Event badges

Weapons from limited-time events (30th Anniversary, Solstice, Festival of the Lost, etc.) use these filenames on weapon pages when the catalog has an `eventLabel`:

| File | Event |
|------|-------|
| `30th-anniversary.png` | 30th Anniversary |
| `solstice.png` | Solstice |
| `festival-of-the-lost.png` | Festival of the Lost |
| `the-dawning.png` | The Dawning |
| `crimson-days.png` | Crimson Days |
| `guardian-games.png` | Guardian Games |
| `moments-of-triumph.png` | Moments of Triumph |
| `call-to-arms.png` | Call to Arms |
| `the-revelry.png` | The Revelry |

## Recommended size

Badges render at **40–48 px** on screen but use `object-fit: cover` inside a square. **128 × 128 px** or **256 × 256 px** PNG (square, transparent background) is a good source size.
