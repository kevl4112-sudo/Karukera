/* KARUKERA: basalt sanctum, Creole streets and tropical coastal depth. */
(function(global){
'use strict';const T=global.THREE,A=global.KarukeraArt=global.KarukeraArt||{};
let state=173;const rand=()=>{state=(state*1664525+1013904223)>>>0;return state/4294967296;};
const cache={};
function drawnTexture(kind){
 if(cache[kind])return cache[kind];const c=document.createElement('canvas');c.width=c.height=512;const g=c.getContext('2d');
 g.fillStyle=kind==='stone'?'#c8cfca':'#eee6d6';g.fillRect(0,0,512,512);
 for(let i=0;i<1100;i++){const v=kind==='stone'?170+Math.floor(rand()*55):205+Math.floor(rand()*35);g.fillStyle=`rgba(${v},${v+2},${v-4},${kind==='stone'?.15:.10})`;g.fillRect(rand()*512,rand()*512,1+rand()*12,1+rand()*3);}
 g.lineWidth=kind==='stone'?2:1;g.strokeStyle=kind==='stone'?'#4f62686e':'#82776a38';
 const count=kind==='stone'?42:22;for(let i=0;i<count;i++){let x=rand()*512,y=rand()*512;g.beginPath();g.moveTo(x,y);for(let j=0;j<(kind==='stone'?5:3);j++){x+=(rand()-.45)*32;y+=6+rand()*20;g.lineTo(x,y);}g.stroke();}
 if(kind==='stone'){g.strokeStyle='#edf2d46e';g.lineWidth=1;for(let i=0;i<35;i++){const x=rand()*512,y=rand()*512;g.beginPath();g.moveTo(x,y);g.lineTo(x+12+rand()*18,y-2);g.stroke();}}
 const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;texture.wrapS=texture.wrapT=T.RepeatWrapping;cache[kind]=texture;return texture;
}
function leaf(){if(cache.leaf)return cache.leaf;const v=[],indices=[];for(let i=0;i<=12;i++){const t=i/12,w=Math.sin(Math.PI*t)*.49*(i%3===1?.79:1);for(const s of [-1,1])v.push(s*w,t*3.4,-Math.sin(t*Math.PI)*.40+t*t*.25);if(i<12){const n=i*2;indices.push(n,n+1,n+2,n+1,n+3,n+2);}}const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(v,3));geo.setIndex(indices);geo.computeVertexNormals();cache.leaf=geo;return geo;}
const palmMaterials=new Map();
A.palm=function(scene,x,z,scale,gradient){
 const material=c=>{if(!palmMaterials.has(c))palmMaterials.set(c,new T.MeshToonMaterial({color:c,gradientMap:gradient,side:T.DoubleSide}));return palmMaterials.get(c);};
 const group=new T.Group();group.position.set(x,0,z);group.scale.setScalar(scale);scene.add(group);
 const trunk=new T.Mesh(new T.CylinderGeometry(.17,.34,7,9,5),material(0x92734e));trunk.position.set(.3,3.5,0);trunk.rotation.z=-.08;trunk.castShadow=true;group.add(trunk);
 for(let i=0;i<9;i++){const pivot=new T.Group();pivot.position.set(.57,6.9,0);pivot.rotation.y=i*Math.PI*2/9;group.add(pivot);const l=new T.Mesh(leaf(),material(i%2?0x3a9a45:0x66bd4a));l.rotation.x=1.22;l.castShadow=true;pivot.add(l);}
 for(let i=0;i<12;i++){const band=new T.Mesh(new T.TorusGeometry(.22-i*.004,.018,4,10),material(0xb2986d));band.rotation.x=Math.PI/2;band.position.set(.1+i*.035,.7+i*.48,0);group.add(band);}
 for(let i=0;i<3;i++){const c=new T.Mesh(new T.SphereGeometry(.17,8,6),material(0x8b7952));c.position.set(.5+Math.sin(i*2)*.2,6.7,Math.cos(i*2)*.2);group.add(c);}return group;
};
A.tree=function(scene,solids,x,z,kind,gradient,scale=1){
 const m=c=>new T.MeshToonMaterial({color:c,gradientMap:gradient});const g=new T.Group();g.position.set(x,0,z);g.scale.setScalar(scale);scene.add(g);
 const flamboyant=kind==='flamboyant',trunkMat=m(flamboyant?0x8a6b52:0x6f5640),h=flamboyant?3.6:4.2;
 const trunk=new T.Mesh(new T.CylinderGeometry(.28,.48,h,9),trunkMat);trunk.position.y=h/2;trunk.castShadow=true;g.add(trunk);
 for(let k=0;k<(flamboyant?4:3);k++){const a=k*2.1+.4,b=new T.Mesh(new T.CylinderGeometry(.1,.2,2.6,6),trunkMat);b.position.set(Math.cos(a)*.7,h+.5,Math.sin(a)*.7);b.rotation.set(Math.sin(a)*.8,0,-Math.cos(a)*.8);b.castShadow=true;g.add(b);}
 const leafA=m(flamboyant?0x4f9a3c:0x3f9a3e),leafB=m(flamboyant?0x6dbb48:0x5cb84a),bloomA=m(0xff4a1f),bloomB=m(0xffa21f),puff=new T.IcosahedronGeometry(1,1);
 const lobes=flamboyant?[[0,0,0,3.6,1.3,3.4],[1.9,.2,.6,2.2,1.1,2.1],[-1.8,.1,-.5,2.3,1.1,2.2],[.3,.7,-1.6,2.2,1.1,2],[-.4,.6,1.7,2,1,2]]:[[0,.6,0,2.8,2.5,2.8],[1.5,0,.4,1.9,1.7,1.9],[-1.4,.1,-.4,2,1.8,1.9],[.2,1.6,.1,1.8,1.5,1.8],[0,-.1,1.4,1.8,1.4,1.7]];
 for(const [i,l]of lobes.entries()){const c=new T.Mesh(puff,flamboyant?(i%2?bloomA:bloomB):(i%2?leafA:leafB));c.position.set(l[0],h+1.6+l[1],l[2]);c.scale.set(l[3],l[4],l[5]);c.castShadow=true;c.receiveShadow=true;g.add(c);
  if(flamboyant){const under=new T.Mesh(puff,leafA);under.position.set(l[0]*.9,h+1.25+l[1],l[2]*.9);under.scale.set(l[3]*.92,l[4]*.6,l[5]*.92);g.add(under);}}
 if(solids)solids.push({x,y:h/2*scale,z,w:.9*scale,h:h*scale,d:.9*scale,wall:true});return g;
};
A.decorateWorld=function(scene,solids,gradient){
 const animated=[],paint=drawnTexture('plaster'),stone=drawnTexture('stone'),materials=new Map(),waterUniforms={time:{value:0}};
 const toon=(c,texture=false)=>{const k=c+':'+texture;if(!materials.has(k))materials.set(k,new T.MeshToonMaterial({color:c,gradientMap:gradient,map:texture==='stone'?stone:texture?paint:null}));return materials.get(k);};
 function obj(geo,c,x,y,z,parent=scene,texture=false){const m=new T.Mesh(geo,toon(c,texture));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 function box(x,y,z,w,h,d,c,parent=scene,texture=false){return obj(new T.BoxGeometry(w,h,d),c,x,y,z,parent,texture);}
 function solid(x,y,z,w,h,d,wall=false){solids.push({x,y,z,w,h,d,wall});}
 function line(points,color=0x344e56,parent=scene){const segments=[];for(let i=1;i<points.length;i++)segments.push(points[i-1],points[i]);const l=new T.LineSegments(new T.BufferGeometry().setFromPoints(segments),new T.LineBasicMaterial({color}));parent.add(l);return l;}
 function floorRing(inner,outer,color,y=.135){const m=obj(new T.RingGeometry(inner,outer,96),color,0,y,-32);m.rotation.x=-Math.PI/2;return m;}
 // Give the earlier blockout a coherent volcanic/coastal palette before merging it.
 const houses=[0xe8a04c,0xd96855,0x79bda1,0xd5a95e,0x58a5b1,0xf0bd68,0xa88ab9,0xde8969];
 scene.traverse(o=>{if(!o.isMesh||!o.material?.color)return;const c=o.material.color.getHex();if(houses.includes(c)){o.material.map=paint;o.material.needsUpdate=true;}if(c===0x509897){o.material.color.setHex(0x627c77);o.material.map=stone;o.material.needsUpdate=true;}if(c===0xc69b6a)o.material.color.setHex(0x5ca63f);if(c===0xd8b681)o.material.color.setHex(0xd9b779);});
 // Hand-drawn stone court. These are visual inlays on the existing collision floor.
 const disk=obj(new T.CircleGeometry(11.65,96),0x93a49b,0,.132,-32,scene,'stone');disk.rotation.x=-Math.PI/2;
 floorRing(10.95,11.4,0xd2b88a,.134);floorRing(10.55,10.64,0x294e59,.136);floorRing(7.9,8.0,0xc4ab7f,.137);floorRing(2.95,3.04,0xabb397,.138);
 for(let i=0;i<20;i++){const a=i*Math.PI/10;line([new T.Vector3(Math.sin(a)*3.05,.141,-32+Math.cos(a)*3.05),new T.Vector3(Math.sin(a)*7.85,.141,-32+Math.cos(a)*7.85)],0x4b6468);}
 // Original island-energy sigil: tidal spirals and a six-point seed motif.
 for(let k=0;k<6;k++){const a=k*Math.PI/3,points=[];for(let i=0;i<24;i++){const t=i/23*3.6,r=.2+t*.22,angle=a+t;points.push(new T.Vector3(Math.sin(angle)*r,.147,-32+Math.cos(angle)*r));}line(points,0xc4ccaa);}
 const tileGeo=new T.BoxGeometry(.40,.028,.72),tiles=new T.InstancedMesh(tileGeo,toon(0xb4ab89,'stone'),72),dummy=new T.Object3D();
 for(let i=0;i<72;i++){const a=i*Math.PI*2/72;dummy.position.set(Math.sin(a)*10.85,.132,-32+Math.cos(a)*10.85);dummy.rotation.y=a;dummy.updateMatrix();tiles.setMatrixAt(i,dummy.matrix);}tiles.instanceMatrix.needsUpdate=true;scene.add(tiles);
 // Tall cracked stelae create the clip's vertical silhouettes, with local island motifs.
 const stelae=[];for(const [i,a]of [-1.2,-.8,.8,1.2,2.0,2.5,3.8,4.2].entries()){
  const x=Math.sin(a)*10.8,z=-32+Math.cos(a)*10.8,h=[6.6,8.2,7.1,9.3,7.5,5.7,8.3,6.2][i],g=new T.Group();g.position.set(x,0,z);scene.add(g);
  const geo=new T.CylinderGeometry(.53,.73,h,8,5),pos=geo.attributes.position;
  for(let j=0;j<pos.count;j++){const y=pos.getY(j);if(y>h*.32)pos.setY(j,y+Math.sin(pos.getX(j)*7+pos.getZ(j)*3+i)*.18);}geo.computeVertexNormals();
  obj(geo,i%2?0xb3ab94:0x9c9d8c,0,h/2,0,g,'stone');solid(x,h/2,z,1.25,h,1.25,true);
  obj(new T.CylinderGeometry(.90,.96,.35,8),0x5d7470,0,.18,0,g,'stone');obj(new T.CylinderGeometry(.60,.63,.17,8),0xc1b799,0,h-.12,0,g,'stone');
  for(let band=0;band<3;band++){const y=1.35+band*(h-2.1)/3;const collar=obj(new T.CylinderGeometry(.60,.61,.13,8),0x485f63,0,y,0,g);}
  const crack=[];for(let j=0;j<8;j++)crack.push(new T.Vector3(Math.sin(j*1.9+i)*.27,.6+j*(h-.9)/8,.73-j*.012));line(crack,0x263c44,g);
  const glyph=[];for(let j=0;j<26;j++){const t=j/25*5.5;glyph.push(new T.Vector3(Math.sin(t)*(.04+t*.035),h*.60+Math.cos(t)*(.04+t*.035),.61));}line(glyph,0xd4d4ad,g);
  const vinePoints=[new T.Vector3(.55,h-.6,.10),new T.Vector3(.80,h*.65,.35),new T.Vector3(.65,h*.3,.6),new T.Vector3(.75,.2,.3)];obj(new T.TubeGeometry(new T.CatmullRomCurve3(vinePoints),12,.035,4,false),0x527550,0,0,0,g);
  for(let k=0;k<4;k++){const m=obj(new T.IcosahedronGeometry(.25,0),0x6e8e5b,Math.sin(k*2)*.7,.22,Math.cos(k*2)*.7,g);m.scale.set(1.4,.35,1.4);}stelae.push(g);
 }
 // Ceremonial entrance arch and draped Madras pennants. Central approach stays open.
 for(const s of [-1,1]){box(s*5.6,1.7,-16.6,1.1,3.4,1.3,0x8d9b8c,scene,'stone');solid(s*5.6,1.7,-16.6,1.1,3.4,1.3,true);obj(new T.CylinderGeometry(.82,.88,.25,8),0xc6bc98,s*5.6,3.5,-16.6);}
 const arch=obj(new T.TorusGeometry(5.65,.37,7,40,Math.PI),0x83968b,0,3.45,-16.6,scene,'stone');
 // Fort Saint-Louis-inspired coastal ruins: warm stone, open ocean gaps and moss.
 for(const s of [-1,1]){const x=s*19,z=-54;obj(new T.CylinderGeometry(4.3,4.8,11.8,14),0xb6b39a,x,5.9,z,scene,'stone');solid(x,5.9,z,8.6,11.8,8.6,true);obj(new T.CylinderGeometry(4.9,4.9,.4,14),0xd8c6a0,x,12,z);for(let i=0;i<9;i++){const a=i*Math.PI*2/9;box(x+Math.sin(a)*4.2,12.5,z+Math.cos(a)*4.2,.7,.85,.7,0xc6baa0);}for(let k=0;k<3;k++)box(x,2.6+k*3,z+4.34,1.1,1.6,.08,0x355763);}
 box(0,5.5,-54,30,11,3,0xb8b29a,scene,'stone');solid(0,5.5,-54,30,11,3,true);
 for(let k=-3;k<=3;k++){box(k*4,7.5,-52.45,1.1,2,.08,0x304d58);box(k*4,11.4,-54,1.3,1,3.3,0xcdbd9b);}
 // East-side inhabited Creole quarter, quieter west side opens toward the coast.
 for(let i=0;i<3;i++){
  const x=21,z=-20-i*12,h=9+i*1.4,c=[0xddaa78,0x86aaa0,0xd8be8f][i];box(x,h/2,z,9,h,9,c,scene,true);solid(x,h/2,z,9,h,9,true);box(x,h+.15,z,10,.3,10,0xe6caa0);solid(x,h+.15,z,10,.3,10);
  for(let level=0;level<3;level++){const y=2+level*3.1;for(let k=-1;k<=1;k++){box(x+k*2.6,y,z+4.54,1.3,1.8,.09,0x355c6c);box(x+k*2.6,y+1,z+4.7,1.7,.18,.6,0x456e6f);for(let j=0;j<3;j++)box(x+k*2.6-.44+j*.44,y,z+4.62,.04,1.85,.06,0xc1b995);}box(x,y+1.5,z+4.6,9.15,.18,.25,0xd9c19c);}
  for(let level=0;level<2;level++){const y=2.2+level*3.4;for(let k of [-1,1])box(16.43,y,z+k*2,.1,1.8,1.3,0x244b58);box(15.6,y-.9,z,1.8,.18,8,0x657b72);for(let k=-3;k<=3;k++)box(14.8,y-.45,z+k,.07,.8,.07,0x334c52);box(14.8,y-.05,z,.08,.08,8,0xeac99b);}
  for(let k of [-1,1]){const roof=box(x,h+.85,z+k*2.3,10.2,.20,5.2,i%2?0x426e77:0xb26551);roof.rotation.x=k*.22;}
 }
 // Physical roof route retained: flat gallery, rail and stepping platforms.
 box(0,7.3,-40,29,.45,2.5,0x7c8270,scene,'stone');solid(0,7.3,-40,29,.45,2.5);
 for(const z of [-41.25,-38.75]){box(0,8.15,z,28,.12,.12,0xd2bf94);solid(0,8.15,z,28,.12,.12);for(let x=-13;x<=13;x+=2.6)box(x,7.8,z,.10,1.1,.10,0x38555a);}
 for(const side of [-1,1]){box(side*13.3,6.05,-32,3,.3,30,0xa4ad91);solid(side*13.3,6.05,-32,3,.3,30);for(let i=0;i<4;i++){const x=side*(8.5+i*.65),z=-17-i*2.1,y=.65+i*.75;box(x,y/2,z,2.3,y,1.8,0x879786,scene,'stone');solid(x,y/2,z,2.3,y,1.8,true);}}
 // Training-ground shade trees in the arena corners, flamboyants through the village.
 for(const [x,z,k,sc] of [[-11.6,-45.6,'mango',.95],[11.4,-45.4,'flamboyant',1],[-30,30,'flamboyant',1.2],[24.5,-3,'flamboyant',1.05],[-31,6,'mango',1.2],[-34,-14,'flamboyant',1.05],[7.5,47,'flamboyant',.9],[-7.5,47,'mango',.85],[-26,44,'mango',1.1],[-22,-6,'mango',1.05]])A.tree(scene,solids,x,z,k,gradient,sc);
 // Lush grounding in the village; one instanced draw each for grass and ferns.
 const grassGeo=new T.BufferGeometry();grassGeo.setAttribute('position',new T.Float32BufferAttribute([-.10,0,0,0,.43,0,.1,0,0,0,0,-.10,0,.33,0,0,0,.1],3));grassGeo.computeVertexNormals();
 const grass=new T.InstancedMesh(grassGeo,new T.MeshToonMaterial({color:0x4f9e3a,gradientMap:gradient,side:T.DoubleSide}),900),dummyGrass=new T.Object3D();
 for(let i=0;i<900;i++){let x=(rand()-.5)*95,z=(rand()-.5)*125;if(Math.abs(x)<5&&z>-17)x+=7;if(Math.hypot(x,z+32)<11.8)x+=(x<0?-1:1)*13;dummyGrass.position.set(x,.14,z);dummyGrass.rotation.y=rand()*6.28;dummyGrass.scale.setScalar(.6+rand()*1.6);dummyGrass.updateMatrix();grass.setMatrixAt(i,dummyGrass.matrix);}grass.instanceMatrix.needsUpdate=true;scene.add(grass);
 const ferns=new T.InstancedMesh(leaf(),new T.MeshToonMaterial({color:0x4aa24a,gradientMap:gradient,side:T.DoubleSide}),120);
 for(let i=0;i<120;i++){const side=i%2?-1:1,x=side*(18+rand()*26),z=45-rand()*105;dummyGrass.position.set(x,.1,z);dummyGrass.rotation.set(.25+rand()*.5,rand()*6.28,(rand()-.5)*.2);dummyGrass.scale.setScalar(.3+rand()*.45);dummyGrass.updateMatrix();ferns.setMatrixAt(i,dummyGrass.matrix);}scene.add(ferns);
 // Large buttress-root trees, dense layered canopy and trailing lianas.
 for(let i=0;i<8;i++){const x=30+(i%2)*10,z=35-i*10,h=15+(i%3)*3;obj(new T.CylinderGeometry(.9,1.8,h,10),0x5d7353,x,h/2,z,scene,'stone');solid(x,h/2,z,2.7,h,2.7,true);for(let k=0;k<5;k++){const a=k*Math.PI*2/5,r=obj(new T.ConeGeometry(1.1,3.4,4),0x67794f,x+Math.sin(a),1.5,z+Math.cos(a));r.scale.z=.4;r.rotation.y=a;}for(let k=0;k<5;k++){const m=obj(new T.IcosahedronGeometry(1,1),k%2?0x5b8453:0x789858,x+(k-2)*1.5,h-1+(k%2),z+Math.sin(k)*2);m.scale.set(4.6,2.8,4.2);}const points=[];for(let j=0;j<12;j++)points.push(new T.Vector3(x-2+Math.sin(j*.7)*.35,h-1-j*.9,z+1));line(points,0x4b744d);}
 // Cliff stacks and distant coastal silhouettes tie the arena to an island skyline.
 for(let i=0;i<9;i++){const x=-41-rand()*12,z=-48+i*7,m=obj(new T.IcosahedronGeometry(1,1),i%2?0x789184:0x8b9b83,x,1.8,z,scene,'stone');m.scale.set(5+rand()*3,3+rand()*6,4+rand()*4);const cap=obj(new T.IcosahedronGeometry(1,0),0x819965,x,4.1,z);cap.scale.set(5,1,4);}
 for(let i=0;i<7;i++){const m=obj(new T.IcosahedronGeometry(1,1),i%2?0x668b81:0x72978b,-74-i*10,1,-78-i*4);m.scale.set(7+i*2,4+i*1.7,8);}
 // Animated ocean beyond playable terrain; no invisible swimming claims.
 const sea=new T.Mesh(new T.PlaneGeometry(900,900),new T.ShaderMaterial({uniforms:waterUniforms,vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 vUv;uniform float time;void main(){float w=sin(vUv.x*420.+time*.45)*sin(vUv.y*340.-time*.30);float stripe=smoothstep(.70,.80,w);float d=length(vUv-.5);vec3 deep=vec3(.03,.36,.62),lagoon=vec3(.12,.78,.80);vec3 c=mix(lagoon,deep,smoothstep(.06,.2,d));c=mix(c,vec3(.93,1.,.98),stripe*.55);gl_FragColor=vec4(c,1.);}'}));sea.rotation.x=-Math.PI/2;sea.position.set(0,-1.31,0);sea.userData.dynamic=true;sea.name='Turquoise Caribbean water';scene.add(sea);
 // Hibiscus flower heads add small saturated notes among the greens.
 for(let i=0;i<20;i++){const x=(i%2?-1:1)*(20+rand()*8),z=36-i*3.5,g=new T.Group();g.position.set(x,0,z);scene.add(g);for(let k=0;k<4;k++){const l=obj(leaf(),0x527e53,Math.sin(k)*.25,.1,Math.cos(k)*.25,g);l.material.side=T.DoubleSide;l.rotation.set(.5,k*1.57,.2);l.scale.setScalar(.35);}for(let k=0;k<5;k++){const a=k*Math.PI*2/5,m=obj(new T.SphereGeometry(.11,6,5),i%2?0xe5886e:0xc85c57,Math.sin(a)*.14,1.2,Math.cos(a)*.14,g);m.scale.y=.4;}obj(new T.SphereGeometry(.045,6,5),0xe9d188,0,1.23,0,g);}
 // Madras pennants live over the village, while the sanctum keeps its monumental scale.
 for(let row=0;row<3;row++){const z=20-row*13,points=[];for(let i=0;i<=12;i++){const x=-15+i*2.5;points.push(new T.Vector3(x,7.5-Math.sin(i/12*Math.PI)*1.6,z));}line(points,0x56615c);for(let i=1;i<12;i++){const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute([-.35,0,0,.35,0,0,0,-.65,0],3));geo.computeVertexNormals();const m=new T.Mesh(geo,new T.MeshToonMaterial({color:[0xe1af61,0xb85f51,0x5d9688][i%3],side:T.DoubleSide,gradientMap:gradient}));m.position.set(-15+i*2.5,7.5-Math.sin(i/12*Math.PI)*1.6,z);m.userData.dynamic=true;scene.add(m);animated.push(m);}}
 const cloudMat=new T.MeshToonMaterial({color:0xffffff,gradientMap:gradient,fog:false,emissive:0x3a5f8a,emissiveIntensity:.32}),puff=new T.IcosahedronGeometry(1,2);
 for(let i=0;i<16;i++){const a=i/16*Math.PI*2+rand()*.2,r=165+rand()*40,g=new T.Group();g.position.set(Math.sin(a)*r,34+rand()*36,Math.cos(a)*r-20);g.lookAt(0,g.position.y,0);scene.add(g);const n=6+Math.floor(rand()*5),w=10+rand()*12;
  for(let j=0;j<n;j++){const t=j/(n-1)-.5,m=new T.Mesh(puff,cloudMat),s=(1-Math.abs(t)*1.2)*(5+rand()*4);m.position.set(t*w*2.2,Math.max(0,s*.45)+rand()*2,rand()*4-2);m.scale.set(s*1.2,s,s);g.add(m);}
  const base=new T.Mesh(puff,cloudMat);base.scale.set(w*1.15,2.2,6);base.position.y=-.8;g.add(base);}
 return {animated,arena:{name:'Morne des Esprits',radius:11.65,stelae:stelae.length},update(time){waterUniforms.time.value=time;animated.forEach((m,i)=>{m.rotation.y=Math.sin(time*1.5+i)*.16;m.rotation.x=Math.sin(time*2+i)*.08;});}};
};
})(window);

/* Merge immutable scenery by material to bound draw calls as decoration grows. */
(function(global){const T=global.THREE,A=global.KarukeraArt;
A.batchScenery=function(scene){
 scene.updateMatrixWorld(true);const buckets=new Map(),remove=[];let sourceMeshes=0;
 scene.traverse(o=>{
  if((!o.isMesh&&!o.isLineSegments)||o.isInstancedMesh||Array.isArray(o.material))return;
  let node=o;while(node){if(node.userData.dynamic)return;node=node.parent;}
  const m=o.material;if(!o.geometry?.attributes.position||(m.transparent&&!o.isLineSegments))return;
  const key=[o.isLineSegments?'lines':'mesh',m.type,m.color?.getHex(),m.map?.uuid||'',m.side,m.gradientMap?.uuid||'',!!m.fog,m.opacity,!!o.geometry.attributes.normal,!!o.geometry.attributes.uv,o.castShadow,o.receiveShadow].join(':');
  if(!buckets.has(key))buckets.set(key,{material:m,positions:[],normals:[],uvs:[],lines:o.isLineSegments,cast:o.castShadow,receive:o.receiveShadow});
  const bucket=buckets.get(key),g=(o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone()).applyMatrix4(o.matrixWorld);
  for(const v of g.attributes.position.array)bucket.positions.push(v);
  if(g.attributes.normal)for(const v of g.attributes.normal.array)bucket.normals.push(v);
  if(g.attributes.uv)for(const v of g.attributes.uv.array)bucket.uvs.push(v);
  g.dispose();remove.push(o);sourceMeshes++;
 });
 for(const o of remove)if(o.parent)o.parent.remove(o);
 for(const b of buckets.values()){
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(b.positions,3));
  if(b.normals.length)g.setAttribute('normal',new T.Float32BufferAttribute(b.normals,3));
  if(b.uvs.length)g.setAttribute('uv',new T.Float32BufferAttribute(b.uvs,2));
  g.computeBoundingSphere();const m=b.lines?new T.LineSegments(g,b.material):new T.Mesh(g,b.material);m.name='Batched island scenery';m.castShadow=b.cast;m.receiveShadow=b.receive;scene.add(m);
 }
 return {sourceMeshes,batches:buckets.size};
};})(window);
