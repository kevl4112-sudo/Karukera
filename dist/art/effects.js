/* KARUKERA: bounded, original island-energy VFX. Shared geometry; owned materials. */
(function(global){
'use strict';
const T=global.THREE,A=global.KarukeraArt=global.KarukeraArt||{};
const sphere=new T.SphereGeometry(1,16,12),ring=new T.RingGeometry(.94,1,64),arc=new T.RingGeometry(.84,1.03,36,1,0,Math.PI*1.4),rock=new T.DodecahedronGeometry(1,0),torus=new T.TorusGeometry(1,.045,5,56),flame=new T.ConeGeometry(1,3,8);
const petalShape=new T.Shape();petalShape.moveTo(0,-1);petalShape.quadraticCurveTo(-.65,-.15,0,1);petalShape.quadraticCurveTo(.65,.15,0,-1);const petal=new T.ShapeGeometry(petalShape);
const reduced=!!global.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
function basic(color,opacity=1,additive=false){return new T.MeshBasicMaterial({color,transparent:true,opacity,depthWrite:false,side:T.DoubleSide,blending:additive?T.AdditiveBlending:T.NormalBlending});}
function fadeGroup(group,opacity){group.traverse(o=>{if(o.material)o.material.opacity=opacity*(o.userData.alpha??1);});}
function owned(mesh){mesh.userData.ownGeometry=true;return mesh;}
function ParticleLayer(scene,additive){
 const count=384,positions=new Float32Array(count*3),colors=new Float32Array(count*3),sizes=new Float32Array(count),life=new Float32Array(count),velocity=new Float32Array(count*3);let cursor=0;
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.BufferAttribute(positions,3));geometry.setAttribute('tint',new T.BufferAttribute(colors,3));geometry.setAttribute('size',new T.BufferAttribute(sizes,1));
 const material=new T.ShaderMaterial({transparent:true,depthWrite:false,blending:additive?T.AdditiveBlending:T.NormalBlending,uniforms:{pixelScale:{value:Math.min(global.devicePixelRatio||1,1.75)*350}},vertexShader:'attribute vec3 tint; attribute float size; varying vec3 vColor; varying float vSize; uniform float pixelScale; void main(){vColor=tint;vSize=size;vec4 p=modelViewMatrix*vec4(position,1.);gl_PointSize=min(90.,size*pixelScale/max(1.,-p.z));gl_Position=projectionMatrix*p;}',fragmentShader:'varying vec3 vColor; varying float vSize; void main(){if(vSize<.001)discard;float r=length(gl_PointCoord-vec2(.5))*2.;if(r>1.)discard;float a=pow(1.-r,1.6);vec3 core=mix(vColor,vec3(1.),pow(max(0.,1.-r*3.),3.)*.35);gl_FragColor=vec4(core,a*.82);}'});
 const points=new T.Points(geometry,material);points.frustumCulled=false;points.renderOrder=4;scene.add(points);
 this.emit=(pos,color,num=12,spread=2,up=2,lifetime=.5,size=.22)=>{const c=new T.Color(color);const amount=Math.ceil(num*(reduced?.45:1));for(let i=0;i<amount;i++){const k=cursor++%count,j=k*3;positions[j]=pos.x;positions[j+1]=pos.y+.8;positions[j+2]=pos.z;velocity[j]=(Math.random()-.5)*spread;velocity[j+1]=Math.random()*up;velocity[j+2]=(Math.random()-.5)*spread;colors[j]=c.r;colors[j+1]=c.g;colors[j+2]=c.b;life[k]=lifetime*(.6+Math.random()*.8);sizes[k]=size*(.4+Math.random());}};
 this.update=dt=>{for(let i=0;i<count;i++){if(life[i]<=0){sizes[i]=0;continue;}life[i]-=dt;const j=i*3;positions[j]+=velocity[j]*dt;positions[j+1]+=velocity[j+1]*dt;positions[j+2]+=velocity[j+2]*dt;velocity[j+1]-=dt*(additive?4:1.1);sizes[i]*=Math.pow(Math.max(0,life[i]/(life[i]+dt)),.3);}geometry.attributes.position.needsUpdate=true;geometry.attributes.tint.needsUpdate=true;geometry.attributes.size.needsUpdate=true;};
 this.clear=()=>{life.fill(0);sizes.fill(0);geometry.attributes.size.needsUpdate=true;};this.points=points;
}
A.FX=function(scene){
 const active=[],sparks=new ParticleLayer(scene,true),dust=new ParticleLayer(scene,false);let clock=0,lastUltimate=null;
 this.active=active;this.sparks=sparks;
 function dispose(m){scene.remove(m);const geometries=new Set(),materials=new Set();m.traverse(o=>{if(o.userData.ownGeometry&&o.geometry)geometries.add(o.geometry);if(o.material)materials.add(o.material);});for(const g of geometries)g.dispose();for(const m of materials)m.dispose();}
 function effect(m,duration,update){scene.add(m);if(active.length>=120){dispose(active[0].mesh);active.shift();}active.push({mesh:m,duration,age:0,update});return m;}
 function glow(position,color,size=1,duration=.3){const p=position.clone(),m=new T.Mesh(sphere,basic(color,.20,true));m.position.copy(p);m.position.y+=1;return effect(m,duration,(m,t)=>{m.scale.setScalar(size*(.3+t));m.material.opacity=(1-t)*.20;});}
 function ribbon(points,color,width=.035,opacity=.8){return owned(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points),18,width,4,false),basic(color,opacity,true)));}
 this.glow=glow;
 this.wave=(position,color,radius=3,duration=.5)=>{const p=position.clone(),m=new T.Mesh(ring,basic(color,.8,true));m.rotation.x=-Math.PI/2;m.position.copy(p);m.position.y+=.14;effect(m,duration,(m,t)=>{m.scale.setScalar(.15+radius*t);m.material.opacity=(1-t)*.8;});};
 this.impact=(position,color=0xffd28a,size=1,duration=.35)=>{
  const p=position.clone();sparks.emit(p,color,Math.round(12*size),size*7,5,.4,.13);glow(p,color,size*.8,duration);
  const star=new T.Group();star.position.copy(p);star.position.y+=1;
  for(let i=0;i<7;i++){const m=new T.Mesh(sphere,basic(i%2?0xfff6cf:color,1,true)),angle=i*Math.PI*2/7;m.position.set(Math.cos(angle)*.45,Math.sin(angle)*.45,0);m.scale.set(.65,.027,.023);m.rotation.z=angle;star.add(m);}
  effect(star,reduced?.24:.18,(m,t)=>{m.scale.setScalar(size*(.5+t*1.5));fadeGroup(m,1-t);});
 };
 this.slash=(f,heavy=false)=>{
  const group=new T.Group();group.position.copy(f.root.position);group.position.y+=heavy?1.45:1.25;group.rotation.set(heavy?.35:1.05,f.angle,heavy?-.7:.25);
  for(let i=0;i<2;i++){const m=new T.Mesh(arc,basic(i?0xfffce1:(heavy?0xffbc64:0x9cefe9),i?.75:.55,true));m.scale.setScalar(i?.91:1);m.rotation.z=i*.035;group.add(m);}
  effect(group,.24,(m,t)=>{const s=(heavy?2.3:1.55)*(.7+t*.45);m.scale.setScalar(s);m.rotation.z+=reduced?0:.035;fadeGroup(m,(1-t)*.8);});
 };
 this.dust=(position,intensity=1)=>dust.emit(position.clone(),0xd8cca5,Math.ceil(9*intensity),4*intensity,1.2,.8,.5*intensity);
 this.eruption=position=>{
  const p=position.clone();this.wave(p,0xffb74d,7,.65);this.wave(p,0xffecc0,5,.4);dust.emit(p,0xd5b18c,34,13,5,1.3,1.15);sparks.emit(p,0xffb45a,65,13,13,.8,.18);
  for(let i=0;i<10;i++){const a=i*Math.PI/5,m=new T.Mesh(rock,new T.MeshToonMaterial({color:i%2?0x8c654d:0xc69b6c})),speed=3+(i%3)*1.2;effect(m,1.1,(m,t)=>{m.position.set(p.x+Math.cos(a)*speed*t,p.y+Math.max(.08,Math.sin(t*Math.PI)*(1.6+i%3)),p.z+Math.sin(a)*speed*t);m.rotation.x=t*5;m.rotation.z=t*4;m.scale.setScalar((1-t)*(.2+i%3*.1));});}
  const pillars=new T.Group();pillars.position.copy(p);
  for(let i=0;i<7;i++){const a=i*Math.PI*2/7,m=new T.Mesh(flame,basic(i%2?0xffd475:0xff8744,.6,true));m.position.set(Math.sin(a)*3,1.5,Math.cos(a)*3);m.rotation.z=Math.sin(a)*-.15; m.userData.alpha=.65;pillars.add(m);}
  effect(pillars,.65,(m,t)=>{const pulse=Math.sin(t*Math.PI);m.scale.set(1+pulse*.15,pulse*1.8,1+pulse*.15);fadeGroup(m,(1-t)*.65);});
 };
 this.heal=position=>{
  const p=position.clone();this.wave(p,0x67eff3,4,.8);
  for(let i=0;i<3;i++){const m=new T.Mesh(torus,basic(i%2?0x78eacf:0xd5fff6,.7,true));m.position.copy(p);m.rotation.x=Math.PI/2;effect(m,1,(m,t)=>{m.position.y=p.y+.2+t*2.4+i*.2;m.scale.setScalar((1.3+i*.2)*(1-t*.35));m.rotation.z=t*3;m.material.opacity=(1-t)*.6;});}
  sparks.emit(p,0x8ef9de,48,3,4,1,.12);
 };
 this.lightning=position=>{
  const p=position.clone(),group=new T.Group();group.position.copy(p);
  for(let i=0;i<3;i++){const points=[];for(let j=0;j<7;j++)points.push(new T.Vector3((i-1)*.3+(j%2?.2:-.2),j*.35,-j*.12));const m=ribbon(points,i%2?0x8beaff:0xfff8bc,.014,.75);group.add(m);}
  effect(group,.16,(m,t)=>fadeGroup(m,1-t));sparks.emit(p,0xdafaff,4,2,2,.2,.09);
 };
 this.afterimage=(f,color=0x73c4e4)=>{
  const group=new T.Group();group.position.copy(f.root.position);group.rotation.y=f.angle;
  for(const [x,y,z,sx,sy,sz]of [[0,1.3,0,.30,.49,.19],[0,2.04,0,.23,.28,.22],[-.43,1.3,.2,.10,.41,.10],[.43,1.3,.2,.10,.41,.10],[-.18,.5,0,.12,.48,.12],[.18,.5,.1,.12,.48,.12]]){const m=new T.Mesh(sphere,basic(color,.14,true));m.position.set(x,y,z);m.scale.set(sx,sy,sz);group.add(m);}
  effect(group,reduced?.12:.24,(m,t)=>fadeGroup(m,(1-t)*.14));
 };
 this.fireTrail=position=>{sparks.emit(new T.Vector3(position.x,position.y-.8,position.z),0xff9748,4,1.5,.8,.3,.17);};
 this.chaseTrail=f=>{
  const p=f.root.position.clone(),direction=f.dashDir?.clone()||new T.Vector3(-Math.sin(f.angle),0,-Math.cos(f.angle));if(direction.lengthSq()<.01)direction.set(-Math.sin(f.angle),0,-Math.cos(f.angle));direction.normalize();
  const right=new T.Vector3().crossVectors(direction,new T.Vector3(0,1,0)).normalize();if(right.lengthSq()<.01)right.set(1,0,0);
  const group=new T.Group();group.position.copy(p);
  for(let i=0;i<2;i++){const points=[];for(let j=0;j<9;j++){const distance=j*.55,v=direction.clone().multiplyScalar(-distance);v.addScaledVector(right,(i?1:-1)*(.25+Math.sin(j*.7+clock*9)*.28));v.y+=1.1+Math.sin(j*.45+i)*.12;points.push(v);}group.add(ribbon(points,i?0xbff9ff:0x289ddd,i?.017:.028,.8));}
  effect(group,reduced?.15:.32,(m,t)=>fadeGroup(m,(1-t)*.72));sparks.emit(p,0x9ae7ff,2,1,.4,.22,.075);
 };
 this.substitute=position=>{
  const p=position.clone();dust.emit(p,0xd9e7da,35,6,3,.8,.75);sparks.emit(p,0xb5f5d4,18,5,4,.65,.10);this.wave(p,0xb6e8c6,2.3,.45);
  const group=new T.Group();group.position.copy(p);
  for(let i=0;i<(reduced?9:18);i++){const a=i*2.399,m=new T.Mesh(petal,basic([0xf0bd70,0x96cfa1,0xda8274][i%3],.9));m.userData.angle=a;m.userData.speed=1.2+(i%4)*.55;m.userData.startY=.5+(i%5)*.26;m.scale.setScalar(.10+(i%3)*.035);group.add(m);}
  effect(group,1.1,(g,t)=>{for(let i=0;i<g.children.length;i++){const m=g.children[i],a=m.userData.angle+t*2;m.position.set(Math.cos(a)*m.userData.speed*t,m.userData.startY+Math.sin(t*Math.PI)*1.4-t*.5,Math.sin(a)*m.userData.speed*t);m.rotation.set(t*5+i,a,t*3);m.material.opacity=(1-t)*.9;}});
 };
 this.ultimate=(position,phase='charge')=>{
  const p=position.clone(),stage=typeof phase==='number'?(phase>=1?'burst':'charge'):phase;
  // Event API: harmless if a caller repeats a charge/burst event in nearby frames.
  if(lastUltimate&&lastUltimate.stage===stage&&clock-lastUltimate.at<.55&&lastUltimate.p.distanceToSquared(p)<.25)return;
  lastUltimate={stage,at:clock,p:p.clone()};
  if(stage==='charge'){
   const group=new T.Group();group.position.copy(p);
   for(let i=0;i<2;i++){const points=[];for(let j=0;j<=36;j++){const a=j/36*Math.PI*3.5+i*Math.PI,r=1.25-j/36*.35;points.push(new T.Vector3(Math.cos(a)*r,j/36*3.6,Math.sin(a)*r));}group.add(ribbon(points,i?0x9df1ec:0xffd581,.045,.6));}
   for(let i=0;i<3;i++){const m=new T.Mesh(torus,basic(i%2?0x66d8d1:0xf1cc79,.55,true));m.rotation.x=Math.PI/2;m.position.y=.1+i*.85;m.scale.setScalar(1.25-i*.15);group.add(m);}
   effect(group,.95,(g,t)=>{g.rotation.y=reduced?0:t*2;g.scale.setScalar(.6+Math.sin(t*Math.PI/2)*.5);fadeGroup(g,Math.sin(t*Math.PI)*.65);});sparks.emit(p,0xffe0a0,36,2,6,.85,.11);glow(p,0x8ae4db,2,.8);this.wave(p,0xd5eed0,2.3,.7);return;
  }
  if(stage!=='burst')return;
  this.wave(p,0xffe9a8,9,.85);this.wave(p,0x64ddd9,11,1.1);this.wave(p,0xffaa5b,6,.55);
  sparks.emit(p,0xffcc75,100,19,13,1.2,.18);dust.emit(p,0xd5cfb1,42,15,5,1.5,1.0);
  const group=new T.Group();group.position.copy(p);const core=new T.Mesh(sphere,basic(0xffe5a0,.22,true));core.userData.alpha=.25;core.position.y=1.4;group.add(core);
  for(let i=0;i<4;i++){const points=[];for(let j=0;j<=34;j++){const t=j/34,a=t*Math.PI*3+i*Math.PI/2,r=.5+t*5;points.push(new T.Vector3(Math.cos(a)*r,1+Math.sin(t*Math.PI)*3.6,Math.sin(a)*r));}const m=ribbon(points,i%2?0x7bf2e2:0xffc06a,i%2?.055:.12,.8);m.userData.alpha=.8;group.add(m);}
  for(let i=0;i<3;i++){const m=new T.Mesh(torus,basic(i%2?0xffd077:0xb3fff4,.5,true));m.rotation.set(.4+i*.7,i,.3);m.userData.alpha=.5;group.add(m);}
  effect(group,1.35,(g,t)=>{g.rotation.y=reduced?0:t*2;const spread=.2+Math.sin(Math.min(1,t*1.5)*Math.PI/2);g.scale.setScalar(spread);core.scale.setScalar(2+Math.sin(t*Math.PI)*3.4);for(let i=5;i<g.children.length;i++)g.children[i].scale.setScalar(2+t*5);fadeGroup(g,(1-t)*.8);});
 };
 this.update=dt=>{clock+=dt;sparks.update(dt);dust.update(dt);for(let i=active.length-1;i>=0;i--){const e=active[i];e.age+=dt;const t=Math.min(1,e.age/e.duration);e.update(e.mesh,t);if(t>=1){dispose(e.mesh);active.splice(i,1);}}};
 this.clear=()=>{for(const e of active)dispose(e.mesh);active.length=0;sparks.clear();dust.clear();lastUltimate=null;};
};
A.fireOrb=function(){
 const group=new T.Group();group.userData.fireOrb=true;
 const core=new T.Mesh(sphere,basic(0xfff2b0,1,true));core.scale.setScalar(.52);group.add(core);
 const outer=new T.Mesh(sphere,basic(0xff8f32,.22,true));outer.scale.setScalar(.85);group.add(outer);
 for(let i=0;i<3;i++){const m=new T.Mesh(torus,basic(i%2?0xffdf79:0xff762f,.9,true));m.scale.setScalar(.70+i*.07);m.rotation.set(i*1.1,i*.7,i*.4);group.add(m);}
 for(let i=0;i<5;i++){const m=new T.Mesh(flame,basic(i%2?0xffb74c:0xff762f,.55,true));m.position.set(Math.sin(i*1.256)*.4,Math.cos(i*1.256)*.4,.3);m.scale.set(.12,.38,.12);m.rotation.z=-i*1.256;group.add(m);}return group;
};
A.animateOrb=(group,time)=>{group.rotation.y=time*5;group.rotation.z=time*3;group.children[1].scale.setScalar(.83+Math.sin(time*22)*.075);};
A.disposeProjectile=group=>{const materials=new Set();group.traverse(o=>{if(o.material)materials.add(o.material);});for(const material of materials)material.dispose();};
})(window);
