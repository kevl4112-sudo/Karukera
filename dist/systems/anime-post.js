/* KARUKERA anime finish: depth-based ink outlines, soft glow bloom, vivid grade and impact flash.
   Falls back to a plain render when render targets or depth textures are unavailable. */
(function(global){
'use strict';
const T=global.THREE;
global.KarukeraPost=function(renderer,scene,camera){
 const api={enabled:false,supported:false,flash:0,boost:0,render(){renderer.render(scene,camera);},setSize(){},setEnabled(){},update(){}};
 if(!T||!renderer||typeof renderer.setRenderTarget!=='function'||!T.DepthTexture||!T.WebGLRenderTarget)return api;
 let targets;
 try{
  const gl2=!!(renderer.capabilities&&renderer.capabilities.isWebGL2);
  const hdr=gl2?T.HalfFloatType:T.UnsignedByteType;
  const depth=new T.DepthTexture(1,1);depth.type=T.UnsignedIntType;
  const sceneRT=new T.WebGLRenderTarget(1,1,{type:hdr,depthTexture:depth,samples:gl2?4:0,minFilter:T.LinearFilter,magFilter:T.LinearFilter});
  const small=()=>new T.WebGLRenderTarget(1,1,{type:hdr,minFilter:T.LinearFilter,magFilter:T.LinearFilter,depthBuffer:false});
  targets={sceneRT,bloomA:small(),bloomB:small(),hdr:gl2};
 }catch(e){return api;}
 const quadCamera=new T.OrthographicCamera(-1,1,1,-1,0,1),geometry=new T.BufferGeometry();
 geometry.setAttribute('position',new T.Float32BufferAttribute([-1,-1,0,3,-1,0,-1,3,0],3));geometry.setAttribute('uv',new T.Float32BufferAttribute([0,0,2,0,0,2],2));
 const quad=new T.Mesh(geometry),quadScene=new T.Scene();quad.frustumCulled=false;quadScene.add(quad);
 const vertexShader='varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}';
 const bright=new T.ShaderMaterial({uniforms:{tColor:{value:null},threshold:{value:targets.hdr?1.45:.9}},vertexShader,depthTest:false,depthWrite:false,
  fragmentShader:'uniform sampler2D tColor;uniform float threshold;varying vec2 vUv;void main(){vec3 c=texture2D(tColor,vUv).rgb;float l=max(c.r,max(c.g,c.b));float k=smoothstep(threshold*.72,threshold*1.25,l);gl_FragColor=vec4(c*k,1.);}'});
 const blur=new T.ShaderMaterial({uniforms:{tColor:{value:null},direction:{value:new T.Vector2()}},vertexShader,depthTest:false,depthWrite:false,
  fragmentShader:'uniform sampler2D tColor;uniform vec2 direction;varying vec2 vUv;void main(){vec3 s=texture2D(tColor,vUv).rgb*.227;s+=(texture2D(tColor,vUv+direction*1.384).rgb+texture2D(tColor,vUv-direction*1.384).rgb)*.316;s+=(texture2D(tColor,vUv+direction*3.23).rgb+texture2D(tColor,vUv-direction*3.23).rgb)*.07;gl_FragColor=vec4(s,1.);}'});
 // Ink lines come from the second derivative of reciprocal depth: flat planes vanish, silhouettes and ridges stay.
 const composite=new T.ShaderMaterial({uniforms:{tColor:{value:null},tDepth:{value:null},tBloom:{value:null},texel:{value:new T.Vector2()},near:{value:.1},far:{value:260},lineScale:{value:1},flash:{value:0},boost:{value:0},bloomStrength:{value:.85},ink:{value:new T.Color(0x14182a)}},vertexShader,depthTest:false,depthWrite:false,
  fragmentShader:[
  'uniform sampler2D tColor,tDepth,tBloom;uniform vec2 texel;uniform float near,far,lineScale,flash,boost,bloomStrength;uniform vec3 ink;varying vec2 vUv;',
  'float w(vec2 uv){float z=texture2D(tDepth,uv).x*2.-1.;float l=2.*near*far/(far+near-z*(far-near));return 1./l;}',
  'float shoulder(float x){return x<.8?x:.8+.2*(1.-exp(-(x-.8)/.2));}',
  'void main(){',
  ' vec3 col=texture2D(tColor,vUv).rgb;vec2 o=texel*lineScale;',
  ' float c=w(vUv),l=w(vUv-vec2(o.x,0.)),r=w(vUv+vec2(o.x,0.)),d=w(vUv-vec2(0.,o.y)),u=w(vUv+vec2(0.,o.y));',
  ' float sx=2.*c-l-r,sy=2.*c-d-u;',
  ' float e=(max(sx,0.)+max(sy,0.)+.3*(max(-sx,0.)+max(-sy,0.)))/max(c,1e-5);',
  ' float dist=1./max(c,1e-5);',
  ' float edge=smoothstep(.035,.11,e)*mix(1.,.3,smoothstep(55.,160.,dist));',
  ' if(dist>300.)edge=0.;',
  ' float luma=dot(col,vec3(.2126,.7152,.0722));col=mix(vec3(luma),col,1.12+boost*.25);',
  ' col=mix(col,col*col*(3.-2.*clamp(col,0.,1.)),.18);',
  ' col+=texture2D(tBloom,vUv).rgb*(bloomStrength+boost*.6);',
  ' col=mix(col,ink,clamp(edge,0.,1.)*.88);',
  ' col*=1.04;col=vec3(shoulder(col.r),shoulder(col.g),shoulder(col.b));',
  ' col=mix(col,vec3(1.,.97,.88),clamp(flash,0.,1.));',
  ' vec2 v=vUv-.5;col*=1.-.26*dot(v,v)*(1.+boost);',
  ' gl_FragColor=vec4(col,1.);',
  ' #include <colorspace_fragment>',
  '}'].join('\n')});
 let width=1,height=1,ratio=1;
 function pass(material,target){quad.material=material;renderer.setRenderTarget(target);renderer.render(quadScene,quadCamera);}
 api.supported=true;api.enabled=true;
 api.setEnabled=on=>{api.enabled=!!on&&api.supported;};
 api.setSize=(w,h,pr=1)=>{width=Math.max(1,Math.floor(w*pr));height=Math.max(1,Math.floor(h*pr));ratio=pr;targets.sceneRT.setSize(width,height);const bw=Math.max(1,width>>2),bh=Math.max(1,height>>2);targets.bloomA.setSize(bw,bh);targets.bloomB.setSize(bw,bh);composite.uniforms.texel.value.set(1/width,1/height);composite.uniforms.lineScale.value=Math.max(1,Math.min(2,pr*.95));};
 api.update=dt=>{api.flash=Math.max(0,api.flash-dt*4.5);};
 api.render=()=>{
  if(!api.enabled){renderer.setRenderTarget(null);renderer.render(scene,camera);return;}
  try{
   const tone=renderer.toneMapping;renderer.toneMapping=T.NoToneMapping;
   renderer.setRenderTarget(targets.sceneRT);renderer.render(scene,camera);
   bright.uniforms.tColor.value=targets.sceneRT.texture;pass(bright,targets.bloomA);
   for(let i=0;i<2;i++){const spread=1+i*1.5;blur.uniforms.tColor.value=targets.bloomA.texture;blur.uniforms.direction.value.set(spread/targets.bloomA.width,0);pass(blur,targets.bloomB);blur.uniforms.tColor.value=targets.bloomB.texture;blur.uniforms.direction.value.set(0,spread/targets.bloomA.height);pass(blur,targets.bloomA);}
   const u=composite.uniforms;u.tColor.value=targets.sceneRT.texture;u.tDepth.value=targets.sceneRT.depthTexture;u.tBloom.value=targets.bloomA.texture;u.near.value=camera.near;u.far.value=camera.far;u.flash.value=api.flash;u.boost.value=api.boost;
   pass(composite,null);renderer.toneMapping=tone;
  }catch(e){api.supported=false;api.enabled=false;renderer.setRenderTarget(null);renderer.render(scene,camera);}
 };
 return api;
};
})(window);
