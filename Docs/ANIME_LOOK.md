# Anime arena look — reference-clip pass

## What the clips show

Three vertical phone captures of third-person anime arena brawlers. Shared traits: bright saturated cel shading with dark ink outlines, blue skies with big white cumulus, grass training grounds and stone pillars, glowing elemental VFX with bloom, blue pursuit streaks, character auras, purple/red ground circles under fighters, a points scoreboard top-left, an italic match clock top-right, a portrait + long health bar bottom-left, circular ability icons bottom-right, enemy nameplates with small bars, a red lock-on ring, a comic-lettered hit counter ("3 HITS") beside the target, a "K.O." stamp and "Finish +20" score text, and ink-smear/speed-line impact frames on specials.

These are genre conventions. Nothing from the clips (characters, names, art, UI assets, levels) is copied; every element is redrawn as an original Caribbean interpretation.

## Caribbean translation

| Genre element | KARUKERA version |
| --- | --- |
| Casting circle | Kalinago petroglyph-inspired faces and spirals (after the rock carvings of Trois-Rivières) |
| Hit onomatopoeia | Creole/French comic words: BIM!, BAP!, PAW!, KOUT!, KRAK!, BLAM!, KABOUM!, PARÉ!, BLOK! |
| Cut-in banner, ultimate gauge, portrait ring, player chips | Madras plaid stripes |
| Training-ground trees | Flamboyant (Delonix regia) and mango trees |
| Skyline | Blue anime sky over a turquoise lagoon, palms, Creole houses and the volcano |
| Fighter cape | Madras cloth instead of plain linen |

## Files

- `dist/systems/anime-post.js` (new): HDR scene target with MSAA + depth texture, bright-pass and two-iteration separable blur bloom, composite with reciprocal-depth second-derivative ink lines, saturation and contrast grade, soft shoulder, vignette, flash. Falls back to `renderer.render` if render targets are unavailable or a pass throws; `?nopost` disables it.
- `dist/game.js`: sky dome, brighter lighting and toon ramp, grass island with beach rim and dirt patches, the presentation layer (lock ring, auras, pops, points, K.O., cut-in, speed lines, nameplate), hooks in damage/parry/K.O./ultimate/cast/heavy, a wider camera, the result screen delayed so the K.O. stamp shows first.
- `dist/art/effects.js`: `hitSpark`, `sigil`, `makeAura`, bolder streaks and slashes, ink-smear strokes in the ultimate.
- `dist/art/islands.js`: `tree` (flamboyant and mango), cel-shaded cloud ring, grass arena floor, brighter stone, a sea shader with foam bands.
- `dist/art/fighters.js`: thicker outline hull, Madras cape.
- `dist/index.html`, `dist/style.css`: new HUD markup and stylesheet.
- `dist/vendor/fonts`: Bangers woff2 (latin and latin-ext) plus its OFL license.

## Verification

- `node tests/gameplay.cjs`: 49 passing (43 earlier tests plus 6 new ones covering the post fallback, points and pops, the K.O. bonus, the cut-in and auras, the lock ring and the effect cap).
- Rendered in headless Chromium (SwiftShader WebGL) at 1280×720: the post pass compiles and runs (`supported: true`) with no console errors. Menu, village, arena, combo, eruption, ultimate cut-in and K.O. screens were checked by eye.
- Not verified: real-GPU frame rate (SwiftShader is software), mobile and touch layout on a real device, gamepads.
