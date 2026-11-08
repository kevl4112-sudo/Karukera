# Video-reference milestone — Island Clash

## What was studied

The supplied clip is 29.83 seconds, 576 × 1024, with landscape gameplay embedded in the vertical frame. Nine samples spanning the clip plus a larger action-frame crop were inspected. Its key rhythm is long three-dimensional lock-on pursuit, short airborne exchanges, bright contact pauses, escape bursts and a large special payoff. The reference is used for movement, framing and effect timing; it is not included in the published game's files.

## Delivered behavior

- **E / RT — aerial pursuit:** consumes 15 stamina, closes on the rival in three dimensions, stops about two meters away, supports elevated targets, and has a 1.3-second reuse cooldown. The target must be alive, within 45m and unobstructed. A swept collision query stops the fighter at walls/ceilings. The rival can also pursue elevated players.
- **F / LT — Dorlis spirit escape:** two charges; each recharges in 11 seconds. Cancels hitstun/guard-break/queued attack and sweeps six meters in movement direction (or away from the rival). Grants 0.65 seconds of immunity. Walls stop movement. Original tropical petals and smoke mark the escape.
- **5 / RB — Cœur des Îles:** requires 100% charge. Training starts at 50%; charge grows through fighting and slowly over time. A 0.85-second wind-up triggers a radial 48-damage launch, followed by three eight-damage pulses. Damage respects obstruction, range, guard and invulnerability. The action can be interrupted after its initial invulnerability; interruption/restart cancels pending pulses. Gold, turquoise and fire-colored spirals mark the real impact sequence.
- Existing three-hit combo, heavy launcher/air follow-up, four equipped powers, guard/parry, dodge, double jump, sprint, wall run/jump and outfit/skin selection remain available.

## Art and feel

Morne des Esprits adds a circular carved-basalt court, tidal sigil, cracked carved stelae, monumental arch, coastal fort silhouettes, Creole facades, animated turquoise sea, tropical trees/lianas/ferns/hibiscus and Madras pennants. The village remains accessible. Static scenery is merged into 112 batches from 1,828 source objects; this is not a measured frame-rate result.

The original fighters have reshaped anime faces, tapered athletic proportions, curved swept locs, asymmetric linen/Madras outfits, boots, arm guards, jewelry and a deforming half-cape. Locomotion, punches/kicks, pursuit, escape and ultimate have separate blended poses. These are procedural models and hierarchy animation, not commercial character assets or authored motion-capture clips.

VFX now include curved blue pursuit streaks, spirit petals, filled impact flashes, stronger flame ribbons, fixed effect anchors and a layered charge/burst special. Two fixed 384-particle buffers and a 120-effect-root limit bound allocation. Optional original synthesized percussion, footsteps and layered combat cues add sound without runtime downloads. Sound can be muted with M or in Pause.

The lock camera accounts for vertical separation, uses exact expanded-box obstruction queries and snaps inward before smoothing outward. Gameplay time is substepped so 20fps does not slow simulation to 80% speed.

## Bugs corrected

- Invalid cel-gradient byte 270 wrapped to 14; all gradient bytes are valid now.
- Exhausted held sprint no longer prevents stamina recovery.
- Wall jumps use the contacted wall's outward normal instead of the player's X sign.
- A blocked heavy no longer launches either fighter.
- Camera inertia cannot interpolate through thin walls.
- Arena ground collider now agrees with the stone court's visible surface.
- Generated texture/normal layouts stay separate when static geometry is batched.
- Eruption/healing effects snapshot their origin instead of drifting with the fighter.
- Evicting an effect at the cap also releases its owned geometry.

## Validation and limits

`node tests/gameplay.cjs`: **43 passing simulation checks** with real Three.js scene geometry/math/transforms and mocked DOM/WebGL. Checks cover original combat, animation movement, buffered/air combos, powers, exact projectile and movement obstruction, roof collision, new pursuit/escape/ultimate behavior, resource/reset/interruption semantics, exhausted sprint, wall normals, 20fps timing and camera obstruction. The JavaScript files pass syntax checking. Local HTML asset references are checked before packaging.

CPU geometry projections were used to inspect fighter proportions and pose direction, and exposed a backward-leaning torso bug that was corrected. They do not reproduce WebGL textures/shaders or establish rendered appearance.

The managed browser-control tool (`cua_repl.js`) is unavailable in this executor. Under the Sites workflow, no alternate browser-control route was used. **WebGL rendering, shader compilation, actual performance, physical controller/touch input and audio playback remain unverified.** This is a deeper playable browser prototype, not a verified visual match to the commercial reference. UE5 is still not installed here, and the separate UE source was not rebuilt or modified for this milestone.

## Launch and files

Use the existing private play URL and select **PLAY — ISLAND CLASH**. All prior controls remain; new controls are E/RT, F/LT and 5/RB. The standalone offline HTML contains the same bundled scripts and generated assets.

Modified: `dist/game.js`, `dist/art/fighters.js`, `dist/art/effects.js`, `dist/art/islands.js`, `dist/index.html`, `dist/style.css`, `tests/gameplay.cjs`, `README.md`.

Created: `dist/systems/kinematics.js`, `dist/systems/audio.js`, `Docs/VIDEO_MILESTONE.md`.

## Next quality gates

1. Browser/device play-test and measured GPU/frame-time checks; tune camera, visibility and effect intensity from captured footage.
2. Authored original character mesh/skin, animation clips, hand/foot contact and cinematic sound assets; visual review against the clip at equivalent camera angles.
3. Improve rooftop AI navigation, arena boundaries and combat balance. The current AI still uses direct steering plus jumps/pursuit.
4. Bring the approved art/combat direction into a compiled UE5 build; online teams, campaign, full character editor and additional island maps remain separate milestones.
