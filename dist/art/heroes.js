/* KARUKERA heroes: four original fighters from the project's concept sheets.
   Smooth lathe/tube sculpting, painted cloth, anime faces and ink hulls on the shared fighter skeleton,
   so every existing pose and combat animation keeps working. */
(function(global){
'use strict';
const T=global.THREE,A=global.KarukeraArt=global.KarukeraArt||{},TAU=Math.PI*2;

A.HEROES=[
 {id:'toussaint',name:'TOUSSAINT',title:'GADYEN FÒ · IRON GUARDIAN',letter:'T',swatch:['#2a2a33','#8c1c32','#9aa0aa'],aura:0xff4a3d,skin:0x6b4128,iris:'#6b3f1f',hair:0x18161c},
 {id:'leo',name:'LÉO ZÉKLÈ',title:'STORM RUNNER',letter:'L',swatch:['#1d1d24','#ffcc1f','#ffffff'],aura:0xffd23f,skin:0x8a5634,iris:'#f2b51c',hair:0x16151a},
 {id:'anselm',name:'ANSÈLM',title:'KENBWAZÈ · SPIRIT FLAME',letter:'A',swatch:['#2b1f3d','#a37ae0','#d9c8ff'],aura:0xb06bff,skin:0xe0b08c,iris:'#b6a2ea',hair:0x1c1626},
 {id:'yana',name:'YANA',title:'FI MANMAN DLO · SEA DRAGON',letter:'Y',swatch:['#f4f4f8','#1f3fa8','#1b8f86'],aura:0x3fe0d0,skin:0x7a4a2c,iris:'#f0b03a',hair:0x121018,female:true}
];

// Ink hull: back faces pushed out along view-space normals, slightly thicker with distance.
const inkMat=new T.ShaderMaterial({uniforms:{thick:{value:.0105},ink:{value:new T.Color(0x14121c)}},side:T.BackSide,
 vertexShader:'uniform float thick;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);vec3 vn=normalize(normalMatrix*normal);mv.xyz+=vn*thick*(1.+(-mv.z)*.03);gl_Position=projectionMatrix*mv;}',
 fragmentShader:'uniform vec3 ink;void main(){gl_FragColor=vec4(ink,1.);\n#include <colorspace_fragment>\n}'});

const texCache={};
function canvasTex(key,w,h,draw,repeat){
 if(texCache[key])return texCache[key];const c=global.document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');
 if(g&&g.arc&&g.createLinearGradient&&g.ellipse)draw(g,w,h);
 const t=new T.CanvasTexture(c);if(T.SRGBColorSpace)t.colorSpace=T.SRGBColorSpace;if(repeat){t.wrapS=t.wrapT=T.RepeatWrapping;}t.anisotropy=4;texCache[key]=t;return t;
}
const hex=n=>'#'+n.toString(16).padStart(6,'0');
function shade(c,k){const n=parseInt(c.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;const f=v=>Math.max(0,Math.min(255,Math.round(k<0?v*(1+k):v+(255-v)*k)));return '#'+((f(r)<<16)|(f(g)<<8)|f(b)).toString(16).padStart(6,'0');}
function bolt(g,x,y,s,fill,stroke){g.save();g.translate(x,y);g.scale(s,s);g.beginPath();g.moveTo(6,-40);g.lineTo(-18,4);g.lineTo(-2,4);g.lineTo(-10,40);g.lineTo(18,-8);g.lineTo(2,-8);g.closePath();g.fillStyle=fill;g.fill();if(stroke){g.lineWidth=3/s;g.strokeStyle=stroke;g.stroke();}g.restore();}
function flame(g,x,y,s,fill){g.save();g.translate(x,y);g.scale(s,s);g.beginPath();g.moveTo(0,40);g.bezierCurveTo(-30,30,-28,0,-10,-12);g.bezierCurveTo(-14,4,-4,8,0,0);g.bezierCurveTo(-6,-20,8,-30,4,-46);g.bezierCurveTo(26,-26,30,8,14,22);g.bezierCurveTo(22,10,20,0,16,-4);g.bezierCurveTo(18,20,10,36,0,40);g.closePath();g.fillStyle=fill;g.fill();g.restore();}
function diamond(g,x,y,w,h,stroke,lw){g.beginPath();g.moveTo(x,y-h);g.lineTo(x+w,y);g.lineTo(x,y+h);g.lineTo(x-w,y);g.closePath();g.lineWidth=lw;g.strokeStyle=stroke;g.stroke();}

// ---------- painted cloth ----------
const TEX={
 toussaintCoat:()=>canvasTex('tcoat',512,512,(g,w,h)=>{g.fillStyle='#2b2b33';g.fillRect(0,0,w,h);for(let i=0;i<600;i++){g.fillStyle=`rgba(${i%2?60:20},${i%2?60:20},${i%2?72:30},.18)`;g.fillRect(Math.random()*w,Math.random()*h,2+Math.random()*16,1+Math.random()*3);}
  g.fillStyle='#8c1c32';g.fillRect(0,h-26,w,20);g.fillStyle='#9aa0aa';g.fillRect(0,h-8,w,4);
  g.fillStyle='#8c1c32';g.fillRect(w/2-44,0,10,h);g.fillRect(w/2+34,0,10,h);
  g.strokeStyle='#8c1c32';g.lineWidth=12;g.beginPath();g.moveTo(w*.12,0);g.lineTo(0,h*.55);g.stroke();g.beginPath();g.moveTo(w*.88,0);g.lineTo(w,h*.55);g.stroke();
  g.strokeStyle='#a8adb6';g.lineWidth=9;for(const x of [0,w]){g.save();g.translate(x,h*.24);for(let k=0;k<3;k++){g.beginPath();g.arc(Math.cos(k*TAU/3)*16,Math.sin(k*TAU/3)*16,16,0,TAU);g.stroke();}g.restore();}}),
 tabard:()=>canvasTex('tabard',128,512,(g,w,h)=>{const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#6e1426');gr.addColorStop(1,'#9b2238');g.fillStyle=gr;g.fillRect(0,0,w,h);g.strokeStyle='#b9bec7';g.lineWidth=6;g.strokeRect(8,-10,w-16,h-4);diamond(g,w/2,h*.78,34,30,'#c9ced6',7);diamond(g,w/2,h*.78,16,14,'#c9ced6',5);diamond(g,w/2,h*.6,20,18,'#c9ced6',5);}),
 leoJacket:()=>canvasTex('ljacket',512,512,(g,w,h)=>{g.fillStyle='#1c1c22';g.fillRect(0,0,w,h);g.fillStyle='#ffcc1f';g.fillRect(0,h-34,w,26);g.fillRect(0,0,14,h);g.fillRect(w-14,0,14,h);
  bolt(g,w*.5,h*.45,3.4,'#ffcc1f');bolt(g,w*.1,h*.42,1.2,'#ffcc1f');g.strokeStyle='#ffcc1f';g.lineWidth=5;g.beginPath();g.arc(w*.28,h*.25,20,0,TAU);g.stroke();bolt(g,w*.28,h*.25,.45,'#ffcc1f');g.beginPath();g.arc(w*.72,h*.25,20,0,TAU);g.stroke();bolt(g,w*.72,h*.25,.45,'#ffcc1f');}),
 leoPants:()=>canvasTex('lpants',256,512,(g,w,h)=>{g.fillStyle='#1d1d24';g.fillRect(0,0,w,h);g.fillStyle='#ffcc1f';g.fillRect(w*.24,0,7,h);g.fillStyle='#e9e9ee';g.fillRect(0,h*.62,w,26);bolt(g,w*.66,h*.35,1.6,'#ffcc1f');g.fillStyle='#ffcc1f';g.fillRect(0,h*.06,w,10);}),
 wrap:()=>canvasTex('wrap',256,256,(g,w,h)=>{g.fillStyle='#f2b51c';g.fillRect(0,0,w,h);g.fillStyle='#c7820c';for(let x=0;x<w;x+=32){g.beginPath();g.moveTo(x,h*.55);g.lineTo(x+16,h*.3);g.lineTo(x+32,h*.55);g.fill();}g.fillStyle='#1d1d24';g.fillRect(0,h*.6,w,10);g.fillRect(0,h*.2,w,6);for(let x=0;x<w;x+=24){g.beginPath();g.moveTo(x+4,h*.66);g.lineTo(x+12,h*.8);g.lineTo(x+20,h*.66);g.fill();}g.fillStyle='#ffe38a';for(let x=0;x<w;x+=10)g.fillRect(x,h*.9,5,h*.1);}),
 robe:()=>canvasTex('robe',512,512,(g,w,h)=>{const gr=g.createLinearGradient(0,h,0,0);gr.addColorStop(0,'#9b77dc');gr.addColorStop(.45,'#4b3570');gr.addColorStop(1,'#2a1f3e');g.fillStyle=gr;g.fillRect(0,0,w,h);for(let i=0;i<7;i++)flame(g,(i+.5)*w/7,h*(i%2?.35:.55),1.5+i%3*.4,'rgba(200,170,255,.55)');for(let i=0;i<7;i++)flame(g,(i+.5)*w/7,h*(i%2?.35:.55),.8+i%3*.2,'rgba(240,225,255,.45)');}),
 sleeve:()=>canvasTex('psleeve',256,256,(g,w,h)=>{const gr=g.createLinearGradient(0,h,0,0);gr.addColorStop(0,'#b997f0');gr.addColorStop(.6,'#5a3f86');gr.addColorStop(1,'#2e2244');g.fillStyle=gr;g.fillRect(0,0,w,h);for(let i=0;i<4;i++)flame(g,(i+.5)*w/4,h*.32,1.1,'rgba(235,220,255,.5)');}),
 scales:()=>canvasTex('scales',256,256,(g,w,h)=>{g.fillStyle='#f6f6fa';g.fillRect(0,0,w,h);g.strokeStyle='#b8bcd6';g.lineWidth=2;for(let y=0;y<h+16;y+=16)for(let x=-16;x<w+16;x+=24){g.beginPath();g.arc(x+(y/16%2)*12,y,12,0,Math.PI);g.stroke();}},true),
 cape:()=>canvasTex('cape',256,512,(g,w,h)=>{g.fillStyle='#1b8f86';g.fillRect(0,0,w,h);const gr=g.createLinearGradient(0,0,w,0);gr.addColorStop(0,'rgba(0,0,0,.18)');gr.addColorStop(1,'rgba(255,255,255,.08)');g.fillStyle=gr;g.fillRect(0,0,w,h);g.strokeStyle='#e2b84e';g.lineWidth=10;g.strokeRect(6,6,w-12,h-12);
  g.lineWidth=14;g.lineCap='round';g.beginPath();g.moveTo(w*.6,h*.16);g.bezierCurveTo(w*.15,h*.25,w*.85,h*.45,w*.35,h*.55);g.bezierCurveTo(w*.05,h*.62,w*.6,h*.8,w*.45,h*.9);g.stroke();g.lineWidth=5;g.strokeStyle='#ffe08a';for(let i=0;i<14;i++){const t=i/13,x=w*(.6-.25*Math.sin(t*6)),y=h*(.18+t*.7);g.beginPath();g.arc(x,y,7,0,Math.PI);g.stroke();}
  g.fillStyle='#e2b84e';g.beginPath();g.moveTo(w*.6,h*.16);g.lineTo(w*.74,h*.1);g.lineTo(w*.68,h*.2);g.fill();}),
 guard:()=>canvasTex('guard',128,128,(g,w,h)=>{g.fillStyle='#1d2850';g.fillRect(0,0,w,h);g.strokeStyle='#d8b04a';g.lineWidth=2;for(let y=0;y<h+10;y+=12)for(let x=-12;x<w+12;x+=16){g.beginPath();g.arc(x+(y/12%2)*8,y,8,0,Math.PI);g.stroke();}g.fillStyle='#d8b04a';g.fillRect(0,0,w,8);g.fillRect(0,h-8,w,8);},true),
 wraps:()=>canvasTex('wraps',128,128,(g,w,h)=>{g.fillStyle='#eceaf0';g.fillRect(0,0,w,h);g.strokeStyle='#9d9aae';g.lineWidth=4;for(let y=-w;y<h*2;y+=22){g.beginPath();g.moveTo(0,y);g.lineTo(w,y+40);g.stroke();g.beginPath();g.moveTo(w,y);g.lineTo(0,y+40);g.stroke();}},true),
 wrapsPurple:()=>canvasTex('wrapsP',128,128,(g,w,h)=>{g.fillStyle='#2c2238';g.fillRect(0,0,w,h);g.strokeStyle='#c8b2ef';g.lineWidth=9;for(let y=-w;y<h*2;y+=30){g.beginPath();g.moveTo(0,y);g.lineTo(w,y+40);g.stroke();g.beginPath();g.moveTo(w,y);g.lineTo(0,y+40);g.stroke();}},true),
 rope:(c1,c2)=>canvasTex('rope'+c1+c2,128,32,(g,w,h)=>{g.fillStyle=c1;g.fillRect(0,0,w,h);g.strokeStyle=c2;g.lineWidth=5;for(let x=-h;x<w+h;x+=10){g.beginPath();g.moveTo(x,0);g.lineTo(x+h,h);g.stroke();}},true),
 tag:()=>canvasTex('tag',64,128,(g,w,h)=>{g.fillStyle='#efe2c4';g.fillRect(0,0,w,h);g.strokeStyle='#5b3e86';g.lineWidth=4;g.strokeRect(4,4,w-8,h-8);flame(g,w/2,h*.45,.55,'#6b4aa0');g.fillStyle='#6b4aa0';g.fillRect(w*.3,h*.78,w*.4,4);}),
 tabardWhite:()=>canvasTex('tabw',128,512,(g,w,h)=>{g.fillStyle='#f6f6fa';g.fillRect(0,0,w,h);g.strokeStyle='#c6cadf';g.lineWidth=2;for(let y=0;y<h;y+=14)for(let x=-14;x<w+14;x+=20){g.beginPath();g.arc(x+(y/14%2)*10,y,10,0,Math.PI);g.stroke();}g.strokeStyle='#d8b04a';g.lineWidth=8;g.strokeRect(4,-8,w-8,h);})
};

// ---------- anime faces (equirectangular head map; front of face at u=.75) ----------
function faceTexture(hero){
 return canvasTex('face-'+hero.id,1024,512,(g,w,h)=>{
  const skin=hex(hero.skin),cx=768,ink='#17121c';g.fillStyle=skin;g.fillRect(0,0,w,h);
  // soft cheek and jaw shading
  const sh=g.createRadialGradient(cx,300,40,cx,300,190);sh.addColorStop(0,'rgba(0,0,0,0)');sh.addColorStop(1,'rgba(40,10,10,.16)');g.fillStyle=sh;g.fillRect(cx-260,80,520,432);
  g.fillStyle='rgba(255,120,110,.16)';g.beginPath();g.ellipse(cx-62,305,22,10,0,0,TAU);g.ellipse(cx+62,305,22,10,0,0,TAU);g.fill();
  const id=hero.id,eyeY=268;
  function eye(x,s,iris,opts={}){g.save();g.translate(x,eyeY);g.scale(s,1);
   g.beginPath();g.moveTo(-26,5);g.quadraticCurveTo(-4,-21,27,-8);g.quadraticCurveTo(10,19,-26,5);g.fillStyle='#fbf8f2';g.fill();
   g.save();g.clip();g.beginPath();g.ellipse(1,1,13,17,0,0,TAU);const gr=g.createLinearGradient(0,-17,0,17);gr.addColorStop(0,shade(iris,-.55));gr.addColorStop(1,shade(iris,.2));g.fillStyle=gr;g.fill();
   g.beginPath();g.ellipse(1,2,6,9,0,0,TAU);g.fillStyle='#120d14';g.fill();g.fillStyle='#fff';g.beginPath();g.arc(-4,-6,4.5,0,TAU);g.fill();g.beginPath();g.arc(7,8,2,0,TAU);g.fill();g.restore();
   g.lineCap='round';g.strokeStyle=ink;g.lineWidth=7;g.beginPath();g.moveTo(-28,6);g.quadraticCurveTo(-4,-23,29,-9);g.stroke();g.lineWidth=4.5;g.beginPath();g.moveTo(27,-9);g.lineTo(36,-15);g.stroke();
   if(opts.lash){g.beginPath();g.moveTo(33,-12);g.lineTo(42,-12);g.stroke();g.beginPath();g.moveTo(22,-14);g.lineTo(30,-22);g.stroke();}
   g.lineWidth=2.4;g.beginPath();g.moveTo(-20,11);g.quadraticCurveTo(6,17,23,7);g.stroke();g.restore();}
  function brow(x,s,angry,thick=8){g.save();g.translate(x,eyeY-36);g.scale(s,1);g.strokeStyle=ink;g.lineCap='round';g.lineWidth=thick;g.beginPath();if(angry){g.moveTo(-24,10);g.lineTo(4,-2);g.lineTo(30,-6);}else{g.moveTo(-22,4);g.quadraticCurveTo(4,-8,30,-2);}g.stroke();g.restore();}
  const angry=id==='toussaint',lash=!!hero.female;
  if(id==='anselm'){eye(cx-52,-1,hero.iris);brow(cx-52,-1,false,6);} // right eye hidden under the bangs
  else{eye(cx-52,-1,hero.iris,{lash});eye(cx+52,1,hero.iris,{lash});brow(cx-52,-1,angry,id==='leo'?7:8);brow(cx+52,1,angry,id==='leo'?7:8);}
  g.strokeStyle=shade(skin,-.45);g.lineWidth=3;g.lineCap='round';g.beginPath();g.moveTo(cx+3,288);g.lineTo(cx+7,312);g.lineTo(cx-2,316);g.stroke();
  g.strokeStyle=ink;g.lineWidth=4;
  if(id==='leo'){g.beginPath();g.moveTo(cx-34,334);g.quadraticCurveTo(cx,362,cx+36,330);g.closePath();g.fillStyle='#fff';g.fill();g.stroke();g.beginPath();g.moveTo(cx-30,338);g.lineTo(cx+31,336);g.lineWidth=2;g.stroke();
   bolt(g,cx+82,300,.55,'#ffd23f',ink);bolt(g,cx+104,312,.32,'#ffd23f',ink);}
  else if(id==='yana'){g.fillStyle='#5a2236';g.beginPath();g.moveTo(cx-20,336);g.quadraticCurveTo(cx,330,cx+20,336);g.quadraticCurveTo(cx,348,cx-20,336);g.fill();g.lineWidth=2.5;g.stroke();}
  else if(id==='anselm'){g.beginPath();g.moveTo(cx-18,338);g.quadraticCurveTo(cx+4,342,cx+22,332);g.stroke();g.strokeStyle='#4a3060';g.lineWidth=3;for(let i=0;i<3;i++){g.beginPath();g.moveTo(cx-78+i*7,292+i*4);g.lineTo(cx-66+i*7,318+i*4);g.stroke();}}
  else{g.beginPath();g.moveTo(cx-20,338);g.quadraticCurveTo(cx,334,cx+20,340);g.stroke();
   // goatee, moustache and jaw beard
   g.fillStyle='#1b1418';g.beginPath();g.moveTo(cx-30,330);g.quadraticCurveTo(cx,318,cx+30,330);g.quadraticCurveTo(cx,326,cx-30,330);g.fill();
   g.beginPath();g.moveTo(cx-16,350);g.quadraticCurveTo(cx,346,cx+16,350);g.lineTo(cx+12,392);g.quadraticCurveTo(cx,404,cx-12,392);g.closePath();g.fill();
   g.lineWidth=7;g.strokeStyle='#1b1418';g.beginPath();g.moveTo(cx-150,250);g.quadraticCurveTo(cx-140,360,cx-22,392);g.stroke();g.beginPath();g.moveTo(cx+150,250);g.quadraticCurveTo(cx+140,360,cx+22,392);g.stroke();
   g.strokeStyle='#4a2c20';g.lineWidth=3;g.beginPath();g.moveTo(cx+62,226);g.lineTo(cx+80,246);g.stroke();}
  if(id==='leo'||id==='toussaint'){ // faded/shaved sides of the head
   g.fillStyle='rgba(20,16,22,.6)';g.fillRect(0,0,560,250);g.fillRect(980,0,44,250);for(const x of [512,0,1024]){g.beginPath();g.ellipse(x,170,140,110,0,0,TAU);g.fill();}
   if(id==='leo'){for(const x of [512,1024,0])bolt(g,x+(x===1024?-40:40),150,.9,'#2a2228','#0d0a10');}}
 });
}

// ---------- geometry helpers ----------
function lathe(pts,seg=22,phiStart=0,phiLength=TAU){return new T.LatheGeometry(pts.map(p=>new T.Vector2(Math.max(0,p[0]),p[1])),seg,phiStart,phiLength);}
function limbPts(r1,r2,len,bulge=0,cap=true){const pts=[];if(cap)for(let i=0;i<=4;i++){const a=-Math.PI/2+i/4*Math.PI/2;pts.push([Math.cos(a)*r2,-len+Math.sin(a)*r2]);}else pts.push([r2,-len]);
 for(let i=1;i<10;i++){const t=i/10;pts.push([r2+(r1-r2)*t+Math.sin(t*Math.PI)*bulge,-len+len*t]);}
 if(cap)for(let i=0;i<=4;i++){const a=i/4*Math.PI/2;pts.push([Math.cos(a)*r1,Math.sin(a)*r1]);}else pts.push([r1,0]);return pts;}
function strand(points,r0,r1,flat=1,seg=16,rad=8){
 const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(p[0],p[1],p[2])));const frames=curve.computeFrenetFrames(seg,false),pos=[],uv=[],idx=[];
 for(let i=0;i<=seg;i++){const t=i/seg,p=curve.getPointAt(t),N=frames.normals[i],B=frames.binormals[i],r=r0+(r1-r0)*Math.pow(t,1.2);
  for(let j=0;j<=rad;j++){const a=j/rad*TAU,cx=Math.cos(a)*r,cy=Math.sin(a)*r*flat;pos.push(p.x+N.x*cx+B.x*cy,p.y+N.y*cx+B.y*cy,p.z+N.z*cx+B.z*cy);uv.push(j/rad,t);}}
 for(let i=0;i<seg;i++)for(let j=0;j<rad;j++){const a=i*(rad+1)+j,b=a+rad+1;idx.push(a,a+1,b,b,a+1,b+1);}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g;}
function shapePanel(points){const s=new T.Shape();points.forEach((p,i)=>i?s.lineTo(p[0],p[1]):s.moveTo(p[0],p[1]));return new T.ShapeGeometry(s);}

A.makeHero=function(scene,heroIndex,enemy,gradient){
 const hero=A.HEROES[((heroIndex%4)+4)%4],female=!!hero.female;
 const mats=[];const M=(c,map,extra)=>{const m=new T.MeshToonMaterial(Object.assign({color:c,gradientMap:gradient},map?{map}:{},extra||{}));mats.push(m);return m;};
 const D=(c,map)=>M(c,map,{side:T.DoubleSide});
 function add(geo,mat,parent,p=[0,0,0],r=[0,0,0],s=[1,1,1],ink=true){const m=new T.Mesh(geo,mat);m.position.set(p[0],p[1],p[2]);m.rotation.set(r[0],r[1],r[2]);m.scale.set(s[0],s[1],s[2]);m.castShadow=true;parent.add(m);if(ink){const o=new T.Mesh(geo,inkMat);o.castShadow=false;m.add(o);}return m;}
 const ball=(r,mat,parent,p,s=[1,1,1],ink=true,seg=18)=>add(new T.SphereGeometry(r,seg,Math.round(seg*.75)),mat,parent,p,[0,0,0],s,ink);
 const ring=(r,tube,mat,parent,p,rot=[Math.PI/2,0,0],s=[1,1,1],arc=TAU)=>add(new T.TorusGeometry(r,tube,8,32,arc),mat,parent,p,rot,s,true);

 const root=new T.Group(),rig=new T.Group(),spine=new T.Group();root.add(rig);rig.add(spine);spine.position.y=1.39;scene.add(root);root.name=hero.name;
 const skin=M(hero.skin),hairMat=M(hero.hair),ink2=M(0x15131b);
 const palette={
  toussaint:{under:0x23232b,cloth:M(0xffffff,TEX.toussaintCoat()),trim:M(0x7a1428),metal:M(0x6c727d),dark:M(0x1e1e25),pants:D(0x26262e),boot:M(0x1d1d24)},
  leo:{under:0x22232c,cloth:D(0xffffff,TEX.leoJacket()),trim:M(0xffcc1f),metal:M(0xffcc1f),dark:M(0x1c1c22),pants:D(0xffffff,TEX.leoPants()),boot:M(0x1d1d24)},
  anselm:{under:0x1f1a28,cloth:D(0xffffff,TEX.robe()),trim:M(0xc8b2ef),metal:M(0xd8c7ff,null,{emissive:0x3a2266}),dark:M(0x1c1824),pants:D(0x1e1a26),boot:M(0x1d1a24)},
  yana:{under:0xf3f3f8,cloth:D(0xffffff,TEX.scales()),trim:M(0x1f3fa8),metal:M(0xe2b84e),dark:M(0x1d2850),pants:D(0x1c2348),boot:M(0x1c2348)}
 }[hero.id];
 const cloth=palette.cloth,trim=palette.trim,metal=palette.metal,dark=palette.dark,under=M(palette.under,hero.id==='yana'?TEX.scales():null);

 // ----- body base -----
 const W=female?.92:1;
 const torsoPts=female?[[0,-.37],[.19,-.37],[.2,-.28],[.175,-.14],[.2,.02],[.235,.16],[.225,.28],[.16,.38],[.075,.43],[0,.44]]:[[0,-.37],[.2,-.37],[.215,-.26],[.205,-.12],[.24,.04],[.275,.19],[.262,.3],[.18,.39],[.08,.44],[0,.45]];
 const torso=add(lathe(torsoPts),under,spine,[0,0,0],[0,0,0],[1,1,female?.78:.7]);
 add(lathe([[0,-.16],[.185*W,-.15],[.215*W,-.05],[.205*W,.08],[0,.1]]),hero.id==='yana'?palette.pants:dark,rig,[0,1.02,0],[0,0,0],[1,1,.78]);
 const headPivot=new T.Group();headPivot.position.set(0,.5,0);headPivot.scale.setScalar(.86);spine.add(headPivot);
 add(lathe(limbPts(.058,.066,.14,0,false)),skin,headPivot,[0,.07,0],[0,0,0],[1,1,1],false);
 // head: sphere with an anime chin, face painted on
 const headGeo=new T.SphereGeometry(.165,40,30),hp=headGeo.attributes.position;
 for(let i=0;i<hp.count;i++){let x=hp.getX(i),y=hp.getY(i),z=hp.getZ(i);if(y<.01){const f=Math.min(1,-y/.165+.06);x*=1-.32*f*f;z*=1-.12*f;if(z<0){z-=.018*f;y-=.03*f*f;}}if(z>0)z*=.96;hp.setXYZ(i,x,y,z);}
 headGeo.computeVertexNormals();
 const head=add(headGeo,M(0xffffff,faceTexture(hero)),headPivot,[0,.205,0],[0,0,0],[female?.96:1,1.1,1.02]);
 for(const s of [-1,1]){ball(.034,skin,headPivot,[s*.158,.2,.012],[.55,1,.8],true,10);}
 // ----- arms -----
 const arms=[],elbows=[],hands=[],legs=[],knees=[],feet=[];
 const sx=female?.265:.295;
 for(const s of [-1,1]){
  const shoulder=new T.Group();shoulder.position.set(s*sx,.26,0);spine.add(shoulder);
  ball(.095,hero.id==='yana'?skin:under,shoulder,[0,-.01,0],[1,.95,1]);
  add(lathe(limbPts(.075*W,.062*W,.37,.008)),skin,shoulder,[0,-.02,0]);
  const elbow=new T.Group();elbow.position.set(0,-.39,0);shoulder.add(elbow);
  add(lathe(limbPts(.062*W,.047*W,.34,.006)),skin,elbow);
  const hand=ball(.052,skin,elbow,[0,-.41,-.005],[.95,1.25,.62]);
  add(new T.CapsuleGeometry(.03,.05,4,8),skin,hand,[.045*s*-1,.02,-.03],[.4,0,s*.5],[1,1,1]);
  add(lathe(limbPts(.056,.05,.06,0)),hero.id==='anselm'||hero.id==='leo'||hero.id==='toussaint'||hero.id==='yana'?ink2:skin,elbow,[0,-.37,0],[0,0,0],[1.05,1,.75]);
  arms.push(shoulder);elbows.push(elbow);hands.push(hand);
  const hip=new T.Group();hip.position.set(s*.125*W,1.05,0);rig.add(hip);
  add(lathe(limbPts(.105*W,.075,.48,.012)),skin,hip,[0,-.02,0]);
  const knee=new T.Group();knee.position.set(0,-.5,0);hip.add(knee);
  add(lathe(limbPts(.076,.052,.42,.012)),skin,knee);
  const foot=new T.Group();foot.position.set(0,-.47,-.03);knee.add(foot);
  ball(.06,skin,foot,[0,-.005,-.07],[.85,.55,1.5]);
  add(new T.CylinderGeometry(.07,.072,.035,16),palette.boot,foot,[0,-.045,-.05],[0,0,0],[.95,1,1.8]);
  legs.push(hip);knees.push(knee);feet.push(foot);
 }

 const flaps=[],locs=[];const sash=new T.Group();sash.position.set(0,1.0,-.19);rig.add(sash);
 let cape=null,capePivot=null,capeGeometry=null,capeBase=null;
 const shell=(pts,mat,parent,p=[0,0,0],sz=1,phiS=0,phiL=TAU,ink=true)=>add(lathe(pts,24,phiS,phiL),mat,parent,p,[0,0,0],[1,1,sz],ink);
 // sleeves / pants / boots helpers on the shared skeleton
 function sleeves(upMat,foreMat,opts={}){for(let i=0;i<2;i++){const sh=arms[i],el=elbows[i];
   if(upMat)shell([[.088,-(opts.upLen||.38)],[.092,-.2],[.098,-.05],[.09,.04]],upMat,sh,[0,0,0]);
   if(opts.wide){shell([[.27,-.46],[.2,-.32],[.12,-.12],[.085,.02]],foreMat,el,[0,0,.02],1);}
   else if(foreMat)shell([[.07,-(opts.foreLen||.33)],[.072,-.18],[.076,-.02],[.078,.03]],foreMat,el,[0,0,0]);
  }}
 function pants(mat,baggy=1,cuffY=-.3){baggy=1+(baggy-1)*.75;for(let i=0;i<2;i++){shell([[.125*baggy,-.5],[.15*baggy,-.36],[.155*baggy,-.18],[.15,-.04],[.14,.04]],mat,legs[i],[0,0,0]);shell([[.075,cuffY],[.12*baggy,cuffY+.08],[.14*baggy,-.1],[.13*baggy,.04]],mat,knees[i],[0,0,0]);}}
 function shins(mat,top=-.26,bot=-.44){for(let i=0;i<2;i++)shell([[.064,bot],[.068,(top+bot)/2],[.074,top]],mat,knees[i],[0,0,0]);}
 function boots(mat,top=-.22){for(let i=0;i<2;i++){shell([[.07,-.46],[.074,-.36],[.082,top]],mat,knees[i]);ball(.07,mat,feet[i],[0,.005,-.03],[.95,.65,1.35]);}}

 // ----- per-hero outfit -----
 if(hero.id==='toussaint'){
  sleeves(cloth,cloth);pants(palette.pants,1.35,-.28);
  shell([[.27,-.36],[.29,-.1],[.31,.12],[.29,.3],[.2,.4],[.12,.44]],cloth,spine,[0,0,0],.74);
  shell([[.13,.38],[.15,.5],[.16,.56]],trim,spine,[0,0,0],.8,Math.PI*1.2,Math.PI*1.6); // high collar
  // chest plates
  add(new T.CylinderGeometry(.3,.28,.24,24,1,true,Math.PI-1.05,2.1),metal,spine,[0,.14,0],[0,0,0],[1,1,.78]);
  add(new T.CylinderGeometry(.285,.27,.14,24,1,true,Math.PI-1.0,2.0),metal,spine,[0,-.04,0],[0,0,0],[1,1,.8]);
  add(new T.OctahedronGeometry(.045),metal,spine,[0,.16,-.235],[0,0,0],[1,1,.4]);
  // layered pauldrons
  for(let i=0;i<2;i++){const s=i?1:-1,sh=arms[i];for(let k=0;k<3;k++){const c=s>0?Math.PI/2:Math.PI*1.5;add(new T.CylinderGeometry(.15+k*.012,.17+k*.014,.11,18,1,true,c-1.4,2.8),k===2?trim:metal,sh,[s*.02,.04-k*.085,0],[0,0,s*-.32],[1,1,1.05]);}
   add(new T.CylinderGeometry(.085,.08,.2,14,1,true),metal,elbows[i],[0,-.2,0]);ring(.085,.016,trim,elbows[i],[0,-.1,0]);ring(.08,.016,trim,elbows[i],[0,-.3,0]);
   add(new T.CylinderGeometry(.07,.064,.14,14,1,true,Math.PI-1.2,2.4),metal,knees[i],[0,-.28,-.01],[0,0,0],[1.2,1,1.3]);
   add(new T.OctahedronGeometry(.05),metal,knees[i],[0,-.06,-.11],[0,0,0],[1,1.3,.5]);ring(.075,.012,trim,knees[i],[0,-.38,0]);}
  boots(palette.boot,-.3);
  // coat tails + tassets on the swinging flaps
  for(const s of [-1,1]){const flap=new T.Group();flap.position.set(0,1.06,0);rig.add(flap);flaps.push(flap);
   const phiS=s>0?-.15:TAU+.15-2.25;add(lathe([[.4,-.78],[.34,-.45],[.28,-.12],[.25,0]],20,phiS,2.25),cloth,flap,[0,0,0],[0,0,0],[1,1,.85]);
   for(let k=0;k<3;k++){const c=s>0?Math.PI/2:Math.PI*1.5;add(new T.CylinderGeometry(.27+k*.025,.3+k*.025,.12,18,1,true,c-.95,1.9),k===2?trim:metal,flap,[0,-.08-k*.1,0],[0,0,0],[1,1,.85]);}}
  // rope belt, tabard, tassels
  ring(.24,.03,M(0xffffff,TEX.rope('#8c1c32','#5e1022')),rig,[0,1.08,0],[Math.PI/2,0,0],[1,.78,1]);
  add(new T.OctahedronGeometry(.05),metal,rig,[0,1.08,-.2],[0,0,0],[1,1,.5]);
  const tab=add(shapePanel([[0,0],[1,0],[1,-.82],[.5,-1],[0,-.82]]),M(0xffffff,TEX.tabard(),{side:T.DoubleSide}),sash,[-.1,.04,0],[0,0,0],[.2,.78,1]);
  for(const s of [-1,1]){add(strand([[s*.05,.06,-.01],[s*.07,-.12,-.03],[s*.06,-.3,-.04]],.022,.012),trim,sash,[0,0,0]);add(new T.ConeGeometry(.03,.09,10),trim,sash,[s*.06,-.32,-.04]);}
  // hair: shaved sides, top locs tied in a bun, two side locs with silver cuffs
  ball(.168,hairMat,headPivot,[0,.24,.035],[.82,.74,.98]);
  const bun=ball(.07,hairMat,headPivot,[0,.36,.07]);
  for(let i=0;i<11;i++){const a=i/11*TAU,piv=new T.Group();piv.position.set(0,.37,.07);headPivot.add(piv);locs.push(piv);
   const up=.06+(i%3)*.03;add(strand([[0,0,0],[Math.cos(a)*.05,up,Math.sin(a)*.05],[Math.cos(a)*.11,up-.03,Math.sin(a)*.11+.02],[Math.cos(a)*.14,up-.1,Math.sin(a)*.14+.04]],.021,.015,1,8,6),hairMat,piv);
   if(i%3===0)add(new T.CylinderGeometry(.02,.02,.025,8),metal,piv,[Math.cos(a)*.1,up-.02,Math.sin(a)*.1+.02],[0,0,Math.PI/2*Math.cos(a)],[1,1,1],false);}
  for(const s of [-1,1]){const piv=new T.Group();piv.position.set(s*.12,.3,-.06);headPivot.add(piv);locs.push(piv);add(strand([[0,0,0],[s*.04,-.08,-.02],[s*.05,-.22,-.02],[s*.04,-.32,-.01]],.018,.013),hairMat,piv);add(new T.CylinderGeometry(.021,.021,.03,8),metal,piv,[s*.05,-.2,-.02],[0,0,0],[1,1,1],false);add(new T.CylinderGeometry(.021,.021,.03,8),metal,piv,[s*.045,-.28,-.015],[0,0,0],[1,1,1],false);}
  ring(.02,.006,metal,headPivot,[.16,.17,-.01],[0,Math.PI/2,0]);
 }
 if(hero.id==='leo'){
  sleeves(cloth,null,{upLen:.2});pants(palette.pants,1.3,-.26);
  shell([[.265,-.12],[.285,.05],[.3,.2],[.28,.32],[.19,.41],[.12,.45]],cloth,spine,[0,0,0],.74,Math.PI+.24,TAU-.48);
  for(const s of [-1,1])add(new T.BoxGeometry(.03,.52,.03),trim,spine,[s*.075,.12,-.215],[0,0,s*.04]);
  // hood bunched behind the neck
  add(new T.TorusGeometry(.15,.07,10,24,Math.PI*1.25),cloth,spine,[0,.43,.04],[Math.PI/2-.3,0,Math.PI*-.125],[1,1,1]);
  add(new T.TorusGeometry(.13,.035,8,20,Math.PI*1.25),trim,spine,[0,.45,.02],[Math.PI/2-.3,0,Math.PI*-.125]);
  for(let i=0;i<2;i++){ring(.098,.022,trim,arms[i],[0,-.2,0]);ball(.1,M(0xececf2),arms[i],[0,-.01,0],[1.05,.8,1.05]);ring(.06,.018,trim,elbows[i],[0,-.3,0]);ring(.058,.012,trim,elbows[i],[0,-.25,0]);}
  shins(M(0x1d1d24),-.22,-.4);for(let i=0;i<2;i++){for(let k=0;k<3;k++)ring(.075,.012,trim,knees[i],[0,-.24-k*.05,0]);}
  boots(palette.boot,-.36);for(let i=0;i<2;i++){ring(.08,.015,trim,knees[i],[0,-.4,0]);}
  // belt, pouches, hip wrap with fringe, bolt pendant
  ring(.225,.02,dark,rig,[0,1.1,0],[Math.PI/2,0,0],[1,.8,1]);
  add(new T.BoxGeometry(.08,.09,.05),trim,rig,[-.2,1.04,-.08],[0,.5,0]);add(new T.BoxGeometry(.07,.11,.05),dark,rig,[.17,.86,-.08],[0,-.4,0]);
  const wrapFlap=new T.Group();wrapFlap.position.set(0,1.06,0);rig.add(wrapFlap);flaps.push(wrapFlap);
  add(lathe([[.31,-.42],[.27,-.2],[.235,0]],22,-.4,2.6),M(0xffffff,TEX.wrap(),{side:T.DoubleSide}),wrapFlap,[0,0,0],[0,0,0],[1,1,.85]);
  const dummy=new T.Group();dummy.position.set(0,1.06,0);rig.add(dummy);flaps.push(dummy);
  add(new T.TorusGeometry(.09,.004,4,20,Math.PI),M(0xffcc1f),spine,[0,.34,-.17],[.25,0,Math.PI],[1,1.4,1],false);
  const pend=new T.Shape();pend.moveTo(.006,.04);pend.lineTo(-.018,.004);pend.lineTo(-.002,.004);pend.lineTo(-.01,-.04);pend.lineTo(.018,-.006);pend.lineTo(.002,-.006);add(new T.ExtrudeGeometry(pend,{depth:.008,bevelEnabled:false}),trim,spine,[0,.2,-.22],[0,0,0],[1.4,1.4,1]);
  // hair: tall locs gathered on top with yellow bands
  ball(.168,hairMat,headPivot,[0,.245,.035],[.8,.72,.98]);ball(.05,hairMat,headPivot,[0,.38,.02]);ring(.05,.016,trim,headPivot,[0,.37,.02],[Math.PI/2,0,0]);
  for(let i=0;i<13;i++){const a=i/13*TAU,piv=new T.Group();piv.position.set(0,.4,.02);headPivot.add(piv);locs.push(piv);const up=.08+(i%4)*.03;
   add(strand([[0,0,0],[Math.cos(a)*.03,up,Math.sin(a)*.03],[Math.cos(a)*.1,up+.02,Math.sin(a)*.1],[Math.cos(a)*.16,up-.07,Math.sin(a)*.16]],.022,.016,1,8,6),hairMat,piv);
   if(i%2===0)add(new T.CylinderGeometry(.021,.021,.03,8),trim,piv,[Math.cos(a)*.085,up+.02,Math.sin(a)*.085],[0,0,Math.PI/2],[1,1,1],false);}
  for(let i=0;i<3;i++){const piv=new T.Group();piv.position.set(-.06+i*.06,.33,-.13);headPivot.add(piv);locs.push(piv);add(strand([[0,0,0],[0,.02,-.04],[.02,-.06,-.07],[.03,-.13,-.06]],.016,.012,1,8,6),hairMat,piv);}
  for(const s of [-1,1])ring(.018,.005,trim,headPivot,[s*.16,.17,-.01],[0,Math.PI/2,0]);
 }
 if(hero.id==='anselm'){
  sleeves(cloth,M(0xffffff,TEX.sleeve(),{side:T.DoubleSide}),{wide:true,upLen:.38});pants(palette.pants,1.35,-.26);shins(M(0xffffff,TEX.wrapsPurple()),-.18,-.43);boots(palette.boot,-.42);
  shell([[.26,-.37],[.27,-.1],[.29,.12],[.275,.3],[.19,.4],[.11,.44]],cloth,spine,[0,0,0],.74);
  // crossed kimono lapels
  for(const s of [-1,1])add(new T.BoxGeometry(.055,.66,.02),trim,spine,[s*.06,.06,-.21],[0,0,-s*.24]);
  ring(.27,.02,M(0x3a2c55),spine,[0,.25,0],[Math.PI/2,0,0],[.8,.66,1]);
  // bead necklace and spirit charm
  const beadMat=M(0xc9a8ff,null,{emissive:0x4a2a80});for(let i=0;i<12;i++){const a=Math.PI*.12+i/11*Math.PI*.76;ball(.026,beadMat,spine,[Math.cos(a)*.21,.36-Math.sin(a)*.14,-Math.sin(a)*.18],[1,1,1],true,10);}
  add(shapePanel([[0,0],[.06,.05],[.04,.12],[0,.09],[-.04,.12],[-.06,.05]]),M(0xd7c2ff,null,{emissive:0x6a3ab0,side:T.DoubleSide}),spine,[-.12,.1,-.225],[0,0,0],[.9,.9,1]);
  // long split robe skirts
  for(const s of [-1,1]){const flap=new T.Group();flap.position.set(0,1.06,0);rig.add(flap);flaps.push(flap);
   const phiS=s>0?-.25:TAU+.25-2.4;add(lathe([[.42,-.95],[.34,-.55],[.27,-.15],[.24,0]],20,phiS,2.4),cloth,flap,[0,0,0],[0,0,0],[1,1,.85]);
   add(lathe([[.38,-.85],[.3,-.45],[.25,-.1],[.23,0]],16,Math.PI+(s>0?.12:-.62),.5),cloth,flap,[0,0,0],[0,0,0],[1,1,.85]);}
  ring(.235,.035,M(0xffffff,TEX.rope('#c8b2ef','#8a6cc0')),rig,[0,1.08,0],[Math.PI/2,0,0],[1,.8,1]);
  ring(.045,.012,M(0xb48a5a),sash,[-.03,-.01,-.02],[0,0,0]);
  for(const s of [-1,1]){add(strand([[s*.04,.06,0],[s*.05,-.1,-.02],[s*.04,-.26,-.02]],.016,.01),trim,sash);add(new T.ConeGeometry(.026,.09,10),trim,sash,[s*.04,-.3,-.02]);}
  const tagMat=M(0xffffff,TEX.tag(),{side:T.DoubleSide});for(const [x,z,r] of [[.2,-.1,.4],[-.22,-.06,-.5],[.24,.1,1.4]])add(new T.PlaneGeometry(.06,.12),tagMat,rig,[x,.92,z],[0,r,0],[1,1,1]);
  add(new T.BoxGeometry(.1,.14,.05),dark,legs[1],[.1,-.22,-.05],[0,-.3,0]);
  // hair: long wavy mane, high ponytail with gold band, bangs over the right eye
  ball(.172,hairMat,headPivot,[0,.235,.02],[1,.82,1.02]);
  add(new T.CylinderGeometry(.04,.045,.05,14),M(0xb89048),headPivot,[0,.4,.06]);
  for(let i=0;i<9;i++){const a=(i/9-.5)*2.4,piv=new T.Group();piv.position.set(0,.42,.07);headPivot.add(piv);locs.push(piv);
   add(strand([[0,0,0],[Math.sin(a)*.08,.08,.04],[Math.sin(a)*.14,-.02,.14],[Math.sin(a)*.16+.03,-.3,.18],[Math.sin(a)*.12-.02,-.6,.16],[Math.sin(a)*.1+.03,-.85,.12]],.045,.012,.5,22,8),hairMat,piv);}
  for(let i=0;i<9;i++){const a=(i/8-.5)*2.6,piv=new T.Group();piv.position.set(Math.sin(a)*.14,.22,Math.cos(a)*.1+.04);headPivot.add(piv);locs.push(piv);
   add(strand([[0,0,0],[Math.sin(a)*.06,-.1,.03],[Math.sin(a)*.05,-.3,.06],[Math.sin(a)*.08+.02,-.5,.05]],.05,.012,.5,16,8),hairMat,piv);}
  { const piv=new T.Group();piv.position.set(0,.34,-.1);headPivot.add(piv);locs.push(piv);
   add(strand([[-.05,0,0],[.02,.0,-.08],[.07,-.08,-.17],[.08,-.17,-.18],[.1,-.26,-.15]],.06,.015,.45,14,8),hairMat,piv);
   add(strand([[.02,0,0],[-.04,-.02,-.08],[-.09,-.1,-.15],[-.1,-.2,-.13]],.04,.012,.5,12,8),hairMat,piv);}
  for(const s of [-1,1]){add(new T.PlaneGeometry(.035,.07),tagMat,headPivot,[s*.17,.1,-.01],[0,s*Math.PI/2,0]);}
  const ribbons=new T.Group();ribbons.position.set(0,.4,.1);headPivot.add(ribbons);locs.push(ribbons);for(const s of [-1,1]){add(strand([[0,0,0],[s*.04,-.1,.03],[s*.03,-.25,.05]],.012,.008),trim,ribbons);ball(.022,beadMat,ribbons,[s*.03,-.26,.05],[1,1,1],true,10);}
 }
 if(hero.id==='yana'){
  sleeves(null,M(0xffffff,TEX.guard()),{foreLen:.3});pants(palette.pants,1.3,-.27);shins(M(0xffffff,TEX.wraps()),-.18,-.36);boots(palette.boot,-.34);
  for(let i=0;i<2;i++){ring(.08,.014,metal,arms[i],[0,-.12,0]);ring(.074,.012,metal,elbows[i],[0,-.04,0]);ring(.06,.012,metal,elbows[i],[0,-.31,0]);ring(.078,.012,metal,knees[i],[0,-.34,0]);}
  shell([[.11,.38],[.12,.47],[.12,.52]],cloth,spine,[0,0,0],.85); // mandarin collar
  ring(.12,.01,metal,spine,[0,.52,0],[Math.PI/2,0,0],[1,.85,1]);
  add(new T.CylinderGeometry(.205,.2,.16,24,1,true),trim,rig,[0,1.12,0],[0,0,0],[1,1,.82]); // blue obi
  ring(.215,.022,M(0xffffff,TEX.rope('#e2b84e','#a8842c')),rig,[0,1.1,0],[Math.PI/2,0,0],[1,.82,1]);
  ring(.05,.016,M(0xffffff,TEX.rope('#e2b84e','#a8842c')),sash,[.08,.07,-.02],[0,0,0]);
  const teal=M(0x1b8f86);for(const x of [.06,.11]){add(strand([[x,.06,-.01],[x+.01,-.1,-.02],[x,-.24,-.02]],.014,.01),teal,sash);add(new T.ConeGeometry(.024,.1,10),teal,sash,[x,-.28,-.02]);}
  const front=add(shapePanel([[0,0],[1,0],[1,-.85],[.5,-1],[0,-.85]]),M(0xffffff,TEX.tabardWhite(),{side:T.DoubleSide}),sash,[-.13,.02,0],[0,0,0],[.26,.66,1]);
  for(const s of [-1,1]){const flap=new T.Group();flap.position.set(0,1.06,0);rig.add(flap);flaps.push(flap);
   const phiS=s>0?-.2:TAU+.2-2.1;add(lathe([[.36,-.72],[.3,-.4],[.24,-.1],[.21,0]],18,phiS,2.1),M(0xffffff,TEX.tabardWhite(),{side:T.DoubleSide}),flap,[0,0,0],[0,0,0],[1,1,.85]);
   add(lathe([[.34,-.6],[.28,-.3],[.22,0]],14,s>0?.9:TAU-.9-1.2,1.2),D(0x1f3fa8),flap,[0,0,0],[0,0,0],[1.04,1,.88]);}
  // asymmetric sea-dragon cape over the left shoulder
  capePivot=new T.Group();capePivot.position.set(.1,.32,.13);spine.add(capePivot);
  capeGeometry=new T.PlaneGeometry(.62,1.25,4,8);capeBase=new Float32Array(capeGeometry.attributes.position.array);
  cape=add(capeGeometry,M(0xffffff,TEX.cape(),{side:T.DoubleSide}),capePivot,[0,-.6,.06],[0,0,-.06],[1,1,1],false);
  add(new T.SphereGeometry(.13,16,10,0,TAU,0,Math.PI*.5),M(0x1b8f86,null,{side:T.DoubleSide}),arms[1],[0,.02,0],[0,0,-.2],[1.05,.8,1.05]);
  ball(.03,metal,spine,[.12,.3,-.2],[1,1,.6]);
  // hair: long wavy mane, braided crown, golden horns and tiara
  ball(.172,hairMat,headPivot,[0,.24,.025],[1,.82,1.02]);
  ring(.15,.022,hairMat,headPivot,[0,.3,.03],[Math.PI/2+.25,0,0],[1,1.05,1]);
  for(let i=0;i<12;i++){const a=(i/11-.5)*3.0,piv=new T.Group();piv.position.set(Math.sin(a)*.12,.28,Math.cos(a)*.08+.06);headPivot.add(piv);locs.push(piv);const L=.8+(i%3)*.1;
   const pts=[];for(let k=0;k<7;k++){const t=k/6;pts.push([Math.sin(a)*(.04+t*.12)+Math.sin(t*9+i)*.03,-t*L,.04+t*.1+Math.cos(t*8+i)*.02]);}
   add(strand(pts,.05,.014,.5,24,8),hairMat,piv);}
  for(const s of [-1,1]){const piv=new T.Group();piv.position.set(s*.11,.3,-.11);headPivot.add(piv);locs.push(piv);add(strand([[0,0,0],[s*.03,-.1,-.02],[s*.05,-.25,0],[s*.03,-.4,.01]],.028,.01,.6,14,8),hairMat,piv);}
  const gold=metal;for(const s of [-1,1]){add(strand([[s*.07,.34,.0],[s*.1,.42,.02],[s*.12,.5,.05],[s*.09,.56,.09]],.022,.006,1,12,8),gold,headPivot);add(strand([[s*.1,.42,.02],[s*.15,.45,.03],[s*.17,.49,.05]],.012,.004,1,8,6),gold,headPivot);}
  add(new T.TorusGeometry(.13,.01,6,24,Math.PI),gold,headPivot,[0,.33,-.04],[-.3,0,0]);add(new T.OctahedronGeometry(.02),M(0x1fd0c0),headPivot,[0,.37,-.15],[0,0,0],[1,1.3,.5]);
  for(const s of [-1,1]){ring(.03,.006,gold,headPivot,[s*.165,.13,-.01],[0,Math.PI/2,0]);add(new T.ConeGeometry(.015,.08,8),teal,headPivot,[s*.15,.24,-.08]);}
 }
 if(flaps.length<2){while(flaps.length<2){const f=new T.Group();rig.add(f);flaps.push(f);}}
 const shadow=new T.Mesh(new T.CircleGeometry(.5,24),new T.MeshBasicMaterial({color:0x1b2a2a,transparent:true,opacity:.25,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.012;root.add(shadow);
 const marker=new T.Mesh(new T.RingGeometry(.6,.64,36),new T.MeshBasicMaterial({color:enemy?0xf7a760:0x71e2df,transparent:true,opacity:.5,side:T.DoubleSide,depthWrite:false}));marker.rotation.x=-Math.PI/2;marker.position.y=.025;root.add(marker);
 return {hero,heroIndex:A.HEROES.indexOf(hero),root,rig,spine,headPivot,torso,head,cloth,bodymat:skin,arms,elbows,hands,legs,knees,feet,flaps,sash,locs,shadow,marker,cape,capePivot,capeGeometry,capeBase,collisionHeight:2.34,enemy,
  hp:enemy?140:100,stamina:100,energy:100,vy:0,jumps:0,ground:true,angle:0,attack:null,recovery:0,invuln:0,block:false,blockAge:0,combo:0,chain:0,cool:[0,0,0,0],flash:0,wall:0,dash:0,dashDir:new T.Vector3(),moveSpeed:0,guardBroken:0,hurt:0,castPose:null,land:0,evade:0};
};
A.disposeHero=function(f){if(!f||!f.root)return;if(f.root.parent)f.root.parent.remove(f.root);f.root.traverse(o=>{if(o.geometry&&o.material!==inkMat)o.geometry.dispose();if(o.material&&o.material!==inkMat&&!Array.isArray(o.material))o.material.dispose();});};
})(window);
