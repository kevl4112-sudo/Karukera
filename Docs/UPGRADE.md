# Reference-inspired anime combat upgrade

Applied to the existing browser game and its private Site. The Unreal project was not modified. All visual elements remain original Caribbean interpretations; the provided screenshots guide composition, scale, attack posing and effect readability.

## Changes delivered

**Decor:** taller multistory Creole facades, balconies, louvered windows, weathered drawn-plaster texture, fort bastions, gallery over the arena, physical roof decks/rails, access platforms, broad palm leaves, banana/hibiscus beds, instanced grass and ground patches, giant trees with buttress roots and hanging lianas, overhead lines and moving pennants, graphic clouds. The village and arena remain one contiguous level. The east jungle is an extended decorative route, not a separate mission or map.

**Character:** jointed shoulders/elbows and hips/knees, shaped torso, original facial features, beaded locs, Madras band and sash, structured collar, arm guards, pouch, wraps and trimmed boots. Four cloth palettes and three skin tones still persist locally. Rival has a different palette, shorter locs and an alternate shoulder plate. This is procedural geometry with a transform hierarchy, not a production skinned model.

**Animation/feel:** left jab, right cross, finishing roundhouse, rising heavy, airborne strike variants, separate casting poses for four powers, guard, recoil, running, wall-running, landing compression and cloth/loc motion. Poses blend between transforms; they are not exported animation clips. One input can queue during the last 0.19 seconds of recovery. A connecting heavy permits early airborne follow-up; airborne hits briefly maintain lift. Damage adds a 40–65ms hit stop, modest camera shake and true hit-count feedback. Camera gains a shoulder offset, near-target framing and speed-sensitive field of view. Physical collision checks include overhead platforms.

**VFX:** filled flame core plus rotating bands and trailing sparks; ascending healing rings and motes; eruption columns, dust and ballistic debris; slash arcs, impact streaks and landing dust; lightning streaks and short silhouette afterimages. No production Niagara assets or imported effects are used.

**HUD:** smaller corner health/ability displays, real elapsed duel clock, hit-count feedback and ground team markers. No simulated multiplayer scores or nonfunctional mode controls were added.

## Verification

`node tests/gameplay.cjs`: **30 passing simulations**, using actual Three.js geometry, transforms and math with mocked DOM/WebGL. These cover the previous 18 checks plus finite scene geometry, articulated hand motion, attack buffering, actual aerial follow-up damage, hit-stop/feedback state, bounded/cleared effects, wall obstruction and long-frame projectile sweeps, rooftop floor/underside collision, dynamic prop preservation during batching, all casting poses, and the render-loop/HUD/camera execution path.

All four application/art JavaScript files pass `node --check`. HTML assets are bundled locally. Static scenery is merged into **88 batches from 1,745 static objects**; this is a batching count, not a measured frame-rate result. Effects have a 120-object cap and two fixed 384-particle buffers.

Managed environment has no exposed `cua_repl.js` browser-control tool. Following the Sites managed-preview workflow, browser QA and screenshots were skipped. WebGL appearance/shader compilation, actual performance, pointer lock, touch input and physical gamepad behavior remain unverified. Simulations do not establish visual parity with the screenshots.

## Remaining work / next steps

1. Play-test the deployed version on browser and controller; inspect visual composition, shader compatibility, camera transitions, roof access and 30/60/120fps behavior.
2. Replace procedural fighter geometry/poses with an original rigged character, authored animation clips and reviewed materials; add proper sound assets and more expressive face/hair motion.
3. Improve AI navigation between rooftops. The rival can jump toward elevated targets but still uses direct steering and may become blocked by complex architecture.
4. Integrate the approved direction into the UE5 project when the engine can be built/tested. Campaign, 4v4 multiplayer, grappling, ultimates and additional islands remain outside this browser slice.

## Files changed

- `dist/game.js`: integrated new visuals, combat animation state, aerial chain/buffer, hit feedback, exact segment obstruction, swept projectile motion, overhead collision, camera, HUD and reset cleanup.
- `dist/index.html`: art scripts, hit-count/clock elements, updated in-game help and title copy.
- `dist/style.css`: combat-focused corner HUD and responsive refinements.
- `dist/art/fighters.js`, `dist/art/effects.js`, `dist/art/islands.js`: new modular character, effects and world systems.
- `tests/gameplay.cjs`: original checks retained and expanded to 30.
- `README.md`, `Docs/UPGRADE.md`: launch/controls, scope and verification record.

Launch and controls remain unchanged: click PLAY on the existing URL. Try Heavy (K/right mouse), then tap Light (J/left mouse) for the aerial follow-up. Use the stepped blocks near either side of the arena entrance to reach the roof gallery.
