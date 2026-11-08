/* Shared exact collision queries for gameplay and third-person camera. */
(function(global){
'use strict';const T=global.THREE;
function entry(a,b,s,pad={x:0,y:0,z:0}){
 let near=0,far=1;for(const [axis,size] of [['x','w'],['y','h'],['z','d']]){
  const d=b[axis]-a[axis],lo=s[axis]-s[size]/2-(pad[axis]||0),hi=s[axis]+s[size]/2+(pad[axis]||0);
  if(Math.abs(d)<1e-8){if(a[axis]<lo||a[axis]>hi)return null;}
  else{let t0=(lo-a[axis])/d,t1=(hi-a[axis])/d;if(t0>t1)[t0,t1]=[t1,t0];near=Math.max(near,t0);far=Math.min(far,t1);if(near>far)return null;}
 }return far>=0&&near<=1?Math.max(0,near):null;
}
function firstHit(a,b,solids,pad){let nearest=1,hit=false;for(const s of solids){if(s.disabled)continue;const t=entry(a,b,s,pad);if(t!==null&&t<=nearest){nearest=t;hit=true;}}return hit?nearest:null;}
function wallNormal(p,s){const faces=[{d:Math.abs(p.x-(s.x-s.w/2)),n:new T.Vector3(-1,0,0)},{d:Math.abs(p.x-(s.x+s.w/2)),n:new T.Vector3(1,0,0)},{d:Math.abs(p.z-(s.z-s.d/2)),n:new T.Vector3(0,0,-1)},{d:Math.abs(p.z-(s.z+s.d/2)),n:new T.Vector3(0,0,1)}];faces.sort((a,b)=>a.d-b.d);return faces[0].n;}
function move3D(f,delta,solids){
 const p=f.root.position,h=f.collisionHeight||2.3,r=.38,old=p.clone();
 // Slab sweep of a capsule's conservative box. A floor exactly underfoot is excluded.
 const center=p.clone().add(new T.Vector3(0,h/2+.015,0)),end=center.clone().add(delta);
 let t=1;for(const s of solids){if(s.disabled)continue;const v=entry(center,end,s,{x:r,y:h/2-.025,z:r});if(v!==null)t=Math.min(t,Math.max(0,v-.015));}
 p.addScaledVector(delta,t);p.x=T.MathUtils.clamp(p.x,-53,53);p.z=T.MathUtils.clamp(p.z,-68,68);
 return {distance:p.distanceTo(old),blocked:t<.99};
}
global.KarukeraMotion={entry,firstHit,wallNormal,move3D};
})(window);
