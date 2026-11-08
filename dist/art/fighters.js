/* KARUKERA original island martial artists — sculpted geometry, joint hierarchy and layered poses. */
(function(global){
'use strict';
const T=global.THREE,A=global.KarukeraArt=global.KarukeraArt||{};
const TAU=Math.PI*2,lerp=T.MathUtils.lerp,clamp=T.MathUtils.clamp;
const lineMat=new T.MeshBasicMaterial({color:0x121626,side:T.BackSide});
function textile(){const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');g.fillStyle='#a74440';g.fillRect(0,0,128,128);for(let i=0;i<8;i++){g.fillStyle=i%2?'#e8bb67':'#1d626d';g.fillRect(i*16,0,i%2?7:4,128);g.globalAlpha=.7;g.fillStyle=i%2?'#fff1b1':'#244c5d';g.fillRect(0,i*16,128,i%2?5:8);g.globalAlpha=1;}const tex=new T.CanvasTexture(c);tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.colorSpace=T.SRGBColorSpace;return tex;}
let madras;
function patch(points){const positions=[],indices=[];for(const p of points)positions.push(...p);for(let i=1;i<points.length-1;i++)indices.push(0,i,i+1);const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();return g;}
function headShape(){const levels=[[.015,.055,.075],[.07,.12,.115],[.16,.177,.141],[.27,.18,.143],[.36,.15,.125],[.405,.055,.07]],positions=[],indices=[],n=14;for(const [y,w,d]of levels)for(let i=0;i<n;i++){const a=i/n*TAU;positions.push(Math.sin(a)*w,y,Math.cos(a)*d+(y<.12?-.018:0));}for(let row=0;row<levels.length-1;row++)for(let i=0;i<n;i++){const a=row*n+i,b=row*n+(i+1)%n,c=(row+1)*n+i,d=(row+1)*n+(i+1)%n;indices.push(a,b,c,b,d,c);}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();return g;}
A.makeFighter=function(scene,enemy,color,skin,gradient){
 if(!madras)madras=textile();
 const toon=c=>new T.MeshToonMaterial({color:c,gradientMap:gradient});
 const cloth=toon(color),skinMat=toon(skin),dark=toon(enemy?0x2f273b:0x1d3646),gold=toon(enemy?0xe6a962:0xe5bf77),hair=toon(enemy?0x302330:0x1c202b),white=toon(0xf2e8cc),linen=toon(enemy?0xa5bbb6:0xe6dfc6),fabric=new T.MeshToonMaterial({map:madras,gradientMap:gradient,side:T.DoubleSide});
 const root=new T.Group(),rig=new T.Group(),spine=new T.Group();root.add(rig);rig.add(spine);spine.position.y=1.39;scene.add(root);root.name=enemy?'Mako · keeper of the stone tide':'Élian · windward island guardian';
 function part(geo,material,parent,x=0,y=0,z=0,outline=true){const m=new T.Mesh(geo,material);m.position.set(x,y,z);m.castShadow=true;parent.add(m);if(outline){const l=new T.Mesh(geo,lineMat);l.scale.setScalar(1.04);m.add(l);}return m;}
 function ball(r,material,parent,x,y,z,sx=1,sy=1,sz=1,outline=true){const m=part(new T.SphereGeometry(r,14,10),material,parent,x,y,z,outline);m.scale.set(sx,sy,sz);return m;}
 function cube(w,h,d,material,parent,x,y,z){return part(new T.BoxGeometry(w,h,d),material,parent,x,y,z,false);}
 function taper(rt,rb,h,material,parent,x,y,z,outline=true){return part(new T.CylinderGeometry(rt,rb,h,12),material,parent,x,y,z,outline);}
 function plane(points,material,parent,x=0,y=0,z=0){material.side=T.DoubleSide;return part(patch(points),material,parent,x,y,z,false);}
 // Narrow waist and tapered chest read as an athletic adult rather than a block toy.
 const profile=[new T.Vector2(.205,-.32),new T.Vector2(.23,-.20),new T.Vector2(.29,.05),new T.Vector2(.355,.24),new T.Vector2(.30,.38),new T.Vector2(.22,.43)];
 const torso=part(new T.LatheGeometry(profile,18),cloth,spine);torso.scale.z=.67;
 taper(.165,.21,.25,dark,spine,0,.38,0).scale.z=.77;
 // Folded asymmetric vest front, linen inner lapel and subtle seamwork.
 for(const s of [-1,1]){
  const panel=plane([[0,.37,-.161],[s*.24,.31,-.198],[s*.19,-.27,-.158],[s*.025,-.29,-.169]],s===1?linen:dark,spine);panel.material.side=T.DoubleSide;
  const lapel=plane([[s*.04,.35,-.178],[s*.20,.33,-.21],[s*.085,.12,-.218]],linen,spine);lapel.material.side=T.DoubleSide;
 }
 cube(.025,.57,.015,gold,spine,.115,.04,-.219);
 const badge=part(new T.TorusGeometry(.052,.014,5,12),gold,spine,-.16,.19,-.229,false);badge.rotation.z=.4;
 taper(.242,.247,.135,fabric,rig,0,1.06,0).scale.z=.81;
 const buckle=cube(.11,.105,.045,gold,rig,.11,1.07,-.217);buckle.rotation.z=.17;
 const flaps=[];
 for(const s of [-1,1]){const flap=new T.Group();flap.position.set(s*.215,1.055,.015);rig.add(flap);const panel=plane([[-.13,0,-.075],[.13,0,-.075],[.19,-.65,.02],[-.17,-.61,.02]],cloth,flap);panel.material.side=T.DoubleSide;plane([[s*.09,-.04,-.084],[s*.135,-.04,-.084],[s*.17,-.61,.012],[s*.12,-.61,.012]],fabric,flap);flaps.push(flap);}
 const sash=new T.Group();sash.position.set(-.255,1.07,-.06);rig.add(sash);plane([[-.085,0,0],[.085,0,0],[.135,-.73,.055],[-.045,-.79,.055]],fabric,sash);
 // Original face geometry, pointed jaw, almond eyes and angular brows.
 const headPivot=new T.Group();headPivot.position.set(0,.54,0);spine.add(headPivot);
 taper(.083,.091,.17,skinMat,headPivot,0,-.028,0,false);
 const head=part(headShape(),skinMat,headPivot,0,.005,0);
 for(const s of [-1,1]){
  ball(.049,skinMat,headPivot,s*.183,.19,.005,.65,1,.65,false);
  plane([[s*.035,.229,-.139],[s*.148,.244,-.112],[s*.14,.205,-.127],[s*.045,.199,-.151]],dark,headPivot);
  plane([[s*.045,.224,-.145],[s*.137,.235,-.12],[s*.13,.209,-.134],[s*.052,.204,-.155]],white,headPivot);
  ball(.026,dark,headPivot,s*.089,.219,-.151,.68,1,.36,false);
  ball(.008,white,headPivot,s*.084,.228,-.163,.8,1,.4,false);
  plane([[s*.036,.271,-.13],[s*.149,.282,-.106],[s*.146,.26,-.121],[s*.045,.252,-.145]],hair,headPivot);
 }
 plane([[-.023,.20,-.151],[.021,.20,-.151],[.029,.134,-.154],[0,.125,-.197],[-.025,.135,-.153]],skinMat,headPivot);
 plane([[-.041,.095,-.13],[.042,.102,-.13],[.03,.088,-.137],[-.025,.085,-.138]],dark,headPivot);
 const earring=part(new T.TorusGeometry(.038,.008,5,12),gold,headPivot,-.205,.13,-.005,false);earring.rotation.y=.12;
 const band=taper(.18,.185,.07,fabric,headPivot,0,.343,0,false);band.scale.z=.78;
 // Locs sweep back from an asymmetric crown. Curved tubes avoid the former upright capsule silhouette.
 const locs=[];
 ball(.185,hair,headPivot,0,.355,.015,1,.6,.9,true);
 for(let i=0;i<10;i++){
  const a=(i/10)*TAU,pivot=new T.Group();pivot.position.set(Math.sin(a)*.13,.357,Math.cos(a)*.10);headPivot.add(pivot);
  const length=enemy?.31:.52,side=Math.sin(a),back=Math.cos(a)*.11;
  const curve=new T.CatmullRomCurve3([new T.Vector3(0,0,0),new T.Vector3(side*.055,.10,.09),new T.Vector3(side*.10,.08,.23+back),new T.Vector3(side*.11,-length*.30,.28+back),new T.Vector3(side*.09,-length*.75,.29+back)]);
  const loc=part(new T.TubeGeometry(curve,7,.032+(i%3)*.006,6,false),hair,pivot,0,0,0,i%2===0);
  if(i===2||i===6){const bead=taper(.042,.042,.05,gold,pivot,side*.09,-length*.5,.29+back,false);bead.rotation.x=-.16;}
  locs.push(pivot);
 }
 // Three side-swept locks frame the face without obscuring the eyes.
 for(let i=0;i<3;i++){
  const curve=new T.CatmullRomCurve3([new T.Vector3(-.12+i*.075,.375,-.035),new T.Vector3(-.08+i*.05,.42,-.12),new T.Vector3(.02+i*.055,.335,-.17),new T.Vector3(.12+i*.025,.27-i*.018,-.13)]);
  part(new T.TubeGeometry(curve,6,.027,6,false),hair,headPivot,0,0,0,false);
 }
 plane([[0,0,0],[.15,.03,.015],[.25,-.32,.09],[.15,-.38,.09]],fabric,headPivot,.17,.342,.02);
 // A light half-cape catches the wind; a small grid deforms instead of rigidly spinning a box.
 const capePivot=new T.Group();capePivot.position.set(-.07,.23,.11);spine.add(capePivot);
 const capeGeometry=new T.PlaneGeometry(.78,1.02,4,6),capeBase=new Float32Array(capeGeometry.attributes.position.array);
 const capeMaterial=fabric.clone();capeMaterial.side=T.DoubleSide;capeMaterial.color.setHex(enemy?0xc9a0b8:0xffffff);
 const cape=part(capeGeometry,capeMaterial,capePivot,-.10,-.34,.11,false);
 cape.rotation.z=-.12;
 const capeTrimGeometry=new T.PlaneGeometry(.055,1.02,1,6),capeTrimBase=new Float32Array(capeTrimGeometry.attributes.position.array);
 const capeTrim=part(capeTrimGeometry,gold,cape,-.3625,0,.004,false);
 const arms=[],elbows=[],hands=[],legs=[],knees=[],feet=[];
 for(const s of [-1,1]){
  const shoulder=new T.Group();shoulder.position.set(s*.355,.25,0);spine.add(shoulder);
  ball(.145,cloth,shoulder,0,-.02,0,1,.85,1);
  taper(.106,.087,.37,skinMat,shoulder,0,-.235,0);
  const elbow=new T.Group();elbow.position.set(0,-.43,0);shoulder.add(elbow);ball(.087,skinMat,elbow,0,0,0,1,1,1,false);
  taper(.083,.065,.34,skinMat,elbow,0,-.18,0);
  taper(.09,.073,.235,s===1?dark:cloth,elbow,0,-.23,0);
  taper(.095,.095,.028,gold,elbow,0,-.115,0,false);taper(.081,.081,.026,gold,elbow,0,-.34,0,false);
  const hand=ball(.088,skinMat,elbow,0,-.43,-.016,.8,1.12,.7,true);
  cube(.118,.07,.10,dark,elbow,0,-.382,-.027);
  arms.push(shoulder);elbows.push(elbow);hands.push(hand);
  const hip=new T.Group();hip.position.set(s*.17,1.045,0);rig.add(hip);
  taper(.153,.108,.50,dark,hip,0,-.255,0);
  const knee=new T.Group();knee.position.set(0,-.52,0);hip.add(knee);ball(.105,dark,knee,0,0,0,1,1,1,false);
  taper(.103,.068,.37,dark,knee,0,-.20,0);
  const shin=plane([[-.08,-.04,-.099],[.08,-.04,-.099],[.06,-.30,-.082],[-.06,-.30,-.082]],cloth,knee);shin.material.side=T.DoubleSide;
  for(let i=0;i<2;i++)taper(.083-i*.003,.084-i*.003,.026,white,knee,0,-.30-i*.045,0,false);
  const foot=ball(.12,dark,knee,0,-.435,-.075,.85,.75,1.65,true);
  ball(.12,gold,knee,0,-.498,-.075,.88,.15,1.7,false);
  legs.push(hip);knees.push(knee);feet.push(foot);
 }
 ball(.165,enemy?gold:dark,arms[enemy?1:0],0,-.035,.025,1.08,.5,1.2);
 const necklace=part(new T.TorusGeometry(.115,.009,5,16,Math.PI*1.45),gold,spine,0,.28,-.207,false);necklace.rotation.z=.2;
 const charm=part(new T.OctahedronGeometry(.033),gold,spine,-.014,.155,-.222,false);
 const pouch=ball(.12,dark,rig,.27,.97,.13,1,.95,.6,true);cube(.12,.035,.08,gold,rig,.27,1.07,.13);
 const shadow=new T.Mesh(new T.CircleGeometry(.48,24),new T.MeshBasicMaterial({color:0x193936,transparent:true,opacity:.23,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.012;root.add(shadow);
 const marker=new T.Mesh(new T.RingGeometry(.59,.63,36),new T.MeshBasicMaterial({color:enemy?0xf7a760:0x71e2df,transparent:true,opacity:.5,side:T.DoubleSide,depthWrite:false}));marker.rotation.x=-Math.PI/2;marker.position.y=.025;root.add(marker);
 return {root,rig,spine,headPivot,torso,cloth,bodymat:skinMat,arms,elbows,hands,legs,knees,feet,flaps,sash,locs,shadow,marker,cape,capePivot,capeGeometry,capeBase,capeTrim,capeTrimGeometry,capeTrimBase,collisionHeight:2.34,enemy,hp:enemy?140:100,stamina:100,energy:100,vy:0,jumps:0,ground:true,angle:0,attack:null,recovery:0,invuln:0,block:false,blockAge:0,combo:0,chain:0,cool:[0,0,0,0],flash:0,wall:0,dash:0,dashDir:new T.Vector3(),moveSpeed:0,guardBroken:0,hurt:0,castPose:null,land:0,evade:0};
};
const ease=x=>{x=clamp(x,0,1);return x*x*(3-2*x);};
A.animate=function(f,time,dt){
 const blend=1-Math.exp(-dt*24),speed=f.moveSpeed||0,stride=time*(speed>8?18:12),run=clamp(speed/10,0,1);
 const p={bodyX:.035,bodyY:Math.sin(time*1.5)*.018,bodyZ:0,rootY:Math.sin(time*2)*.008,rootX:0,rootZ:0,armX:[.19,.29],armY:[0,0],armZ:[.10,-.10],elbow:[.45,.72],legX:[.06,-.07],legZ:[.035,-.035],knee:[-.13,-.15],headX:0};
 if(f.hp<=0){f.rig.rotation.z=lerp(f.rig.rotation.z,1.5,blend*.5);f.rig.position.y=lerp(f.rig.position.y,-.5,blend*.5);return;}
 if(speed>.15&&f.ground){p.bodyX=-.18*run;p.headX=.10*run;p.bodyY=Math.sin(stride)*.08*run;p.rootY=Math.abs(Math.sin(stride))*.065*run;for(let i=0;i<2;i++){const swing=Math.sin(stride+i*Math.PI);p.armX[i]=-.13+swing*.7*run;p.elbow[i]=.82;p.legX[i]=-swing*.85*run;p.knee[i]=-Math.max(0,swing)*1.25*run-.10;}}
 if(speed>9&&f.ground){p.bodyX=-.34;p.headX=.18;p.armX=[-.55,-.65];p.elbow=[.28,.24];p.armZ=[.12,-.14];}
 if(!f.ground){p.bodyX=-.10;p.armX=[-.12,.48];p.armZ=[.32,-.34];p.elbow=[.70,.94];p.legX=[.75,-.4];p.knee=[-1.15,-.62];p.rootY=.02;}
 if(f.block){p.bodyX=.13;p.bodyY=.15;p.armX=[1.0,1.13];p.armZ=[-.12,.12];p.elbow=[1.38,1.25];p.legX=[.22,-.30];p.knee=[-.49,-.25];p.rootY=-.12;}
 if(f.attack){const a=f.attack,age=a.age,wind=a.heavy?.24:.085,strike=a.heavy?.13:.075;const fire=ease((age-wind)/strike),release=ease((age-wind-strike)/(a.heavy?.34:.19));const power=fire*(1-release),prep=ease(age/wind)*(1-fire);p.rootY=-prep*.12;p.bodyY=-prep*.55+power*.9;p.bodyX=prep*.12-power*.22;
  if(a.heavy){p.bodyY=-prep*.90+power*1.8;p.armX=[.38,prep*-.8+power*2.9];p.elbow=[1.1,.85-power*.68];p.legX=[.38,-.28];p.knee=[-.72,-.38];p.rootY=-prep*.28+power*.16;p.headX=power*.1;}
  else if(a.kick){p.bodyY=-prep*.80+fire*2.7*(1-release*.35);p.bodyX=-power*.18;p.armX=[.1,.3];p.armZ=[.85,-.90];p.elbow=[.65,.70];p.legX=[.25,prep*-.55+power*1.85];p.legZ=[.0,-power*.47];p.knee=[-.30,-prep*1.5-power*.04];p.rootY=power*.18;}
  else {let i=a.side||0;p.armX[i]=prep*-.55+power*1.72;p.armY[i]=(i?1:-1)*power*.27;p.elbow[i]=1.0*(1-power)+.06;p.armX[1-i]=.77;p.elbow[1-i]=1.1;p.bodyY*=(i?-1:1);p.legX=[.23,-.23];p.knee=[-.38,-.22];p.rootZ=-power*.04;}
  if(a.air){p.rootY+=.04;p.legX[1]=a.kick?p.legX[1]:-.6;p.knee[1]=a.kick?p.knee[1]:-1.1;p.armZ[0]+=.10;p.armZ[1]-=.10;}
 }
 if(f.castPose){const c=f.castPose,t=clamp(c.age/c.duration,0,1),energy=Math.sin(t*Math.PI);if(c.slot===0){p.armX=[1.2,1.36];p.elbow=[.85*(1-t),.95*(1-t)];p.bodyY=-.23;p.bodyX=.13-energy*.28;p.legX=[.32,-.25];p.knee=[-.44,-.28];}if(c.slot===1){p.armZ=[.95,-.95];p.armX=[.72,.72];p.elbow=[.30,.30];p.bodyX=.15;p.headX=-.15;}if(c.slot===2){p.bodyX=-.87*energy;p.rootY=-.48*energy;p.armX=[.42,1.40];p.elbow=[.85,.20];p.legX=[.72,.24];p.knee=[-1.20,-.65];}if(c.slot===3){p.bodyX=-.53;p.headX=.2;p.armX=[-.82,-.74];p.elbow=[.24,.35];}}
 if(f.dash>0){p.bodyX=-.58;p.headX=.2;p.armX=[-.82,-.86];p.elbow=[.25,.30];p.legX=[.92,-.65];p.knee=[-.85,-.45];}
 if(f.chase>0||f.chasing){p.rootX=-.72+clamp(f.dashDir?.y||0,-.7,.7)*.25;p.rootY=.20;p.rootZ=.28;p.bodyX=-.27;p.armX=[-.85,-.90];p.armZ=[.08,-.08];p.elbow=[.26,.22];p.legX=[.25,-.65];p.knee=[-.3,-.8];p.headX=.35;}
 if(f.substitute>0){const t=clamp(f.substitute/.4,0,1);p.bodyY=t*2.2;p.bodyX=.3;p.armX=[.8,1.2];p.armZ=[.6,-.6];p.elbow=[.75,.25];p.legX=[.6,-.6];p.knee=[-.9,-.3];p.rootY=-.08;}
 if(f.ultimatePose){const u=f.ultimatePose,t=clamp(u.age/(u.duration||2.4),0,1),charge=ease(t/.30),release=ease((t-.62)/.12);p.bodyX=.14*charge-.6*release;p.bodyY=-.25+release*.65;p.armX=[.85+charge*.65+release*.3,.9+charge*.65+release*.3];p.elbow=[1.45*(1-release)+.08,1.4*(1-release)+.08];p.armZ=[.06,-.06];p.legX=[.32,-.32];p.knee=[-.7,-.45];p.rootY=-.24*charge+.20*release;p.headX=-.12*(1-release)+.20*release;}
 if(f.wall){p.bodyZ=(f.wallSide||1)*-.70;p.bodyX=-.29;p.headX=.15;p.armZ=[.75,-.75];p.legX=[Math.sin(stride)*.8,-Math.sin(stride)*.8];p.knee=[-.8,-.8];}
 if(f.hurt>0){const h=clamp(f.hurt/.22,0,1);p.bodyX-=h*.5;p.armX=[.35,.1];p.elbow=[.5,.8];}
 if(f.land>0)p.rootY-=Math.sin(clamp(f.land/.22,0,1)*Math.PI)*.22;
 function rx(b,x,y=0,z=0){b.rotation.x=lerp(b.rotation.x,x,blend);b.rotation.y=lerp(b.rotation.y,y,blend);b.rotation.z=lerp(b.rotation.z,z,blend);}
 rx(f.spine,p.bodyX,p.bodyY,p.bodyZ);rx(f.headPivot,p.headX,-p.bodyY*.42,0);
 f.rig.position.y=lerp(f.rig.position.y,p.rootY,blend);f.rig.position.z=lerp(f.rig.position.z,p.rootZ,blend);f.rig.rotation.x=lerp(f.rig.rotation.x,p.rootX,blend);f.rig.rotation.z=lerp(f.rig.rotation.z,0,blend);
 for(let i=0;i<2;i++){rx(f.arms[i],p.armX[i],p.armY[i],p.armZ[i]);rx(f.elbows[i],p.elbow[i]);rx(f.legs[i],p.legX[i],0,p.legZ[i]);rx(f.knees[i],p.knee[i]);f.flaps[i].rotation.x=Math.sin(time*9+i)*run*.22+Math.max(0,-p.legX[i])*.35;}
 const wind=(f.dash>0||f.chase>0)?1.6:run;
 f.sash.rotation.x=Math.sin(time*8)*(.05+wind*.25);f.sash.rotation.z=Math.sin(time*6)*.08;
 f.locs.forEach((l,i)=>{l.rotation.z=Math.sin(time*8+i)*(.025+wind*.045);l.rotation.x=-wind*.17+Math.sin(time*6+i)*.025;});
 if(f.capeGeometry){const a=f.capeGeometry.attributes.position.array,b=f.capeBase;for(let i=0;i<a.length;i+=3){const v=clamp(.5-b[i+1],0,1);a[i]=b[i]+Math.sin(time*7+v*4)*v*(.025+wind*.08);a[i+1]=b[i+1]+Math.sin(time*8+v*3)*v*.025;a[i+2]=b[i+2]+v*v*(.10+wind*.58)+Math.sin(time*9+b[i]*5+v*4)*v*(.025+wind*.08);}f.capeGeometry.attributes.position.needsUpdate=true;f.capeGeometry.computeVertexNormals();if(f.capeTrimGeometry){const t=f.capeTrimGeometry.attributes.position.array,c=f.capeTrimBase;for(let i=0;i<t.length;i+=3){const v=clamp(.5-c[i+1],0,1),x=c[i]-.3625;t[i]=c[i]+Math.sin(time*7+v*4)*v*(.025+wind*.08);t[i+1]=c[i+1]+Math.sin(time*8+v*3)*v*.025;t[i+2]=c[i+2]+v*v*(.10+wind*.58)+Math.sin(time*9+x*5+v*4)*v*(.025+wind*.08);}f.capeTrimGeometry.attributes.position.needsUpdate=true;f.capeTrimGeometry.computeVertexNormals();}f.capePivot.rotation.y=Math.sin(time*4)*(.025+wind*.06);}
 f.marker.material.color.setHex(f.enemy?(f.attack?0xffe2a1:0xf7a760):0x71e2df);f.marker.material.opacity=f.attack?.85:.45;f.marker.scale.setScalar(f.attack?1+Math.sin(f.attack.age*22)*.10:1);
 f.shadow.scale.setScalar(1+Math.max(0,f.root.position.y)*.06);f.shadow.material.opacity=f.ground?.23:.08;
};
})(window);
