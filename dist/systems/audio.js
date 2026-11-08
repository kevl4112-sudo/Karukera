/* Original synthetic island percussion and combat cues. No recordings or timer loops. */
(function(global){
'use strict';
class KarukeraAudio {
 constructor(){this.enabled=true;this.context=null;this.master=null;this.music=null;this.sfx=null;this.voices=new Set();this.maxVoices=28;this.beat=0;this.beatClock=0;this.stepDistance=0;this.lastCue=new Map();this.noise=null;this.started=false;}
 start(){
  this.started=true;if(!this.enabled)return;
  try{
   if(!this.context){const Context=global.AudioContext||global.webkitAudioContext;if(!Context)return;this.context=new Context();const c=this.context;this.master=c.createGain();this.master.gain.value=.28;this.master.connect(c.destination);this.music=c.createGain();this.music.gain.value=.16;this.music.connect(this.master);this.sfx=c.createGain();this.sfx.gain.value=.65;this.sfx.connect(this.master);this.noise=c.createBuffer(1,Math.ceil(c.sampleRate),c.sampleRate);const data=this.noise.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;}
   if(this.context.state==='suspended'){const p=this.context.resume();if(p&&p.catch)p.catch(()=>{});}
  }catch{this.context=null;}
 }
 setEnabled(value){this.enabled=!!value;if(this.enabled&&this.started)this.start();if(this.master&&this.context){try{this.master.gain.setTargetAtTime(this.enabled?.28:0,this.context.currentTime,.06);}catch{}}}
 _voice(source,nodes,duration){
  if(!this.context||this.voices.size>=this.maxVoices){for(const n of nodes)try{n.disconnect();}catch{}return false;}
  const voice={source,nodes};this.voices.add(voice);source.onended=()=>{this.voices.delete(voice);try{source.disconnect();}catch{}for(const n of nodes)try{n.disconnect();}catch{}};
  try{const now=this.context.currentTime;source.start(now);source.stop(now+duration+.02);return true;}catch{this.voices.delete(voice);return false;}
 }
 _tone(start,end,duration,volume=.12,type='sine',bus=this.sfx){
  if(!this.context||!this.enabled||this.context.state!=='running'||this.voices.size>=this.maxVoices)return;
  try{const c=this.context,now=c.currentTime,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(Math.max(15,start),now);o.frequency.exponentialRampToValueAtTime(Math.max(15,end),now+duration);g.gain.setValueAtTime(.001,now);g.gain.linearRampToValueAtTime(Math.max(.001,volume),now+.008);g.gain.exponentialRampToValueAtTime(.001,now+duration);o.connect(g);g.connect(bus);this._voice(o,[g],duration);}catch{}
 }
 _noise(duration,volume=.1,frequency=1200,type='bandpass',bus=this.sfx){
  if(!this.context||!this.noise||!this.enabled||this.context.state!=='running'||this.voices.size>=this.maxVoices)return;
  try{const c=this.context,now=c.currentTime,source=c.createBufferSource(),filter=c.createBiquadFilter(),g=c.createGain();source.buffer=this.noise;filter.type=type;filter.frequency.setValueAtTime(frequency,now);filter.Q.value=.65;g.gain.setValueAtTime(Math.max(.001,volume),now);g.gain.exponentialRampToValueAtTime(.001,now+duration);source.connect(filter);filter.connect(g);g.connect(bus);this._voice(source,[filter,g],duration);}catch{}
 }
 _drum(kind,accent=1){
  if(kind==='low'){this._tone(142,66,.19,.23*accent,'sine',this.music);this._tone(288,130,.09,.045*accent,'triangle',this.music);}
  if(kind==='slap'){this._tone(275,170,.095,.09*accent,'triangle',this.music);this._noise(.065,.11*accent,1700,'bandpass',this.music);}
  if(kind==='rim')this._tone(920,690,.026,.045*accent,'triangle',this.music);
 }
 cue(name){
  if(!this.enabled||!this.context||this.context.state!=='running')return;
  const now=this.context.currentTime,cooldown=name==='footstep'?.12:name==='whoosh'?.055:.07;if(now-(this.lastCue.get(name)??-10)<cooldown)return;this.lastCue.set(name,now);
  switch(name){
   case 'strike':this._noise(.075,.13,1750);this._tone(180,62,.10,.15,'triangle');break;
   case 'heavy':this._noise(.16,.18,820);this._tone(125,40,.24,.24,'sine');this._tone(440,160,.07,.05,'triangle');break;
   case 'whoosh':this._noise(.14,.08,1100);break;
   case 'chase':this._noise(.27,.08,2600,'highpass');this._tone(420,1080,.28,.065,'sine');break;
   case 'escape':this._noise(.22,.12,2200);this._tone(750,340,.17,.07,'triangle');break;
   case 'ultimatecharge':this._tone(90,240,.85,.14,'sine');this._tone(310,850,.85,.055,'triangle');this._noise(.65,.035,3000,'highpass');break;
   case 'ultimateburst':this._tone(125,28,.65,.26,'sine');this._tone(580,180,.48,.10,'triangle');this._noise(.55,.22,950);break;
   case 'landing':this._tone(105,45,.13,.14,'sine');this._noise(.12,.09,600);break;
   case 'footstep':this._tone(130,85,.05,.05,'sine');this._noise(.036,.035,1200);break;
   case 'jump':this._noise(.12,.055,1500);this._tone(180,380,.14,.055,'sine');break;
   case 'fire':this._noise(.33,.12,1250);this._tone(180,65,.26,.09,'triangle');break;
   case 'heal':this._tone(510,760,.45,.06,'sine');this._tone(760,1020,.5,.035,'sine');break;
   case 'parry':this._tone(980,770,.19,.10,'triangle');this._tone(1480,1070,.14,.045,'sine');break;
  }
 }
 update(dt,state={}){
  if(!this.context||!this.enabled)return;
  const active=!!state.playing&&!state.paused,delta=Math.min(.1,Math.max(0,Number(dt)||0));
  try{this.music.gain.setTargetAtTime(active?.16:0,this.context.currentTime,.15);}catch{}
  if(!active||this.context.state!=='running'){this.stepDistance=0;return;}
  // An original eight-pulse hand-drum figure; synthesis only, no traditional recording.
  this.beatClock+=delta;const pulse=60/102/2;
  if(this.beatClock>=pulse){this.beatClock%=pulse;const step=this.beat++%8;if(step===0||step===3||step===4)this._drum('low',step===0?1:.65);if(step===2||step===6)this._drum('slap',.65);if(step===7)this._drum('rim',.6);}
  if(state.grounded&&state.speed>.7){this.stepDistance+=delta*Math.min(15,Math.max(0,state.speed));if(this.stepDistance>2.6){this.stepDistance%=2.6;this.cue('footstep');}}else this.stepDistance=0;
 }
}
global.KarukeraAudio=KarukeraAudio;
})(window);
