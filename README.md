# KARUKERA — Island Clash

Original Caribbean anime action **browser prototype**, inspired by the movement and combat rhythm of the supplied reference clip. It runs without Unreal installation and remains separate from the UE5 source project at `/workspace/Karukera`.

Open the existing private play URL and choose **PLAY — ISLAND CLASH**. Click the game to capture the mouse. The explore option starts in Anse-aux-Bèts; the Morne des Esprits button goes to the rival. Use a modern browser with WebGL enabled. Pointer-lock alternatives include arrow-key camera rotation, gamepad sticks and touch dragging.

| Action | Keyboard / mouse | Standard gamepad |
| --- | --- | --- |
| Move / camera | WASD / mouse | Left / right stick |
| Jump / double jump / wall jump | Space | A |
| Sprint / wall run | Hold Shift beside wall | Hold L3 |
| Light / heavy launcher | J or LMB / K or RMB | X / Y |
| Guard / timed parry | Q | LB |
| Dodge | Ctrl | B |
| Lock target | Tab | R3 |
| Four powers | 1 / 2 / 3 / 4 | D-pad up / right / down / left |
| 3D aerial pursuit | E | RT |
| Dorlis escape | F | LT |
| Cœur des Îles ultimate | 5 | RB |
| Outfit / restart / sound / pause | C / R / M / P | Pause via Menu |

Start with **Tab → E → K → J**: acquire the rival, close the gap, launch, then follow up in the air. Use **F** when hit to escape. The ultimate begins half-charged in training; build it through combat, then press **5**. Light input can queue once near the end of recovery. Use **2** for Manman Dlo healing. Guard faces forward, and a well-timed guard can parry. Two escape charges regenerate individually.

## Playable heroes (concept-sheet pass)

Four original fighters built from the project's concept sheets in `dist/art/heroes.js`. Each is sculpted from smooth curved geometry with painted cloth, an anime face and ink outlines, and runs on the shared skeleton, so every combat pose still works.

| Hero | Look |
| --- | --- |
| **Toussaint** · Gadyen Fò | Steel pauldrons and plates, black long coat with crimson trim, rope belt and tabard, locs in a top bun, goatee |
| **Léo Zéklè** · Storm runner | Cropped black/yellow jacket with lightning bolts, cargo pants, patterned hip wrap, banded locs, grin |
| **Ansèlm** · Kenbwazè | Purple spirit-flame robe with wide sleeves, bead necklace, talismans, long mane over one eye |
| **Yana** · Fi Manman Dlo | White scale top, blue obi, gold rope, teal sea-dragon cape, golden horns and long wavy hair |

Pick a fighter and a rival on the title screen; **C** switches fighter mid-session. The ground is now painted (brushed grass, organic dirt patches with dark rims, grass-tuft cards) and the arena walls are panelled concrete.

## Anime arena look (reference-clip pass)

The presentation now follows the look of the supplied gameplay clips — bright cel-shaded arena brawler — while staying original and Caribbean. See [Docs/ANIME_LOOK.md](Docs/ANIME_LOOK.md).

- **Rendering:** `dist/systems/anime-post.js` adds depth-based ink outlines, soft bloom on VFX, a vivid colour grade, vignette and impact flash. Falls back to plain rendering automatically; add `?nopost` to the URL to force it off.
- **World:** painted blue sky dome, cel-shaded cumulus clouds, lush grass with dirt paths, flamboyant and mango trees, brighter stone, vivid lagoon sea.
- **Fighters:** heavier ink outlines, a Madras-cloth cape, rim-lit flame auras during pursuit, casting, dashes and the ultimate.
- **VFX:** Kalinago petroglyph-inspired casting circles, comic impact stars with ink streaks, thicker pursuit streaks, ink-smear strokes on the ultimate.
- **HUD:** points scoreboard (real damage dealt + finish bonus), big italic clock, portrait medallion with long health/energy bars, circular ability buttons, red lock-on ring and overhead rival nameplate, comic "HITS" counter that follows the rival, Creole onomatopoeia pops (BIM! KOUT! KABOUM!), K.O. stamp, Madras ultimate cut-in, speed lines. Comic lettering uses the bundled Bangers font (SIL OFL, `dist/vendor/fonts`).

## Current milestone

- Shaped, jointed anime fighters with original faces, locs, Madras/linen clothing, half-capes and varied combat poses.
- Morne des Esprits carved coastal-ruins court, stelae, tropical vegetation, fort/Creole skyline, sea animation and roof gallery; village exploration remains available.
- Pursuit through 3D space, hitstun escape, charged multi-impact ultimate and existing offline battle mechanics.
- Filled elemental effects, curved pursuit streaks, afterimages, spirit petals, landing dust and optional synthesized percussion/combat sound.
- Exact movement/camera obstruction queries and substepped gameplay time.

See [video milestone details, file inventory and remaining work](Docs/VIDEO_MILESTONE.md). Prior milestone notes are preserved in [UPGRADE.md](Docs/UPGRADE.md).

## Verification

`node tests/gameplay.cjs` passes **51 gameplay simulations** using real Three.js geometry/transforms/math with mocked DOM/WebGL. All application JavaScript files pass `node --check`. These checks do not establish rendered appearance or hardware compatibility. CPU pose projections help inspect geometry but omit textures and WebGL shading. Managed browser control is unavailable, so browser rendering, physical controllers, touch input, audio playback and actual frame rate remain unverified.

The game's character assets and animation are procedural. It is not yet at the supplied commercial clip's character/animation fidelity. There is one AI rival, no online team multiplayer, campaign, full character editor, authored production animations or packaged UE build. The AI may still get blocked on complex rooftop routes. Next priorities are actual browser/device capture and tuning, authored original characters/animations, and a compiled UE integration.

## Files

`dist/index.html`, `dist/style.css`, `dist/game.js`: title/appearance menus, game, HUD and controls.

`dist/art/fighters.js`, `effects.js`, `islands.js`: original character geometry/pose animation, bounded VFX and Caribbean scenery.

`dist/systems/kinematics.js`, `audio.js`: swept collision/camera queries and original synthesized sound.

`tests/gameplay.cjs`: executable simulation suite. `.openai/hosting.json`: existing private static-site identity. `dist/vendor/three.min.js` and its MIT license are bundled locally; no runtime CDN is needed.
