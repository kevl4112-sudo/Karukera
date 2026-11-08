/* Real Three.js scene/math; mocked WebGL and DOM. Browser rendering is not covered. */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..');const Three=require(path.join(root,'dist/vendor/three.min.js'));
const handlers={};function element(id=''){return {id,style:{},dataset:{},classList:{add(){},remove(){},toggle(){}},textContent:'',onclick:null,addEventListener(type,fn){handlers[id+':'+type]=fn;},querySelector(){return element();},setPointerCapture(){},requestPointerLock(){},getContext(){return {beginPath(){},moveTo(){},lineTo(){},stroke(){},fillRect(){},strokeRect(){},fillText(){},fillStyle:'',strokeStyle:'',lineWidth:0,textAlign:'',font:''};}};}
const elements=new Map();const doc={body:element('body'),pointerLockElement:null,getElementById(id){if(!elements.has(id))elements.set(id,element(id));return elements.get(id);},createElement(){return element();},querySelectorAll(){return [];},exitPointerLock(){}};
const FakeRenderer=class{constructor(){this.shadowMap={};}setPixelRatio(){}setSize(){}render(){}};
const sandbox={console,document:doc,THREE:{...Three,WebGLRenderer:FakeRenderer},innerWidth:1440,innerHeight:900,devicePixelRatio:1,performance:{now:()=>0},requestAnimationFrame(){},setTimeout(){},URLSearchParams,location:{search:'?test'},localStorage:{getItem(){return null;},setItem(){}},navigator:{getGamepads:()=>[]},addEventListener(type,fn){handlers[type]=fn;}};sandbox.window=sandbox;
vm.createContext(sandbox);for(const file of ['art/fighters.js','art/effects.js','art/islands.js','systems/kinematics.js','systems/audio.js','systems/anime-post.js','game.js'])vm.runInContext(fs.readFileSync(path.join(root,'dist',file),'utf8'),sandbox,{filename:file});
const g=sandbox.KarukeraTest;assert(g,'game finished initialization');
let count=0;function test(name,fn){g.reset(true);fn();count++;console.log('PASS',name);}function playerStep(n=12){for(let i=0;i<n;i++)g.updatePlayer(.04);}function nearby(z=-24){g.enemy.root.position.set(0,.15,z);}
test('world builds a real 3D scene and collision layout',()=>{assert(g.scene.children.length>30);assert(g.sceneryBatch.sourceMeshes>g.sceneryBatch.batches*3);assert(g.solids.length>20);assert.equal(g.crates.length,7);});
test('light attack resolves once after windup',()=>{nearby();assert(g.attack(g.player,false));assert.equal(g.enemy.hp,140);playerStep();assert.equal(g.enemy.hp,129);assert.equal(g.player.combo,1);});
test('three-hit chain increases finisher damage',()=>{for(let i=0;i<3;i++){nearby();assert(g.attack(g.player,false));playerStep(9);}assert.equal(g.enemy.hp,100);assert.equal(g.player.combo,3);playerStep(40);assert.equal(g.player.combo,0);});
test('heavy attack launches and respects stamina gate',()=>{nearby();assert(g.attack(g.player,true));playerStep();assert.equal(g.enemy.hp,114);assert(g.enemy.vy>0);g.player.stamina=0;assert.equal(g.attack(g.player,false),false);});
test('front guard reduces damage and parry rejects it',()=>{nearby();g.enemy.block=true;g.enemy.blockAge=.5;const hit=g.damage(g.enemy,20,g.player);assert(hit>0&&hit<5);g.enemy.blockAge=.05;const hp=g.enemy.hp;assert.equal(g.damage(g.enemy,20,g.player),0);assert.equal(g.enemy.hp,hp);assert(g.player.recovery>0);});
test('guard from behind is bypassed',()=>{nearby();g.enemy.angle=0;g.enemy.block=true;g.enemy.blockAge=.5;assert.equal(g.damage(g.enemy,20,g.player),20);});
test('dodge costs stamina and grants immunity',()=>{nearby();assert(g.dodge());assert.equal(g.player.stamina,76);const hp=g.player.hp;assert.equal(g.damage(g.player,30,g.enemy),0);assert.equal(g.player.hp,hp);});
test('double jump allows two impulses and landing resets it',()=>{g.jump();assert.equal(g.player.jumps,1);g.jump();assert.equal(g.player.jumps,2);g.jump();assert.equal(g.player.jumps,2);playerStep(100);assert(g.player.ground);assert.equal(g.player.jumps,0);});
test('village safe zone keeps AI idle',()=>{g.reset(false);const before=g.enemy.root.position.clone();for(let i=0;i<100;i++)g.updateAI(.04);assert.equal(g.enemy.root.position.x,before.x);assert.equal(g.enemy.root.position.z,before.z);});
test('arena AI pursues and attacks',()=>{for(let i=0;i<250;i++)g.updateAI(.04);assert(g.enemy.root.position.z>-34);assert(g.player.hp<100);});
test('fire orb travels and damages the rival once',()=>{assert(g.cast(0));for(let i=0;i<40;i++)g.updateEffects(.04);assert.equal(g.enemy.hp,115);assert.equal(g.cast(0),false);});
test('heal restores health and rejects cooldown reuse',()=>{g.player.hp=30;g.player.stamina=20;assert(g.cast(1));assert.equal(g.player.hp,64);assert.equal(g.player.stamina,45);assert.equal(g.cast(1),false);});
test('eruption has a radius and launches',()=>{nearby(-27);assert(g.cast(2));assert.equal(g.enemy.hp,106);assert(g.enemy.vy>0);});
test('lightning dash cannot apply frame-dependent repeat damage',()=>{nearby(-28);assert(g.cast(3));playerStep(8);assert.equal(g.enemy.hp,122);});
test('collision stops movement and dash at walls',()=>{g.player.root.position.set(12,1,-30);g.moveXZ(g.player,5,0);assert(g.player.root.position.x<=13.13);g.player.angle=-Math.PI/2;g.cast(3);playerStep(10);assert(g.player.root.position.x<=13.13);});
test('wall run activates during airborne sprint alongside tagged wall',()=>{g.player.root.position.set(13,2,-30);g.player.ground=false;g.player.vy=0;g.setKey('KeyW',true);g.setKey('ShiftLeft',true);g.updatePlayer(.04);assert.equal(g.player.wall,1);g.jump();assert(g.player.vy>=10);g.setKey('KeyW',false);g.setKey('ShiftLeft',false);});
test('crate damage destroys collision and reset restores it',()=>{const c=g.crates[0];g.player.root.position.set(c.x,.15,c.z+2);g.player.angle=0;g.attack(g.player,true);playerStep();assert(c.hp<=0);assert(g.solids[c.solid].disabled);g.reset(true);assert.equal(c.hp,22);assert.equal(g.solids[c.solid].disabled,false);});
test('lock-on and restart clear target and combat state',()=>{g.start(true);g.toggleLock();assert(g.getState().locked);g.player.hp=0;g.reset(true);assert.equal(g.player.hp,100);assert.equal(g.enemy.hp,140);assert(!g.getState().locked);});
test('all visible geometry has finite coordinates after batching',()=>{let meshes=0;g.scene.traverse(o=>{const a=o.geometry?.attributes.position?.array;if(a){meshes++;for(const value of a)assert(Number.isFinite(value));}});assert(meshes>40);});
test('character hand follows an articulated strike trajectory',()=>{g.attack(g.player,false);g.art.animate(g.player,0,.04);g.scene.updateMatrixWorld(true);const before=g.player.hands[0].getWorldPosition(new Three.Vector3());playerStep(5);g.scene.updateMatrixWorld(true);const after=g.player.hands[0].getWorldPosition(new Three.Vector3());assert(before.distanceTo(after)>.2);assert(g.player.elbows[0].parent===g.player.arms[0]);});
test('early light input is buffered once through recovery',()=>{nearby();g.attack(g.player,false);playerStep(5);assert.equal(g.attack(g.player,false),false);assert(g.player.buffered);playerStep(10);assert.equal(g.player.combo,2);assert.equal(g.enemy.hp,118);assert.equal(g.player.buffered,null);});
test('successful launcher enables an airborne light follow-up',()=>{nearby();g.attack(g.player,true);for(let i=0;i<13;i++)g.step(.04);assert(!g.player.ground);assert(!g.enemy.ground);assert(g.attack(g.player,false));for(let i=0;i<6;i++)g.step(.04);assert(g.enemy.hp<114);});
test('impact sets a brief hit stop and combo feedback',()=>{nearby();g.damage(g.enemy,10,g.player);assert(g.getState().hitStop>0&&g.getState().hitStop<.1);assert.equal(g.getState().comboHits,1);});
test('effect count is bounded and restart clears active effects',()=>{for(let i=0;i<150;i++)g.fx.impact(g.player.root.position,0xffcc88,1);assert(g.fx.active.length<=120);g.reset(true);assert.equal(g.fx.active.length,0);});
test('projectiles stop at walls before damaging a rival behind them',()=>{g.player.root.position.set(12,.15,-30);g.player.angle=-Math.PI/2;g.enemy.root.position.set(20,.15,-30);assert(g.cast(0));for(let i=0;i<40;i++)g.updateEffects(.04);assert.equal(g.enemy.hp,140);});
test('projectile substeps preserve collision during a long frame',()=>{nearby(-28);g.cast(0);g.updateEffects(.5);assert.equal(g.enemy.hp,115);});
test('roof gallery has a traversable floor with underside collision',()=>{g.player.root.position.set(0,7.7,-40);g.player.vy=-1;playerStep(4);assert(g.player.ground);assert(Math.abs(g.player.root.position.y-7.525)<.02);g.player.root.position.set(0,4.6,-40);g.player.vy=10;g.player.ground=false;playerStep(4);assert(g.player.root.position.y+2.3<=7.075+.03);});
test('batched decoration preserves dynamic crates and hanging flags',()=>{for(const c of g.crates)assert(c.mesh.parent===g.scene);assert(g.islandDecor.animated.length>0);const flag=g.islandDecor.animated[0];assert(flag.parent===g.scene);g.islandDecor.update(1);assert(Number.isFinite(flag.rotation.x));console.log('Scenery batches:',g.sceneryBatch.batches,'from',g.sceneryBatch.sourceMeshes,'static objects');});
test('all four power poses animate without nonfinite transforms',()=>{for(let slot=0;slot<4;slot++){g.reset(true);assert(g.cast(slot));playerStep(4);g.scene.updateMatrixWorld(true);g.player.root.traverse(o=>{for(const v of o.matrixWorld.elements)assert(Number.isFinite(v));});}});
test('main render loop, HUD and camera survive combat and pause',()=>{g.start(true);for(let i=1;i<=120;i++)g.frame(i*16.67);g.pauseGame();g.frame(2200);g.pauseGame();g.frame(2217);g.updateHUD();assert(Number.isFinite(g.player.root.position.y));assert(elements.get('timer').textContent.includes(':'));});

// Video-reference mechanics: outcomes, collision boundaries and resource behavior.
test('aerial pursuit closes to melee separation on an elevated target',()=>{
 g.enemy.root.position.set(0,6,-31);const distance=g.player.root.position.distanceTo(g.enemy.root.position);
 assert(g.chase());assert.equal(g.player.stamina,85);assert.equal(g.chase(),false);
 let frames=0;while(g.player.chase>0&&frames++<100)g.updatePlayer(1/60);
 const separation=g.player.root.position.distanceTo(g.enemy.root.position);
 assert(separation>=1.8&&separation<=2.2,`pursuit separation ${separation}`);assert(g.player.root.position.y>4.5);assert(separation<distance/3);assert.equal(g.player.chase,0);
});
test('3D pursuit sweep stops at walls and the gallery underside',()=>{
 g.player.root.position.set(12,1,-30);let result=g.motion.move3D(g.player,new Three.Vector3(10,0,0),g.solids);
 assert(result.blocked);assert(g.player.root.position.x<=13.13);
 g.player.root.position.set(0,2,-40);result=g.motion.move3D(g.player,new Three.Vector3(0,20,0),g.solids);
 assert(result.blocked);assert(g.player.root.position.y+(g.player.collisionHeight||2.3)<=7.075+.03);
});
test('pursuit rejects an obstructed target without spending resources',()=>{
 g.player.root.position.set(12,.15,-30);g.enemy.root.position.set(20,.15,-30);const stamina=g.player.stamina;
 assert.equal(g.chase(),false);assert.equal(g.player.stamina,stamina);assert.equal(g.player.chaseCooldown,0);
});
test('target death and restart cancel pursuit state',()=>{
 g.enemy.root.position.set(0,5,-29);assert(g.chase());g.enemy.hp=0;g.updatePlayer(.02);assert.equal(g.player.chase,0);
 g.reset(true);assert.equal(g.player.chaseTarget,null);assert.equal(g.player.chaseCooldown,0);assert.equal(g.player.chase,0);
});
test('Dorlis escapes hitstun once per charge and respects nearby walls',()=>{
 g.player.root.position.set(12,.15,-30);g.enemy.root.position.set(10,.15,-30);g.player.hurt=.4;g.player.guardBroken=.9;g.player.recovery=.4;g.setKey('KeyD',true);
 assert(g.substitute());g.setKey('KeyD',false);assert.equal(g.player.hurt,0);assert.equal(g.player.guardBroken,0);assert.equal(g.player.subCharges,1);assert(g.player.invuln>.5);assert(g.player.root.position.x<=13.13);assert.equal(g.substitute(),false);
 for(let i=0;i<30;i++)g.updatePlayer(.02);assert(g.substitute());assert.equal(g.player.subCharges,0);assert.equal(g.substitute(),false);
 for(let i=0;i<560;i++)g.updatePlayer(.02);assert.equal(g.player.subCharges,1);assert(g.player.subRecharge>0);
});
test('ultimate requires full charge and consumes it only when accepted',()=>{
 assert.equal(g.unleash(),false);assert.equal(g.player.ultimate,50);g.player.ultimate=100;g.player.hurt=.3;assert.equal(g.unleash(),false);assert.equal(g.player.ultimate,100);
 g.player.hurt=0;g.player.recovery=0;assert(g.unleash());assert.equal(g.player.ultimate,0);assert.equal(g.unleash(),false);assert(g.player.ultimatePose);
});
test('ultimate resolves its burst and three pulses at most once',()=>{
 nearby(-27);g.player.ultimate=100;assert(g.unleash());for(let i=0;i<160;i++)g.updatePlayer(.02);
 assert.equal(g.enemy.hp,68);assert.equal(g.player.ultimatePose,null);const remaining=g.enemy.hp;for(let i=0;i<100;i++)g.updatePlayer(.02);assert.equal(g.enemy.hp,remaining);
});
test('interruption and restart remove pending ultimate damage',()=>{
 nearby(-27);g.player.ultimate=100;assert(g.unleash());g.updatePlayer(.1);g.player.invuln=0;assert(g.damage(g.player,5,g.enemy)>0);assert.equal(g.player.ultimatePose,null);
 for(let i=0;i<150;i++)g.updatePlayer(.02);assert.equal(g.enemy.hp,140);
 g.player.ultimate=100;g.player.hurt=0;g.player.recovery=0;assert(g.unleash());g.reset(true);for(let i=0;i<150;i++)g.updatePlayer(.02);assert.equal(g.enemy.hp,140);assert.equal(g.player.ultimatePose,null);
});
test('exhausted held sprint recovers enough stamina to run again',()=>{
 g.player.stamina=0;g.setKey('ShiftLeft',true);g.setKey('KeyW',true);let maximum=0;
 for(let i=0;i<150;i++){g.updatePlayer(.04);maximum=Math.max(maximum,g.player.stamina);}assert(maximum>25,`stamina only recovered to ${maximum}`);
 g.setKey('ShiftLeft',false);g.setKey('KeyW',false);
});
test('wall jump pushes away from a Z-facing wall',()=>{
 g.player.root.position.set(0,2,-47.05);g.player.ground=false;g.player.vy=0;g.setKey('KeyW',true);g.setKey('ShiftLeft',true);g.updatePlayer(.02);assert.equal(g.player.wall,1);
 g.jump();assert(g.player.dashDir.z>.9);assert(Math.abs(g.player.dashDir.x)<.1);assert(g.player.vy>=10);g.setKey('KeyW',false);g.setKey('ShiftLeft',false);
});
test('guarded heavy attack keeps both fighters grounded',()=>{
 nearby();g.enemy.block=true;g.enemy.blockAge=.5;g.attack(g.player,true);playerStep();
 assert(g.enemy.hp<140&&g.enemy.hp>134);assert.equal(g.enemy.vy,0);assert(g.enemy.ground);assert(g.player.ground);
});
test('20fps render stepping advances one full second of gameplay',()=>{
 g.start(true);g.frame(10000);const initial=g.player.energy=0;
 for(let i=1;i<=20;i++)g.frame(10000+i*50);assert(Math.abs(g.player.energy-initial-4.5)<.02,`energy advanced ${g.player.energy-initial}`);
});
test('camera inertia cannot pass through a thin occluding wall',()=>{
 const wall={x:0,y:3,z:-18,w:8,h:6,d:.06};g.solids.push(wall);
 try{g.updateCamera(.016);const focus=g.player.root.position.clone().add(new Three.Vector3(0,1.5,0));assert(g.camera.position.z<-18.15,`camera z ${g.camera.position.z}`);assert.equal(g.motion.entry(focus,g.camera.position,wall,{x:.1,y:.1,z:.1}),null);}finally{g.solids.pop();}
});
test('anime post falls back to a plain render without render targets',()=>{assert.equal(g.post.supported,false);assert.equal(g.post.enabled,false);g.post.render();g.post.update(.1);});
test('hits award real points and spawn comic pops near the target',()=>{nearby();assert(g.attack(g.player,false));playerStep();const st=g.getState();assert.equal(st.points[0],11);assert(g.pops.some(p=>p.life>0&&/!$/.test(p.el.textContent)));g.updateAnimeLayer(.016);});
test('rival K.O. adds the finish bonus and starts the stamp',()=>{nearby();g.enemy.hp=5;g.damage(g.enemy,10,g.player);const st=g.getState();assert.equal(st.points[0],25);assert(st.koTime>0);assert(g.pops.some(p=>p.el.textContent==='FINISH +20'));});
test('ultimate starts the cut-in and pursuit raises the aura',()=>{g.player.ultimate=100;assert(g.unleash());assert(g.getState().cutinTime>0);for(let i=0;i<10;i++)g.updateAnimeLayer(.03);assert(g.getState().auraLevel[0]>.5);assert(g.auras[0].visible);g.reset(true);for(let i=0;i<40;i++)g.updateAnimeLayer(.05);assert(g.getState().auraLevel[0]<.05);assert.equal(g.getState().points[0],0);});
test('lock-on ring follows the rival only while locked',()=>{g.start(true);nearby(-27);g.toggleLock();g.updateAnimeLayer(.016);assert(g.lockRing.visible);assert(Math.abs(g.lockRing.position.z-(-27))<1e-6);g.toggleLock();g.updateAnimeLayer(.016);assert.equal(g.lockRing.visible,false);});
test('sigil and impact-star effects stay within the effect cap',()=>{for(let i=0;i<80;i++){g.fx.sigil(g.player.root.position);g.fx.hitSpark(g.player.root.position,true);}assert(g.fx.active.length<=120);for(let i=0;i<60;i++)g.fx.update(.05);assert.equal(g.fx.active.length,0);});
console.log(`${count} gameplay simulations passed. WebGL rendering and physical controller unverified.`);
