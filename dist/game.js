/* KARUKERA · original offline browser prototype · Three.js MIT */
'use strict';
(function(){
const $=id=>document.getElementById(id), clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
if(typeof THREE==='undefined'){ $('loadstatus').textContent='The 3D engine could not load. Reload to try again.';return; }
const T=THREE, art=window.KarukeraArt, motion=window.KarukeraMotion, canvas=$('game');const audioBus=new window.KarukeraAudio();let renderer;
try{renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});}catch(e){$('loadstatus').textContent='WebGL is unavailable. Enable hardware acceleration in your browser, then reload.';return;}
renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;
const scene=new T.Scene();scene.background=new T.Color(0x8fd0f2);scene.fog=new T.Fog(0xbfe6f4,85,230);
const camera=new T.PerspectiveCamera(62,innerWidth/innerHeight,.1,330);
const post=window.KarukeraPost?window.KarukeraPost(renderer,scene,camera):{enabled:false,flash:0,boost:0,render(){renderer.render(scene,camera);},setSize(){},setEnabled(){},update(){}};if(new URLSearchParams(location.search).has('nopost'))post.setEnabled(false);post.setSize(innerWidth,innerHeight,Math.min(devicePixelRatio,1.75));
scene.add(new T.HemisphereLight(0xdff4ff,0x7a9a5c,1.9));const sun=new T.DirectionalLight(0xfff0d2,2.55);sun.position.set(-30,55,25);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-65;sun.shadow.camera.right=65;sun.shadow.camera.top=65;sun.shadow.camera.bottom=-65;sun.shadow.bias=-.0005;scene.add(sun);
// Painted anime sky dome: deep zenith blue fading to a bright sea-haze horizon (follows the camera).
const sky=new T.Mesh(new T.SphereGeometry(310,32,16),new T.ShaderMaterial({side:T.BackSide,depthWrite:false,fog:false,vertexShader:'varying vec3 vDir;void main(){vDir=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec3 vDir;void main(){float h=vDir.y;vec3 horizon=vec3(.52,.79,.905),mid=vec3(.16,.47,.86),zenith=vec3(.03,.2,.72);vec3 c=mix(horizon,mid,smoothstep(.0,.22,h));c=mix(c,zenith,smoothstep(.22,.8,h));gl_FragColor=vec4(c,1.);\n#include <colorspace_fragment>\n}'}));sky.renderOrder=-1;sky.frustumCulled=false;sky.userData.dynamic=true;scene.add(sky);
const solids=[],crates=[],effects=[],projectiles=[];const fx=new art.FX(scene);let time=0,started=false,paused=false,ended=false,locked=false,yaw=0,pitch=.22,shake=0,toastTime=0,soundOn=true,audio=null,round=0,hitStop=0,duelTime=0,comboHits=0,comboAge=0,reducedMotion=!!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
const keys=new Set(),colors=[0x16b8ab,0xeb773d,0x9169dc,0xeee1b3],skins=[0x583321,0x925435,0xc08758];let outfit=0,skin=0;
try{const s=JSON.parse(localStorage.getItem('karukera-look')||'{}');outfit=clamp(s.outfit||0,0,3);skin=clamp(s.skin||0,0,2);}catch{}
const gradient=new T.DataTexture(new Uint8Array([120,120,120,255,196,196,196,255,255,255,255,255]),3,1,T.RGBAFormat);gradient.minFilter=T.NearestFilter;gradient.magFilter=T.NearestFilter;gradient.needsUpdate=true;
const mats=new Map();function mat(color){if(!mats.has(color))mats.set(color,new T.MeshToonMaterial({color,gradientMap:gradient}));return mats.get(color);}
function mesh(geo,color,pos,parent=scene){const m=new T.Mesh(geo,mat(color));m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function box(x,y,z,w,h,d,c,parent=scene,outline=false){const m=mesh(new T.BoxGeometry(w,h,d),c,[x,y,z],parent);if(outline){const edges=new T.LineSegments(new T.EdgesGeometry(m.geometry),new T.LineBasicMaterial({color:0x172b30,transparent:true,opacity:.7}));m.add(edges);}return m;}
function solid(x,y,z,w,h,d,wall=false){solids.push({x,y,z,w,h,d,wall});}
let seed=719;function random(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
// Island, shore and ocean.
box(0,-.7,0,110,1.4,140,0x5aa83e);solid(0,-.7,0,110,1.4,140);box(0,-.78,0,124,1.4,154,0xf1dca4);
box(0,-1.5,0,1600,.25,1600,0x1fb3c4);box(0,.012,2,9,.024,80,0xd9b77c);for(let i=0;i<14;i++){const m=mesh(new T.CylinderGeometry(2.4+random()*2.6,2.4+random()*2.6,.02,14),0xcfae74,[(random()-.5)*80,.01,(random()-.5)*110]);m.scale.z=.6+random()*.5;m.receiveShadow=true;}
for(let i=0;i<65;i++){let x=(random()-.5)*100,z=(random()-.5)*125;if(Math.abs(x)<17)continue;const m=mesh(new T.ConeGeometry(.7+random()*.7,.12,5),random()>.5?0x4f9a38:0x76b84a,[x,.03,z]);m.rotation.y=random()*6;}
function palm(x,z,s=1){return art.palm(scene,x,z,s,gradient);}
function house(x,z,c){
 const g=new T.Group();g.position.set(x,0,z);scene.add(g);box(0,2.1,0,7,4.2,6,c,g,true);solid(x,2.1,z,7,4.2,6,true);
 box(0,.2,3.8,8,.4,2.6,0xa69c7f,g);solid(x,.2,z+3.8,8,.4,2.6);
 for(let s of [-1,1]){const roof=box(0,4.65,s*1.7,8.3,.22,3.9,0x406b70,g);roof.rotation.x=s*.28;for(let n=-3;n<=3;n++){const rib=box(n,4.8,s*1.7,.035,.1,3.9,0x78a0a0,g);rib.rotation.x=s*.28;}}
 for(let s of [-1,1]){box(s*2,2.5,3.04,1.3,1.55,.12,0x183f45,g);for(let j=0;j<5;j++)box(s*2,2+j*.23,3.14,1.4,.10,.12,0xe7d0a1,g);box(s*3.4,2.2,4.7,.14,4.4,.14,0xf1d6ac,g);}
 box(0,1.3,3.05,1.2,2.6,.15,0x76573f,g);box(.43,1.25,3.18,.08,.08,.08,0xf3cd66,g);box(0,4.2,4.2,8,.18,2.2,0x537f7b,g);
 for(let s of [-1,1]){box(s*2,2.5,-3.03,1.4,1.5,.12,0x24505b,g);for(let j=0;j<5;j++)box(s*2,2+j*.23,-3.13,1.5,.10,.12,0xe8cba1,g);}
}
for(let i=0;i<4;i++){house(-14,34-i*13,[0xe8a04c,0xd96855,0x79bda1,0xd5a95e][i]);house(14,34-i*13,[0x58a5b1,0xf0bd68,0xa88ab9,0xde8969][i]);}
for(let i=0;i<20;i++)palm((i%2?1:-1)*(24+random()*15),55-i*5.5,.8+random()*.5);
for(let i=0;i<3;i++){let x=-27,z=24-i*8;box(x,1,z,4,2,2,0x996d47);solid(x,1,z,4,2,2);for(let s of [-1,1])box(x+s*1.9,2,z,.12,4,.12,0xd9b383);for(let j=0;j<6;j++)box(x-2+j*.8,4,z,.8,.18,3.7,j%2?0xf5dba2:0xd95d53);for(let j=0;j<8;j++)mesh(new T.SphereGeometry(.22,7,5),j%2?0xf4ae45:0x70904b,[x-1.5+(j%4),2.2,z+(j>3?.4:-.4)]);}
// Arena: clear sight lines, roof ledges, wall-run lanes.
box(0,.035,-32,27,.07,28,0xc69b6a);box(0,.08,-32,22,.04,23,0xd8b681);solids.push({x:0,y:.0625,z:-32,w:27,h:.125,d:28,ground:true});
for(let x of [-14,14]){box(x,3,-32,1,6,30,0x509897,scene,true);solid(x,3,-32,1,6,30,true);box(x,6.1,-32,1.4,.2,30.5,0xf3d69c);for(let z=-46;z<=-18;z+=7)box(x,3,z,1.5,6.2,.5,0xe2bf87);}
box(0,2.5,-48,29,5,1,0xca8566,scene,true);solid(0,2.5,-48,29,5,1,true);box(0,5.1,-48,30,.2,1.3,0xe8ce95);
for(let s of [-1,1]){box(s*9,1.3,-12,1.1,2.6,1.1,0xd7bd91);box(s*9,3,-12,1.6,.2,1.6,0xefc778);}
const circle=new T.Mesh(new T.RingGeometry(8.9,9,64),new T.MeshBasicMaterial({color:0xf2d9a0,side:T.DoubleSide}));circle.rotation.x=-Math.PI/2;circle.position.set(0,.125,-32);scene.add(circle);
for(let i=0;i<7;i++){const x=-10+i*1.35,z=-42;const m=box(x,.5,z,.95,1,.95,0x9e7044,scene,true);crates.push({mesh:m,x,z,hp:22,solid:solids.length});solid(x,.5,z,.95,1,.95);box(0,0,0,1.01,.12,1.01,0xcba56f,m);}
// Hills and volcano beyond the shoreline.
for(let i=0;i<12;i++){let x=(i-5.5)*16,z=-86-random()*16;mesh(new T.ConeGeometry(15+random()*8,18+random()*15,7),i%2?0x3f9a63:0x58b06c,[x,5,z]);}const volcano=mesh(new T.ConeGeometry(22,35,9),0x4c8f62,[43,11,-96]);mesh(new T.ConeGeometry(5,4,9),0x8e8a7a,[43,29,-96]);
function sign(text,x,y,z,size){const c=document.createElement('canvas');c.width=1024;c.height=160;const ctx=c.getContext('2d');ctx.fillStyle='#143c46';ctx.fillRect(0,0,1024,160);ctx.strokeStyle='#d9b77a';ctx.lineWidth=8;ctx.strokeRect(8,8,1008,144);ctx.fillStyle='#ffe0a0';ctx.textAlign='center';ctx.font='bold 48px Arial';ctx.fillText(text,512,99);const map=new T.CanvasTexture(c);const m=new T.Mesh(new T.PlaneGeometry(size,size*.15625),new T.MeshBasicMaterial({map,side:T.DoubleSide}));m.position.set(x,y,z);scene.add(m);}
sign('ANSE-AUX-BÈTS',0,4.5,42,9);sign('MORNE DES ESPRITS',0,5,-47.35,14);sign('ENTRAÎNEMENT  ↑',0,3,-12,8);
const islandDecor=art.decorateWorld(scene,solids,gradient);
for(const c of crates)c.mesh.userData.dynamic=true;
const sceneryBatch=art.batchScenery(scene);
function createFighter(enemy){return art.makeFighter(scene,enemy,enemy?0x9e435a:colors[outfit],skins[skin],gradient);}
const player=createFighter(false),enemy=createFighter(true);player.root.position.set(0,0,24);enemy.root.position.set(0,.15,-34);enemy.angle=Math.PI;
const cameraPos=new T.Vector3(),targetPos=new T.Vector3();let aiTimer=1.6,attackNumber=0;
function saveLook(){try{localStorage.setItem('karukera-look',JSON.stringify({outfit,skin}));}catch{}}
function setLook(){player.cloth.color.setHex(colors[outfit]);player.bodymat.color.setHex(skins[skin]);document.querySelectorAll('[data-color]').forEach(b=>b.classList.toggle('selected',+b.dataset.color===outfit));document.querySelectorAll('[data-skin]').forEach(b=>b.classList.toggle('selected',+b.dataset.skin===skin));saveLook();}
setLook();
function sound(freq=180){if(soundOn)audioBus.cue(freq<100?'heavy':freq>800?'whoosh':freq>550?'heal':freq>300?'whoosh':'strike');}
function toast(text,t=2){$('toast').textContent=text;toastTime=t;$('toast').style.opacity=1;}
function burst(pos,color,radius=1,duration=.35){fx.impact(pos,color,Math.min(radius,2.4),duration);}
function ring(pos,color,radius=3,duration=.5){fx.wave(pos,color,radius,duration);}
function forward(f){return new T.Vector3(-Math.sin(f.angle),0,-Math.cos(f.angle));}
function look(f,p){const d=p.clone().sub(f.root.position);f.angle=Math.atan2(-d.x,-d.z);}
function dist(a,b){return a.root.position.distanceTo(b.root.position);}
function clearSight(a,b){return a.distanceToSquared(b)<1e-10||motion.firstHit(a,b,solids)===null;}
function chase(f=player,target=enemy){
 if(!target||target.hp<=0||f.hp<=0||f.chaseCooldown>0||f.chase>0||f.hurt>0||f.ultimatePose||f.stamina<15||dist(f,target)>45)return false;
 if(!clearSight(f.root.position.clone().add(new T.Vector3(0,1.2,0)),target.root.position.clone().add(new T.Vector3(0,1.2,0)))){if(f===player)toast('CHASE PATH BLOCKED',.8);return false;}
 f.stamina-=15;f.staminaDelay=.6;f.chase=.75;f.chaseCooldown=1.3;f.chaseTarget=target;f.attack=null;f.recovery=0;f.block=false;f.castPose=null;f.vy=0;f.ground=false;f.root.position.y+=.04;f.trailClock=0;
 if(f===player){locked=true;toast('ZÉKLÈ · AERIAL PURSUIT',.9);}audioBus.cue('chase');return true;
}
function substitute(){
 const f=player;if(f.hp<=0||f.subCharges<=0||f.substitute>0||f.ultimatePose)return false;
 const origin=f.root.position.clone(),dir=moveDirection();if(dir.lengthSq()<.01)dir.copy(origin).sub(enemy.root.position).setY(0);if(dir.lengthSq()<.01)dir.copy(forward(f)).negate();dir.normalize();
 f.subCharges--;if(f.subRecharge<=0)f.subRecharge=11;f.substitute=.45;f.invuln=.65;f.hurt=0;f.guardBroken=0;f.attack=null;f.buffered=null;f.block=false;f.chase=0;f.dash=0;f.lightning=false;f.recovery=.15;f.castPose=null;
 moveXZ(f,dir.x*6,dir.z*6);if(!f.ground)f.vy=Math.max(2,f.vy);fx.substitute(origin);fx.afterimage(f,0x87c7d3);toast('DORLIS · SPIRIT ESCAPE',.9);audioBus.cue('escape');return true;
}
function unleash(){
 const f=player;if(f.hp<=0||f.ultimate<100||f.hurt>0||f.recovery>.2||f.ultimatePose||f.chase>0){if(f.hp>0&&f.ultimate<100)toast('CŒUR DES ÎLES · '+Math.floor(f.ultimate)+'% CHARGED',.9);return false;}
 if(enemy.hp>0)look(f,enemy.root.position);f.ultimate=0;f.attack=null;f.buffered=null;f.block=false;f.dash=0;f.chase=0;f.castPose=null;f.recovery=2.4;f.invuln=.9;
 f.vy=0;f.ultimatePose={age:0,duration:2.4,burst:false,pulses:0,origin:f.root.position.clone()};fx.ultimate(f.root.position,'charge');if(fx.sigil)fx.sigil(f.root.position,0xffc94a,4.2,2.2);cutinTime=1.6;toast('CŒUR DES ÎLES',2);audioBus.cue('ultimatecharge');return true;
}
function damage(target,amount,source,launch=false){
 if(target.hp<=0||target.invuln>0)return 0;
 let guarded=false;const dir=source.root.position.clone().sub(target.root.position).setY(0).normalize();
 if(target.block&&forward(target).dot(dir)>.05){if(target.blockAge<.18&&target.stamina>=5){target.stamina-=5;source.recovery=.8;source.attack=null;fx.wave(target.root.position,0xffed9b,2.4,.3);burst(target.root.position,0xffed9b,1.8);audioBus.cue('parry');if(!target.enemy)toast('PARRY',.7);pop('PARÉ!',target.root.position.clone().add(new T.Vector3(0,2,0)),'parry');return 0;}if(target.stamina>=amount*.75){target.stamina-=amount*.75;amount*=.18;guarded=true;sound(320,.08,'square',.025);}else{target.stamina=0;target.block=false;target.guardBroken=.9;toast('GUARD BREAK',.9);}}
 const hpBefore=target.hp;target.hp=Math.max(0,target.hp-amount);target.flash=.13;target.hurt=.22;target.recovery=Math.max(target.recovery,.18);target.attack=null;target.chase=0;target.ultimatePose=null;target.cloth.emissive.setHex(0x893825);source.energy=Math.min(100,source.energy+4);
 if(launch&&!guarded){target.vy=10;target.airHang=.45;target.ground=false;target.jumps=1;}moveXZ(target,-dir.x*.32,-dir.z*.32);burst(target.root.position,0xffd18c,.9);if(fx.hitSpark)fx.hitSpark(target.root.position,launch||amount>=18);pop(guarded?'BLOK!':launch||amount>=18?pick(heavyWords):pick(popWords),target.root.position.clone().add(new T.Vector3(0,1.9,0)),guarded?'guard':launch||amount>=18?'big':'');award(source===player?0:1,hpBefore-target.hp);if(!reducedMotion&&(launch||amount>=18)&&!guarded)post.flash=Math.max(post.flash,.22);sound(120,.1,'sawtooth',.04);shake=.13;hitStop=Math.max(hitStop,launch?.065:.04);if(source===player){player.ultimate=Math.min(100,player.ultimate+amount*.7+4);comboHits++;comboAge=2.0;$('hitword').textContent=comboHits>1?'HITS':'HIT';}
 if(target===player){player.ultimate=Math.min(100,player.ultimate+amount*.4);document.body.classList.add('hit');setTimeout(()=>document.body.classList.remove('hit'),150);}
 if(target.hp<=0){target.block=false;target.attack=null;koTime=2.2;award(source===player?0:1,20);if(source===player)pop('FINISH +20',target.root.position.clone().add(new T.Vector3(0,2.6,0)),'finish');if(!reducedMotion)post.flash=Math.max(post.flash,.45);if(started&&!ended){ended=true;setTimeout(showResult,1900);}}
 return amount;
}
function hitArea(f,radius,amount,minDot=-1,launch=false,hitSet=null){
 const other=f.enemy?player:enemy,d=other.root.position.clone().sub(f.root.position);let landed=false;
 if((!hitSet||!hitSet.has(other))&&other.hp>0&&d.length()<radius&&forward(f).dot(d.clone().setY(0).normalize())>=minDot&&clearSight(f.root.position.clone().add(new T.Vector3(0,1,0)),other.root.position.clone().add(new T.Vector3(0,1,0)))){if(hitSet)hitSet.add(other);landed=damage(other,amount,f,launch)>0;}
 for(const c of crates){if(c.hp<=0||(hitSet&&hitSet.has(c)))continue;const cp=c.mesh.position.clone().sub(f.root.position);if(cp.length()<radius&&forward(f).dot(cp.normalize())>=minDot){if(hitSet)hitSet.add(c);c.hp-=amount;if(c.hp<=0){c.mesh.visible=false;solids[c.solid].disabled=true;fx.dust(c.mesh.position,1.5);burst(c.mesh.position,0xf8cf84,1.5);sound(100,.2,'triangle');}}}
 return landed;
}
function attack(f,heavy){
 if(f.hp<=0||f.ultimatePose||f.block||f.guardBroken>0||f.hurt>0||f.stamina<(heavy?22:9))return false;
 if(f.recovery>0){if(!f.enemy&&f.recovery<.19)f.buffered={heavy,life:.22};return false;}
 if(f===player&&locked)look(f,enemy.root.position);
 f.chase=0;f.staminaDelay=.55;f.stamina-=heavy?22:9;f.combo=heavy?0:(f.combo%3)+1;f.chain=1.25;f.recovery=heavy?.72:.33;
 if(heavy&&fx.sigil)fx.sigil(f.root.position,f.enemy?0xc54dff:0x7b6bff,1.7,.6);f.attack={heavy,air:!f.ground,kick:!heavy&&(f.combo===3||(!f.ground&&f.combo===2)),side:(f.combo-1)%2,age:0,hit:false};f.castPose=null;
 sound(heavy?150:270,.08,'triangle',.025);return true;
}
function dodge(f=player){if(f.hp<=0||f.ultimatePose||f.recovery>0||f.stamina<24||f.guardBroken>0)return false;f.stamina-=24;f.staminaDelay=.6;f.block=false;f.invuln=.34;f.evade=.3;f.recovery=.28;f.dash=.18;f.dashDir.copy(moveDirection());if(f.dashDir.lengthSq()<.01)f.dashDir.copy(forward(f));f.dashDir.normalize();burst(f.root.position,0xa7eced,1.1);sound(360,.15);return true;}
function jump(){const f=player;if(f.hp<=0||f.ultimatePose)return;if(f.wall>0&&f.stamina>=10){f.vy=11;f.stamina-=10;f.dashDir.copy(f.wallNormal||new T.Vector3(1,0,0));f.dash=.14;f.wall=0;f.jumps=1;f.ground=false;return;}if(f.jumps<2){f.vy=f.jumps===0?10.5:9.5;f.jumps++;f.ground=false;ring(f.root.position,0xc5f7ea,.9,.3);audioBus.cue('jump');}}
const costs=[20,30,35,20],cooldowns=[3.5,10,7,3.5];
function cast(slot){const f=player;if(!Number.isInteger(slot)||slot<0||slot>3)return false;if(f.hp<=0||f.ultimatePose||f.recovery>0||f.block||f.cool[slot]>0||f.energy<costs[slot])return false;if(locked)look(f,enemy.root.position);f.energy-=costs[slot];f.cool[slot]=cooldowns[slot];f.castPose={slot,age:0,duration:[.55,.9,.7,.35][slot]};if(fx.sigil)fx.sigil(f.root.position,[0xff8a3d,0x3fe6dc,0xff5a3d,0xffe066][slot],2.6,.9);
 if(slot===0){const orb=art.fireOrb();orb.position.copy(f.root.position).add(new T.Vector3(0,1.3,0)).addScaledVector(forward(f),.9);scene.add(orb);const dir=locked?enemy.root.position.clone().add(new T.Vector3(0,1,0)).sub(orb.position).normalize():forward(f);projectiles.push({mesh:orb,dir,life:1.4});f.recovery=.2;toast('SOUCOUYANT · FLAME ORB',.8);audioBus.cue('fire');}
 if(slot===1){f.hp=Math.min(100,f.hp+34);f.stamina=Math.min(100,f.stamina+25);fx.heal(f.root.position);toast('MANMAN DLO · +34 HEALTH',1);audioBus.cue('heal');}
 if(slot===2){hitArea(f,7,34,-1,true);fx.eruption(f.root.position.clone());f.recovery=.4;shake=.3;toast('VOLCAN · ERUPTION',1);sound(75,.4,'sawtooth',.07);}
 if(slot===3){f.dashDir.copy(forward(f));f.dash=.24;f.invuln=.3;f.recovery=.25;f.lightning=true;f.dashHits=new Set();ring(f.root.position,0xffed8b,2,.3);toast('ZÉKLÈ · FLASH STEP',.8);sound(950,.18,'square',.025);}return true;}
function moveXZ(f,dx,dz){const p=f.root.position;const radius=.38;for(let axis of ['x','z']){const delta=axis==='x'?dx:dz;const steps=Math.max(1,Math.ceil(Math.abs(delta)/.2));for(let i=0;i<steps;i++){let nx=p.x+(axis==='x'?delta/steps:0),nz=p.z+(axis==='z'?delta/steps:0),blocked=false;for(const s of solids){if(s.disabled||s.ground||p.y>=s.y+s.h/2-.03||p.y+(f.collisionHeight||2.3)<=s.y-s.h/2)continue;if(Math.abs(nx-s.x)<s.w/2+radius&&Math.abs(nz-s.z)<s.d/2+radius){blocked=true;break;}}if(!blocked){p.x=clamp(nx,-53,53);p.z=clamp(nz,-68,68);}}}}
function floorAt(p){let floor=0;for(const s of solids){if(s.disabled)continue;const top=s.y+s.h/2;if(top<=p.y+.32&&Math.abs(p.x-s.x)<s.w/2+.15&&Math.abs(p.z-s.z)<s.d/2+.15)floor=Math.max(floor,top);}return floor;}
let padMove=new T.Vector2(),padYaw=0,padPitch=0,padSprint=false,padGuard=false,previousButtons=[];
function moveDirection(){let x=(keys.has('KeyD')?1:0)-(keys.has('KeyA')?1:0)+padMove.x,z=(keys.has('KeyS')?1:0)-(keys.has('KeyW')?1:0)+padMove.y;const v=new T.Vector3(x,0,z);if(v.length()>1)v.normalize();return v.applyAxisAngle(new T.Vector3(0,1,0),yaw);}
function updateFighter(f,dt){
 f.recovery=Math.max(0,f.recovery-dt);f.staminaDelay=Math.max(0,(f.staminaDelay||0)-dt);f.chaseCooldown=Math.max(0,(f.chaseCooldown||0)-dt);f.substitute=Math.max(0,(f.substitute||0)-dt);
 if(f.subCharges<2){f.subRecharge-=dt;if(f.subRecharge<=0){f.subCharges++;f.subRecharge=f.subCharges<2?11:0;}}
 if(f===player&&f.hp>0&&!f.ultimatePose)f.ultimate=Math.min(100,f.ultimate+dt*2.0);f.invuln=Math.max(0,f.invuln-dt);f.guardBroken=Math.max(0,f.guardBroken-dt);f.hurt=Math.max(0,f.hurt-dt);f.land=Math.max(0,f.land-dt);f.airHang=Math.max(0,(f.airHang||0)-dt);f.evade=Math.max(0,f.evade-dt);f.chain-=dt;if(f.chain<=0)f.combo=0;for(let i=0;i<4;i++)f.cool[i]=Math.max(0,f.cool[i]-dt);
 if(f.hp<=0){f.chase=0;f.ultimatePose=null;art.animate(f,time,dt);return;}
 if(f.ultimatePose){const u=f.ultimatePose;u.age+=dt;
  if(!u.burst&&u.age>=.85){u.burst=true;hitArea(f,10,48,-1,true);fx.ultimate(u.origin,'burst');if(!reducedMotion)post.flash=Math.max(post.flash,.6);pop('KABOUM!',u.origin.clone().add(new T.Vector3(0,3,0)),'big');shake=reducedMotion?.08:.4;hitStop=.075;audioBus.cue('ultimateburst');}
  while(u.pulses<3&&u.age>=1.1+u.pulses*.25){u.pulses++;hitArea(f,8,8,-1,false);fx.wave(u.origin,0xffe1a4,8,.3);}
  if(u.age>=u.duration)f.ultimatePose=null;
 }
 if(f.chase>0){const target=f.chaseTarget;if(!target||target.hp<=0){f.chase=0;}else{
  const delta=target.root.position.clone().sub(f.root.position),length=delta.length();look(f,target.root.position);
  if(length<=2.1){f.chase=0;f.airHang=.18;f.vy=1.2;}
  else{delta.normalize();f.dashDir.copy(delta);const move=motion.move3D(f,delta.multiplyScalar(Math.min(length-2,27*dt)),solids);f.chase-=dt;f.trailClock-=dt;if(f.trailClock<=0){fx.chaseTrail(f);fx.afterimage(f,0x83dcee);f.trailClock=.065;}if(move.blocked)f.chase=0;f.vy=0;f.ground=false;}
 }}
 if(f.buffered){f.buffered.life-=dt;if(f.buffered.life<=0)f.buffered=null;else if(f.recovery<=0){const heavy=f.buffered.heavy;f.buffered=null;attack(f,heavy);}}
 if(f.castPose){f.castPose.age+=dt;if(f.castPose.age>=f.castPose.duration)f.castPose=null;}
 if(f.block){f.blockAge+=dt;f.stamina=Math.max(0,f.stamina-dt*5);if(f.stamina<=0)f.block=false;}else if(f.recovery<=0&&!f.sprinting&&f.staminaDelay<=0)f.stamina=Math.min(100,f.stamina+dt*19);
 f.energy=Math.min(100,f.energy+dt*4.5);if(f.flash>0){f.flash-=dt;if(f.flash<=0)f.cloth.emissive.setHex(0);}
 if(f.attack){const a=f.attack;a.age+=dt;if(!a.hit&&a.age>=(a.heavy?.29:.12)){
  a.hit=true;moveXZ(f,forward(f).x*.18,forward(f).z*.18);
  const connected=hitArea(f,a.air?3.6:(a.heavy?3.2:2.65),a.heavy?26:(f.combo===3?18:11),0,a.heavy);
  fx.slash(f,a.heavy);if(connected&&a.heavy&&!f.enemy&&f.ground&&!enemy.block&&!enemy.ground&&enemy.vy>0){f.vy=8.8;f.recovery=Math.min(f.recovery,.2);f.ground=false;f.jumps=1;toast('LAUNCH · J TO FOLLOW UP',1.2);}
  if(connected&&a.air){f.vy=Math.max(f.vy,2.5);const target=f.enemy?player:enemy;target.vy=Math.max(target.vy,2);target.airHang=.38;if(!f.enemy)toast('AERIAL CHAIN',.8);}
 }if(a.age>(a.heavy?.7:.32))f.attack=null;}
 const was=f.root.position.y,wasGround=f.ground,height=f.collisionHeight||2.3;
 f.vy-=dt*(f.chase>0||f.ultimatePose?0:f.wall>0?3:(!f.ground&&(f.attack||f.airHang>0)?11:26));f.root.position.y+=f.vy*dt;
 if(f.vy>0){for(const s of solids){const bottom=s.y-s.h/2;if(s.disabled||Math.abs(f.root.position.x-s.x)>s.w/2+.3||Math.abs(f.root.position.z-s.z)>s.d/2+.3)continue;if(was+height<=bottom+.02&&f.root.position.y+height>=bottom){f.root.position.y=bottom-height;f.vy=0;break;}}}
 const floor=floorAt(new T.Vector3(f.root.position.x,Math.max(was,f.root.position.y),f.root.position.z));
 if(f.root.position.y<=floor&&f.vy<=0){if(!wasGround&&f.vy<-4){f.land=.22;if(f===player)audioBus.cue('landing');fx.dust(f.root.position,Math.min(1.6,-f.vy/12));}f.root.position.y=floor;f.vy=0;f.ground=true;f.jumps=0;f.wallTime=0;}else f.ground=false;
 if(f.dash>0){moveXZ(f,f.dashDir.x*dt*27,f.dashDir.z*dt*27);f.dash-=dt;f.trailClock=(f.trailClock||0)-dt;if(f.trailClock<=0){fx.afterimage(f,f.lightning?0x9ae7ff:0xb0dfd5);if(f.lightning)fx.lightning(f.root.position);f.trailClock=.065;}if(f.lightning){hitArea(f,2,18,-1,false,f.dashHits);if(f.dash<=0)f.lightning=false;}}
 f.root.rotation.y=f.angle;art.animate(f,time,dt);
}
function updatePlayer(dt){
 if(locked&&enemy.hp<=0)locked=false;
 if(keys.has('ArrowLeft'))yaw+=dt*1.8;if(keys.has('ArrowRight'))yaw-=dt*1.8;yaw-=padYaw*dt*2;pitch=clamp(pitch+padPitch*dt*1.2,-.1,.85);
 const moving=moveDirection();let sprint=(keys.has('ShiftLeft')||keys.has('ShiftRight')||padSprint)&&player.stamina>1&&moving.lengthSq()>.01&&!player.block&&player.recovery<=0;
 if(player.stamina<2)player.sprintExhausted=true;if(player.stamina>28)player.sprintExhausted=false;
 sprint=sprint&&!player.sprintExhausted&&!player.ultimatePose&&player.chase<=0;player.sprinting=sprint;
 if(sprint)player.stamina=Math.max(0,player.stamina-12*dt);
 if(player.stamina<=1&&!sprint&&player.recovery<=0&&!player.block)player.stamina=Math.min(100,player.stamina+12*dt);
 const wantsBlock=keys.has('KeyQ')||padGuard;const canBlock=wantsBlock&&!player.ultimatePose&&player.chase<=0&&player.stamina>1&&player.recovery<=0&&player.guardBroken<=0;
 if(canBlock&&!player.block)player.blockAge=0;player.block=canBlock;
 const speed=player.ultimatePose?0:player.block?3:player.recovery>0?3.5:sprint?12:7;
 player.moveSpeed=moving.length()*speed;
 if(locked&&enemy.hp>0){look(player,enemy.root.position);const d=enemy.root.position.clone().sub(player.root.position);const targetYaw=Math.atan2(-d.x,-d.z);yaw+=Math.atan2(Math.sin(targetYaw-yaw),Math.cos(targetYaw-yaw))*Math.min(1,dt*6);}else if(moving.lengthSq()>.01)player.angle=Math.atan2(-moving.x,-moving.z);
 if(player.dash<=0&&player.chase<=0)moveXZ(player,moving.x*speed*dt,moving.z*speed*dt);
 player.wall=0;
 if(!player.ground&&sprint&&moving.lengthSq()>.01&&(player.wallTime||0)<1.6){const p=player.root.position;for(const s of solids){if(!s.wall||p.y>s.y+s.h/2-.5||p.y<.5)continue;const nearX=Math.abs(p.x-s.x)<s.w/2+.7&&Math.abs(p.z-s.z)<s.d/2+.2;const nearZ=Math.abs(p.z-s.z)<s.d/2+.7&&Math.abs(p.x-s.x)<s.w/2+.2;if(nearX||nearZ){player.wall=1;player.wallNormal=motion.wallNormal(p,s);player.wallSide=Math.sign(p.x-s.x)||1;player.wallTime=(player.wallTime||0)+dt;player.vy=1.2;break;}}}
 updateFighter(player,dt);
}
function updateAI(dt){
 if(enemy.hp<=0){updateFighter(enemy,dt);return;}
 enemy.moveSpeed=0;if(player.root.position.z<-14&&player.hp>0){look(enemy,player.root.position);const d=dist(enemy,player);aiTimer-=dt;if(player.root.position.y-enemy.root.position.y>1.5&&enemy.recovery<=0){if(enemy.ground){enemy.vy=11.5;enemy.ground=false;enemy.jumps=1;}else if(enemy.jumps<2&&enemy.vy<1){enemy.vy=10.5;enemy.jumps=2;}}
 if(d>8&&Math.abs(player.root.position.y-enemy.root.position.y)>2&&enemy.chaseCooldown<=0&&enemy.recovery<=0)chase(enemy,player);
 if(aiTimer<=0){enemy.block=false;attackNumber++;if(d<3){if(attackNumber%4===0){enemy.block=true;enemy.blockAge=0;aiTimer=.7;}else{attack(enemy,attackNumber%3===0);aiTimer=attackNumber%3===0?1.4:.9;}}else aiTimer=.25;}
 if(d>2.15&&enemy.chase<=0&&!enemy.block&&enemy.recovery<=0){const v=player.root.position.clone().sub(enemy.root.position).setY(0).normalize();moveXZ(enemy,v.x*4.5*dt,v.z*4.5*dt);enemy.moveSpeed=4.5;}
 }else enemy.block=false;
 updateFighter(enemy,dt);
}
function updateEffects(dt){
 fx.update(dt);
 for(let i=projectiles.length-1;i>=0;i--){const p=projectiles[i],before=p.mesh.position.clone();p.life-=dt;
  // Swept substeps avoid projectile tunneling at low frame rates; walls are checked first.
  const steps=Math.max(1,Math.ceil(24*dt/.35));let hit=false;
  for(let j=0;j<steps&&!hit;j++){
   const previous=p.mesh.position.clone();p.mesh.position.addScaledVector(p.dir,24*dt/steps);
   if(!clearSight(previous,p.mesh.position)){hit=true;break;}
   if(enemy.hp>0&&p.mesh.position.distanceTo(enemy.root.position.clone().add(new T.Vector3(0,1,0)))<1.25){damage(enemy,25,player);hit=true;}
  }
  art.animateOrb(p.mesh,time);fx.fireTrail(p.mesh.position);
  if(hit||p.life<=0){const impact=p.mesh.position.clone().add(new T.Vector3(0,-1,0));fx.impact(impact,0xffb553,2);fx.dust(impact,.5);scene.remove(p.mesh);art.disposeProjectile(p.mesh);projectiles.splice(i,1);}
 }
}
function updateCamera(dt){
 const p=player.root.position,focus=p.clone().add(new T.Vector3(0,1.5,0));let distance=started?(player.chase>0?11:player.moveSpeed>9?9.6:8.4):5.8;
 if(!started)focus.x-=1.7;
 else if(locked&&enemy.hp>0&&clearSight(focus,enemy.root.position.clone().add(new T.Vector3(0,1.5,0)))){const separation=enemy.root.position.clone().sub(p),length=separation.length();focus.addScaledVector(separation,length>20?.14:.29);distance+=Math.min(5,Math.abs(separation.y)*.35);}
 const angle=clamp(pitch+.12,-.3,1.15),flat=Math.cos(angle)*distance;
 targetPos.set(focus.x+Math.sin(yaw)*flat+Math.cos(yaw)*.5,focus.y+Math.sin(angle)*distance+.7,focus.z+Math.cos(yaw)*flat-Math.sin(yaw)*.5);
 const requested=targetPos.clone(),t=motion.firstHit(focus,requested,solids,{x:.22,y:.22,z:.22});
 if(t!==null)targetPos.copy(focus).lerp(requested,Math.max(0,t-.05));
 if(t!==null&&cameraPos.distanceTo(focus)>targetPos.distanceTo(focus))cameraPos.copy(targetPos);else cameraPos.lerp(targetPos,1-Math.exp(-dt*10));
 // Recheck the smoothed path so camera inertia never crosses a wall on turns.
 const smoothHit=motion.firstHit(focus,cameraPos,solids,{x:.15,y:.15,z:.15});if(smoothHit!==null)cameraPos.copy(focus).lerp(cameraPos.clone(),Math.max(0,smoothHit-.04));
 camera.position.copy(cameraPos);if(shake>0){shake=Math.max(0,shake-dt);if(!reducedMotion){camera.position.x+=(random()-.5)*shake;camera.position.y+=(random()-.5)*shake;}}
 const desiredFov=player.ultimatePose?65:player.chase>0?79:player.moveSpeed>9?71:62;
 camera.fov=T.MathUtils.lerp(camera.fov,desiredFov,1-Math.exp(-dt*5));camera.updateProjectionMatrix();camera.lookAt(focus);
}
// Anime presentation layer: lock-on ring, flame auras, comic hit pops, points, K.O. stamp, ultimate cut-in, speed lines.
const lockRing=new T.Group();{const red=new T.MeshBasicMaterial({color:0xff3d3d,transparent:true,opacity:.9,depthWrite:false,side:T.DoubleSide});const inner=new T.Mesh(new T.RingGeometry(1.0,1.1,48),red);inner.rotation.x=-Math.PI/2;lockRing.add(inner);for(let i=0;i<3;i++){const arc=new T.Mesh(new T.RingGeometry(1.25,1.4,24,1,i*Math.PI*2/3,Math.PI*.42),red);arc.rotation.x=-Math.PI/2;lockRing.add(arc);}lockRing.visible=false;lockRing.renderOrder=3;scene.add(lockRing);}
const auras=[player,enemy].map((f,i)=>{if(!art.makeAura)return null;const a=art.makeAura(i?0xc54dff:0x48c2ff);f.root.add(a);return a;});
const popWords=['BIM!','BAP!','PAW!','KOUT!','KRAK!','WAP!'],heavyWords=['BLAM!','KABOUM!','BOOM!'],pops=[];let popIndex=0,points=[0,0],pointGain=0,pointGainAge=0,koTime=0,cutinTime=0,auraLevel=[0,0];
for(let i=0;i<8;i++)pops.push({el:$('pop'+i),life:0,max:.8,world:new T.Vector3(),dx:0,dy:0,rot:0});
function pick(list){return list[Math.floor(random()*list.length)%list.length];}
function pop(text,world,kind=''){const p=pops[popIndex++%pops.length];p.life=p.max=kind==='finish'?1.4:.8;p.world.copy(world);p.dx=(random()-.5)*120;p.dy=-40-random()*40;p.rot=(random()-.5)*30;p.el.textContent=text;p.el.className='pop '+kind;}
function award(index,n){n=Math.round(n);if(n<=0)return;points[index]+=n;if(index===0){pointGain+=n;pointGainAge=1.5;}}
const screen=new T.Vector3();function toScreen(world){screen.copy(world).project(camera);return {x:(screen.x+1)/2*innerWidth,y:(-screen.y+1)/2*innerHeight,visible:screen.z<1&&Math.abs(screen.x)<1.2&&Math.abs(screen.y)<1.2};}
function updateAnimeLayer(dt){
 camera.updateMatrixWorld();sky.position.copy(camera.position);if(fx.setCamera)fx.setCamera(camera.quaternion);
 [player,enemy].forEach((f,i)=>{const want=f.hp<=0?0:f.ultimatePose?1.25:f.chase>0?1:f.lightning?.9:f.castPose?.75:f.substitute>0?.6:f.dash>0?.45:f.attack&&f.attack.heavy?.5:0;auraLevel[i]+= (want-auraLevel[i])*Math.min(1,dt*(want>auraLevel[i]?14:4));if(auras[i])auras[i].update(time,auraLevel[i]);if(auraLevel[i]>.35&&!paused&&random()<auraLevel[i]*.6)fx.sparks.emit(f.root.position.clone().add(new T.Vector3((random()-.5)*.9,-.4,(random()-.5)*.9)),i?0xd98bff:0x9fe4ff,1,.6,3.2,.5,.1);});
 post.boost+=((player.ultimatePose?1:player.chase>0?.6:0)-post.boost)*Math.min(1,dt*5);
 lockRing.visible=started&&locked&&enemy.hp>0;if(lockRing.visible){lockRing.position.set(enemy.root.position.x,enemy.root.position.y+.06,enemy.root.position.z);lockRing.rotation.y+=dt*1.6;const s=1+Math.sin(time*6)*.05;lockRing.scale.setScalar(s);}
 if(!started)return;
 $('speedlines').style.opacity=reducedMotion?0:(player.chase>0?.95:player.ultimatePose?.8:player.lightning||player.dash>0?.5:player.sprinting?.22:0).toFixed(2);
 for(const p of pops){if(p.life<=0){if(p.el.style.opacity!=='0')p.el.style.opacity='0';continue;}p.life-=dt;const t=1-p.life/p.max,s=toScreen(p.world),scale=t<.12?1.9-t/.12*.9:1;
  p.el.style.left=(s.x+p.dx*Math.min(1,t*4))+'px';p.el.style.top=(s.y+p.dy*Math.min(1,t*3)-t*30)+'px';p.el.style.transform=`translate(-50%,-50%) rotate(${p.rot}deg) scale(${scale})`;p.el.style.opacity=s.visible?String(Math.min(1,p.life/(p.max*.3))):'0';}
 const combo=$('combo');if(enemy.hp>0||koTime>0){const s=toScreen(enemy.root.position.clone().add(new T.Vector3(0,2.2,0)));if(s.visible){combo.style.left=clamp(s.x+70,40,innerWidth-200)+'px';combo.style.top=clamp(s.y-30,80,innerHeight-220)+'px';}}
 const np=$('nameplate'),head=toScreen(enemy.root.position.clone().add(new T.Vector3(0,2.75,0)));const showPlate=enemy.hp>0&&head.visible&&dist(player,enemy)<40;np.style.display=showPlate?'block':'none';if(showPlate){np.style.left=head.x+'px';np.style.top=head.y+'px';$('npbar').style.width=(enemy.hp/140*100)+'%';}
 if(pointGainAge>0){pointGainAge-=dt;if(pointGainAge<=0)pointGain=0;}
 $('points').textContent=points[0];$('pointgain').textContent=pointGain>0?'+'+pointGain:'';$('score-you').textContent=points[0];$('score-rival').textContent=points[1];
 koTime=Math.max(0,koTime-dt);const ko=$('ko');ko.style.opacity=koTime>0?String(Math.min(1,koTime*2)):'0';ko.style.transform=`translate(-50%,-50%) rotate(-8deg) scale(${koTime>1.9?1+(koTime-1.9)*3:1})`;
 cutinTime=Math.max(0,cutinTime-dt);const cut=$('cutin');cut.style.opacity=cutinTime>0?String(Math.min(1,cutinTime*4,(1.6-cutinTime)*8)):'0';cut.style.transform=`translateY(-50%) skewY(-6deg) translateX(${cutinTime>1.35?(cutinTime-1.35)*-400:cutinTime<.25?(.25-cutinTime)*400:0}%)`;
}
function updateHUD(){
 $('ultimatefill').style.width=player.ultimate+'%';$('ultimatebutton').classList.toggle('ready',player.ultimate>=100);$('ultimatetext').textContent=player.ultimate>=100?'CŒUR DES ÎLES · READY':Math.floor(player.ultimate)+'%';$('escapetext').textContent='DORLIS '+player.subCharges+'/2'+(player.subCharges<2?' · '+Math.ceil(player.subRecharge)+'s':'');
 $('timer').textContent=String(Math.floor(duelTime/60)).padStart(2,'0')+':'+String(Math.floor(duelTime%60)).padStart(2,'0');$('combo').classList.toggle('visible',comboAge>0&&comboHits>0);$('combocount').textContent=comboHits;
 $('hp').style.width=player.hp+'%';$('hptext').textContent=Math.ceil(player.hp)+' / 100';$('stamina').style.width=player.stamina+'%';$('energy').style.width=player.energy+'%';$('ehp').style.width=enemy.hp/140*100+'%';
 $('location').textContent=player.root.position.z<-14?'MORNE DES ESPRITS':'ANSE-AUX-BÈTS';$('state').textContent=player.ultimatePose?'CŒUR DES ÎLES':player.chase>0?'AERIAL PURSUIT':player.wall?'WALL RUN':player.guardBroken>0?'GUARD BROKEN':player.block?'GUARD':locked?'TARGET LOCKED':'';
 $('enemystate').textContent=enemy.hp<=0?'RIVAL DEFEATED':enemy.block?'GUARDING':enemy.attack?'INCOMING ATTACK':player.root.position.z<-14?'TRAINING DUEL':'WAITING IN THE ARENA';
 document.querySelectorAll('[data-slot]').forEach(b=>{let s=+b.dataset.slot;b.classList.toggle('cooldown',player.cool[s]>0);b.classList.toggle('empty',player.energy<costs[s]);b.querySelector('em').textContent=player.cool[s].toFixed(1)+'s';});
 $('duel').style.display=player.root.position.z<-14?'none':'block';const target=$('target');if(locked&&enemy.hp>0){const p=enemy.root.position.clone().add(new T.Vector3(0,2.7,0)).project(camera);target.style.display=p.z<1?'block':'none';target.style.left=((p.x+1)/2*innerWidth)+'px';target.style.top=((-p.y+1)/2*innerHeight)+'px';}else target.style.display='none';
}
function toggleLock(){if(enemy.hp>0&&dist(player,enemy)<45){locked=!locked;sound(550,.07);if(locked)toast('TARGET LOCKED',.7);}else toast('Move closer to the rival',1);}
function resetFighter(f,x,z){Object.assign(f,{hp:f.enemy?140:100,stamina:100,energy:100,vy:0,jumps:0,ground:true,angle:f.enemy?Math.PI:0,attack:null,recovery:0,invuln:0,block:false,blockAge:0,combo:0,chain:0,cool:[0,0,0,0],flash:0,wall:0,wallTime:0,dash:0,lightning:false,guardBroken:0,hurt:0,castPose:null,land:0,evade:0,buffered:null,trailClock:0,airHang:0,chase:0,chaseCooldown:0,chaseTarget:null,substitute:0,subCharges:2,subRecharge:0,ultimate:f.enemy?0:50,ultimatePose:null,sprinting:false,sprintExhausted:false,staminaDelay:0});f.root.position.set(x,.15,z);f.rig.rotation.set(0,0,0);f.cloth.emissive.setHex(0);}
function reset(arena=true){fx.clear();points=[0,0];pointGain=0;pointGainAge=0;koTime=0;cutinTime=0;for(const p of pops)p.life=0;hitStop=0;comboHits=0;comboAge=0;duelTime=0;ended=false;paused=false;locked=false;aiTimer=1.6;attackNumber=0;resetFighter(player,0,arena?-22:24);resetFighter(enemy,0,-35);for(const c of crates){c.hp=22;c.mesh.visible=true;solids[c.solid].disabled=false;}for(const p of projectiles){scene.remove(p.mesh);art.disposeProjectile(p.mesh);}projectiles.length=0;keys.clear();yaw=0;pitch=.22;cameraPos.copy(player.root.position).add(new T.Vector3(0,4,8));$('result').classList.add('hidden');$('pausemenu').classList.add('hidden');if(started)toast(arena?'MAKO AWAITS · TAB TO LOCK ON':'WELCOME TO ANSE-AUX-BÈTS',2.5);}
function capture(){try{const r=canvas.requestPointerLock();if(r&&r.catch)r.catch(()=>{});}catch{}}
function start(arena){audioBus.start();audioBus.setEnabled(soundOn);started=true;round++;$('menu').classList.add('hidden');$('hud').classList.remove('hidden');reset(arena);sound(540,.25);capture();}
function showResult(){if(!ended)return;if(document.pointerLockElement)document.exitPointerLock();$('resulttitle').textContent=player.hp>0?'VICTORY':'RISE AGAIN';$('resultbody').textContent=player.hp>0?'Mako yields. The island has seen what you can do.':'Every legend begins with another attempt. Guard, dodge, and use Manman Dlo to heal.';$('result').classList.remove('hidden');}
function pauseGame(){if(!started||ended)return;paused=!paused;keys.clear();$('pausemenu').classList.toggle('hidden',!paused);if(paused&&document.pointerLockElement)document.exitPointerLock();}
function action(name){if(!started||paused||ended)return;if(name==='jump')jump();if(name==='light')attack(player,false);if(name==='heavy')attack(player,true);if(name==='dodge')dodge();if(name==='chase')chase();if(name==='escape')substitute();}
const buttonMap={5:()=>unleash(),6:()=>substitute(),7:()=>chase(),0:()=>jump(),1:()=>dodge(),2:()=>attack(player,false),3:()=>attack(player,true),9:()=>pauseGame(),11:()=>toggleLock(),12:()=>cast(0),13:()=>cast(2),14:()=>cast(3),15:()=>cast(1)};
function pollGamepad(){const pads=navigator.getGamepads?navigator.getGamepads():[];const gp=Array.from(pads).find(p=>p&&p.connected);if(!gp){padMove.set(0,0);padYaw=padPitch=0;padSprint=padGuard=false;previousButtons=[];return;}const dead=v=>Math.abs(v)<.18?0:v;padMove.set(dead(gp.axes[0]||0),dead(gp.axes[1]||0));padYaw=dead(gp.axes[2]||0);padPitch=dead(gp.axes[3]||0);padSprint=!!gp.buttons[10]?.pressed;padGuard=!!gp.buttons[4]?.pressed;for(const [i,fn]of Object.entries(buttonMap)){const pressed=!!gp.buttons[i]?.pressed;if(pressed&&!previousButtons[i]){if(started&&!paused&&!ended||+i===9)fn();}previousButtons[i]=pressed;}}
window.addEventListener('keydown',e=>{if(['Space','Tab','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();if(e.repeat)return;keys.add(e.code);if(e.code==='KeyP'||e.code==='Escape'){if(started&&!ended)pauseGame();return;}if(!started||paused)return;if(e.code==='KeyR'){reset(true);return;}if(ended)return;if(e.code==='Space')jump();if(e.code==='KeyJ')attack(player,false);if(e.code==='KeyK')attack(player,true);if(e.code==='ControlLeft'||e.code==='ControlRight')dodge();if(e.code==='Tab')toggleLock();if(/^Digit[1-4]$/.test(e.code))cast(+e.code.slice(-1)-1);if(e.code==='KeyC'){outfit=(outfit+1)%4;setLook();}if(e.code==='KeyM')toggleSound();if(e.code==='KeyE')chase();if(e.code==='KeyF')substitute();if(e.code==='Digit5')unleash();});
window.addEventListener('keyup',e=>keys.delete(e.code));window.addEventListener('blur',()=>{keys.clear();if(started&&!ended&&!paused)pauseGame();});
canvas.addEventListener('contextmenu',e=>e.preventDefault());canvas.addEventListener('pointerdown',e=>{if(!started||paused||ended)return;if(e.pointerType==='touch')return;if(document.pointerLockElement!==canvas){capture();return;}if(e.button===0)attack(player,false);if(e.button===2)attack(player,true);});
let drag=null;canvas.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')drag={x:e.clientX,y:e.clientY,id:e.pointerId};});window.addEventListener('pointermove',e=>{if(document.pointerLockElement===canvas&&started&&!paused){if(!locked)yaw-=e.movementX*.003;pitch=clamp(pitch+e.movementY*.002,-.1,.85);}else if(drag&&e.pointerId===drag.id){yaw-=(e.clientX-drag.x)*.007;pitch=clamp(pitch+(e.clientY-drag.y)*.005,-.1,.85);drag={x:e.clientX,y:e.clientY,id:e.pointerId};}});window.addEventListener('pointerup',()=>drag=null);
document.querySelectorAll('[data-slot]').forEach(b=>b.onclick=()=>{if(started&&!paused&&!ended)cast(+b.dataset.slot);});document.querySelectorAll('[data-hold]').forEach(b=>{b.onpointerdown=e=>{e.preventDefault();b.setPointerCapture(e.pointerId);keys.add(b.dataset.hold);};b.onpointerup=b.onpointercancel=()=>keys.delete(b.dataset.hold);});document.querySelectorAll('[data-action]').forEach(b=>b.onpointerdown=e=>{e.preventDefault();action(b.dataset.action);});document.querySelectorAll('[data-color]').forEach(b=>b.onclick=()=>{outfit=+b.dataset.color;setLook();});document.querySelectorAll('[data-skin]').forEach(b=>b.onclick=()=>{skin=+b.dataset.skin;setLook();});
$('chasebutton').onclick=()=>{if(started&&!paused&&!ended)chase();};$('escapebutton').onclick=()=>{if(started&&!paused&&!ended)substitute();};$('ultimatebutton').onclick=()=>{if(started&&!paused&&!ended)unleash();};
$('play').onclick=()=>start(true);$('explore').onclick=()=>start(false);$('duel').onclick=()=>reset(true);$('again').onclick=()=>{round++;reset(true);capture();};$('village').onclick=()=>reset(false);$('pause').onclick=pauseGame;$('resume').onclick=()=>{if(paused)pauseGame();capture();};$('restart').onclick=()=>{reset(true);capture();};function toggleSound(){soundOn=!soundOn;audioBus.setEnabled(soundOn);$('sound').textContent='Sound: '+(soundOn?'ON':'OFF');}$('sound').onclick=toggleSound;
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);post.setSize(innerWidth,innerHeight,Math.min(devicePixelRatio,1.75));});
$('loadstatus').textContent='Ready to play · no download needed';cameraPos.set(4,5,34);let previous=performance.now();
function simulate(dt){
 time+=dt;islandDecor.update(time);
 if(!ended){
  if(player.root.position.z<-14)duelTime+=dt;
  if(hitStop>0){hitStop=Math.max(0,hitStop-dt);fx.update(dt);}else{updatePlayer(dt);updateAI(dt);updateEffects(dt);}
  if(toastTime>0){toastTime-=dt;if(toastTime<=0)$('toast').style.opacity=0;}
  if(comboAge>0){comboAge-=dt;if(comboAge<=0)comboHits=0;}
 }else{fx.update(dt);art.animate(player,time,dt);art.animate(enemy,time,dt);}
}
function frame(now){
 requestAnimationFrame(frame);const elapsed=Math.min(Math.max(0,(now-previous)/1000),.15);previous=now;
 if(started&&!ended)pollGamepad();
 if(!paused){if(started){const steps=Math.max(1,Math.ceil(elapsed/.0167));for(let i=0;i<steps;i++)simulate(elapsed/steps);}else{time+=elapsed;islandDecor.update(time);player.angle=-.28;player.root.rotation.y=player.angle;art.animate(player,time,elapsed);}}
 audioBus.update(elapsed,{playing:started&&!ended,paused,speed:player.moveSpeed,grounded:player.ground});updateCamera(elapsed);if(started)updateHUD();updateAnimeLayer(elapsed);post.update(elapsed);post.render();
}
requestAnimationFrame(frame);
// Deterministic test access is opt-in; absent in regular sessions.
if(new URLSearchParams(location.search).has('test'))window.KarukeraTest={player,enemy,start,reset,attack,cast,damage,jump,dodge,updatePlayer,updateAI,updateEffects,moveXZ,solids,crates,scene,renderer,fx,art,islandDecor,sceneryBatch,frame,updateHUD,updateCamera,getState:()=>({started,paused,ended,locked,hitStop,comboHits,points:points.slice(),koTime,cutinTime,auraLevel:auraLevel.slice()}),post,lockRing,auras,updateAnimeLayer,pops,setKey:(key,on)=>on?keys.add(key):keys.delete(key),step:dt=>{time+=dt;updatePlayer(dt);updateAI(dt);updateEffects(dt);},pauseGame,toggleLock,chase,substitute,unleash,motion,audioBus,simulate,camera,clearSight,projectiles};
})();
