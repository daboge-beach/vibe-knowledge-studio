/* portrait-contact-v2.1-r1 — output clock; no caption, music or layout-clock remapping. */
(()=>{
 'use strict';
 if(!V)throw new Error('This repair project supports portrait only.');
 const version='portrait-contact-v2.1-r1',originalSeek=window.seek;
 let actual=0,inHook=false;
 const hits=window.MUSIC_SYNC.foley.map((e,i)=>({index:i+1,time:e.sample_start/48000,kind:i<5?'fall':'put',duration:e.duration}));
 const bx=-420,by=216,bs=.90;
 const store=i=>({x:bx-27+(i%3)*26,y:by-27-(i>=3?24:0),r:0,s:1});
 const floorPose=i=>({x:scatter[i][0],y:scatter[i][1],r:scatter[i][2],s:1});
 const gripPoint=(z,i,scale=z.s)=>{
  const x=((i===0?100:64)/2+4)*scale,y=4*scale;
  return[z.x+x*Math.cos(z.r)-y*Math.sin(z.r),z.y+x*Math.sin(z.r)+y*Math.cos(z.r)];
 };
 const lerpPoint=(a,b,k)=>[lerp(a[0],b[0],k),lerp(a[1],b[1],k)];
 const local=(point,x,y)=>[point[0]-x,point[1]-y];

 // An articulated arm, rather than moving an entire illustration. The wrist is the held-object contact.
 window.REPAIR_ARM=function(shoulder,hand,adult,side,shirt,drawPalm=true){
  const upper=adult?102:78,lower=adult?96:76;
  const dx=hand[0]-shoulder[0],dy=hand[1]-shoulder[1],d=Math.hypot(dx,dy)||1;
  const cos=clamp((upper*upper+d*d-lower*lower)/(2*upper*d),-1,1);
  const a=Math.atan2(dy,dx)+(side<0?-1:1)*Math.acos(cos);
  const elbow=[shoulder[0]+Math.cos(a)*upper,shoulder[1]+Math.sin(a)*upper];
  line([shoulder,elbow,hand],shirt,adult?29:22);
  if(drawPalm)ellipse(hand[0],hand[1],adult?14:11,adult?17:13,P.skin);
  return{elbow,reach:d,max:upper+lower};
 };
 function fingers(z,i,adult=true,closed=1){
  if(closed<=0)return;
  const h=gripPoint(z,i),size=adult?1:.86;
  save(()=>{
   g.translate(h[0],h[1]);g.rotate(z.r);
   ellipse(3,0,12*size,15*size,P.skin);
   for(let k=0;k<3;k++)line([[-9*closed,-8+k*6],[8,-7+k*6]],P.skin,4*size);
   ellipse(-10*closed,10,5*size,6*size,'#dfae83');
   line([[-4,-5],[-6,6]],'#a87959',1.3);
  });
 }
 function basketBack(x=bx){
  save(()=>{g.translate(x,by);g.scale(bs,bs);ellipse(0,46,112,22,'#13201b55');
   ellipse(0,-34,97,17,'#bc9b69');ellipse(0,-34,83,12,'#564b35');
   path(k=>{k.moveTo(-94,-30);k.lineTo(94,-30);k.lineTo(77,44);k.quadraticCurveTo(0,61,-77,44);k.closePath()},'#816441');
  });
 }
 function basketFront(x=bx){
  save(()=>{g.translate(x,by);g.scale(bs,bs);
   path(k=>{k.moveTo(-94,-26);k.quadraticCurveTo(0,-9,94,-26);k.lineTo(77,44);k.quadraticCurveTo(0,61,-77,44);k.closePath()},'#96764e');
   for(let i=0;i<8;i++)line([[-80+i*22,-20],[-65+i*18,44]],'#c3a16b66',3);
   for(let i=0;i<4;i++)line([[-86+i*3,-6+i*16],[86-i*3,-6+i*16]],'#3e342955',3);
   g.strokeStyle='#bc9b69';g.lineWidth=7;g.beginPath();g.ellipse(0,-34,94,16,0,0,Math.PI);g.stroke();
  });
 }
 function drawObject(z,i,shadow=false){block(z.x,z.y,z.s,z.r,blocks[i][3],i===0,shadow)}

 // Clear one object at a time into a basket beside the loose blocks.
 // No held path enters the child's head region; full-size objects keep the same grip transform.
 const clearStart=57.25,step=1.65;
 function clearTimes(i){const a=clearStart+i*step;return{a,grab:a+.35,lift:a+.43,place:a+1.22,open:a+1.40,end:a+step}}
 function clearPose(t,i){
  const f=floorPose(i),to=store(i),q=ss(t,clearTimes(i).lift,clearTimes(i).place);
  return{x:lerp(f.x,to.x,q),y:lerp(f.y,to.y,q)-Math.sin(q*Math.PI)*61,r:lerp(f.r,0,q),s:1};
 }
 function clearState(t){
  const i=Math.min(4,Math.max(0,Math.floor((t-clearStart)/step))),times=clearTimes(i),z=clearPose(t,i);
  const after=t>=clearTimes(4).end;
  const prev=i?gripPoint(store(i-1),i-1):[-300,125];
  const to=gripPoint(z,i),reach=ss(t,times.a,times.grab);
  let wrist=lerpPoint(prev,to,reach),x=Math.min(-235,z.x+115);
  const approach=ss(t,55.25,clearStart),returning=ss(t,clearTimes(4).end,66.65);
  if(t<clearStart){x=lerp(225,Math.min(-235,floorPose(0).x+115),approach);wrist=lerpPoint([140,117],prev,approach)}
  if(t>=times.open){const relax=[x-70,110];wrist=lerpPoint(to,relax,ss(t,times.open,times.end))}
  if(after){x=lerp(Math.min(-235,store(4).x+115),225,returning);wrist=[x-70,110]}
  const closed=ss(t,times.grab-.11,times.grab)*(1-ss(t,times.place+.12,times.open));
  return{i,times,z,wrist,x,closed,held:t>=times.grab&&t<times.open,walk:t<clearStart?Math.sin(approach*Math.PI):after?Math.sin(returning*Math.PI):Math.sin(ss(t,times.lift,times.place)*Math.PI)*.6,after};
 }
 function childBoundary(t){return ss(t,53.1,53.7)*(1-ss(t,55.4,56.1))}
 connect=function(story){
  const t=actual,c=clearState(t),signal=childBoundary(t);
  room(story,.2);
  inStage(()=>{
   rug();basketBack();
   // The parent walks behind the child before kneeling beside the object area.
   const crouch=t<clearStart?1-.52*Math.sin(ss(t,55.25,clearStart)*Math.PI):c.after?1-.52*Math.sin(ss(t,clearTimes(4).end,66.65)*Math.PI):1;
   person(c.x,205,{adult:true,t:story,mood:.2,crouch,walk:c.walk,leftOverride:t>=55.25?local(c.wrist,c.x,205):undefined,grip:c.held});
   person(-100,200,{t:story,mood:.75,arm:signal});
   // Stationary or basket contents before moving object; the child never occludes a crossing block.
   for(let j=0;j<5;j++)if(j!==c.i||t<clearStart||c.after){
    const z=t>=clearTimes(j).place?store(j):floorPose(j);drawObject(z,j,t<clearTimes(j).lift);
   }
   if(t>=clearStart&&!c.after)drawObject(c.z,c.i,t< c.times.lift);
   basketFront();
   if(c.held)fingers(c.z,c.i,true,c.closed);
   cloud(-100,-190,.63,story);
   speech('你很失望',220,-180,phase(story,60.3,65));
  },1.15+.40*ss(t,55.3,57.3)*(1-ss(t,65.5,66.65)),30+180*ss(t,55.3,57.3)*(1-ss(t,65.5,66.65)),-145*ss(t,55.3,57.3)*(1-ss(t,65.5,66.65)));
  header('03','理解感受，守住边界','FEELINGS ARE ALLOWED · HARM IS LIMITED');
  note('ZERO TO THREE · Limits for Little Ones · 2021');
 };
 scenes[5][2]=connect;
 // Preserve the basket position across the adjacent scene; the time-card makes the next activity distinct.
 space=function(story){
  const dist=ss(story,84.5,87)*65;room(story,.2);
  inStage(()=>{rug();basketBack();for(let j=0;j<5;j++)drawObject(store(j),j);basketFront();
   person(-100,200,{t:story,mood:lerp(.76,.22,ss(story,88,94))});
   person(225+dist,205,{adult:true,t:story,crouch:1,mood:.3,arm:.25*(1-ss(story,84,86))});
   cloud(-100,-190,lerp(.6,.10,ss(story,87,94)),story);
   speech('抱抱？  陪你坐着？',240,-180,phase(story,79.5,84),{max:390});
   if(story>85)alpha(phase(story,85,88),()=>line([[-132,-109],[-110,-103],[-88,-109]],P.gold,3));
  });
  header('04','陪伴，也可以有距离','STAY CLOSE · LEAVE A LITTLE SPACE');
  note('拥抱可以邀请；孩子不愿意时，不强迫身体接触');
 };
 scenes[6][2]=space;

 // Each placement uses the existing sound's exact PCM sample clock. Music and foley WAVs are untouched.
 function buildTimes(i){
  const end=hits[5+i].time,start=i?hits[4+i].time+.30:84.30;
  return{a:start,grab:start+.35,lift:start+.47,place:end,open:end+.22,end:end+.30};
 }
 const buildBx=-250,storeBuild=i=>({...store(i),x:store(i).x+buildBx-bx});
 const target=i=>({x:-420,y:190-i*(64*.85),r:0,s:.85});
 function buildPose(t,i){
  const from={...storeBuild(i),s:.85},to=target(i),T=buildTimes(i),q=ss(t,T.lift,T.place);
  return{x:lerp(from.x,to.x,q),y:lerp(from.y,to.y,q)-Math.sin(q*Math.PI)*34,r:lerp(0,to.r,q),s:.85};
 }
 function buildState(t){
  let i=hits.slice(5).findIndex(e=>t<e.time+.30);if(i<0)i=4;
  const T=buildTimes(i),z=buildPose(t,i),previous=i?gripPoint(target(i-1),i-1):[-165,133];
  const reach=ss(t,T.a,T.grab),to=gripPoint(z,i),homeX=-100;
  let wrist=lerpPoint(previous,to,reach),x=lerp(i?target(i-1).x+115:homeX,storeBuild(i).x+115,reach);
  x=lerp(x,target(i).x+115,ss(t,T.lift,T.place));
  const done=t>=buildTimes(4).open,release=ss(t,buildTimes(4).open,96.3);
  if(t>=T.open)wrist=lerpPoint(to,[x-65,133],ss(t,T.open,T.end));
  if(done){x=lerp(target(4).x+115,homeX,release);wrist=lerpPoint(gripPoint(target(4),4),[homeX-65,133],release)}
  const closed=ss(t,T.grab-.1,T.grab)*(1-ss(t,T.place+.12,T.open));
  return{i,T,z,wrist,x,closed,held:t>=T.grab&&t<T.open,walk:Math.sin(ss(t,T.a,T.place)*Math.PI)*.8,done};
 }
 rebuild=function(story){
  const t=actual,c=buildState(t);
  room(story,.82);
  inStage(()=>{
   rug();basketBack(buildBx);
   person(190,205,{adult:true,t:story,crouch:1,mood:0,reach:.10*(1-ss(story,105,108))});
   person(c.x,200,{t:story,mood:lerp(.24,.04,ss(story,99,105)),walk:c.walk,leftOverride:t>=buildTimes(0).a?local(c.wrist,c.x,200):undefined,grip:c.held});
   for(let j=0;j<5;j++){
    const z=buildPose(t,j);drawObject(z,j,t>=buildTimes(j).place);
   }
   basketFront(buildBx);
   if(c.held)fingers(c.z,c.i,false,c.closed);
   cloud(-100,-190,.10*(1-ss(story,99,104)),story);
   speech('怎么搭更稳？',240,-180,phase(story,99.5,104));
  },1.45,180,-125);
  header('05','等风小一点，再一起搭','A SMALL NEXT STEP · TOGETHER');
  if(story<104)note('等孩子缓和后，再进入讨论、示范和练习');else if(story<109)note('宽一点的底座，先让孩子自己试');
 };
 scenes[8][2]=rebuild;

 // The opening fall is checked against the same five original landing sounds.
 const originalTower=tower,originalHook=hook;
 function fallPose(t,i){const f=blocks[i],to=floorPose(i),q=ss(t,.48+i*.09,hits[i].time);return{x:lerp(f[0],to.x,q),y:lerp(f[1],to.y,q)-Math.sin(q*Math.PI)*(i*28+20),r:lerp(f[2],to.r,q),s:1}}
 tower=function(fall=0,rebuild=0,t=0){if(!inHook)return originalTower(fall,rebuild,t);for(let i=0;i<5;i++)drawObject(fallPose(actual,i),i,true)};
 hook=function(t){inHook=true;try{originalHook(t)}finally{inHook=false}};scenes[0][2]=hook;

 window.seek=function(t){actual=clamp(t,0,window.PACING.duration-1/window.PACING.fps);return originalSeek(actual)};
 window.REPAIR_DIAGNOSTICS=function(t){
  const clear=clearState(t),build=buildState(t);
  const simplify=(z,i)=>({...z,grip:gripPoint(z,i)});
  return{actual_time:t,clear:{...clear,z:simplify(clear.z,clear.i),contact_error:clear.held?Math.hypot(...gripPoint(clear.z,clear.i).map((v,k)=>v-clear.wrist[k])):null},build:{...build,z:simplify(build.z,build.i),contact_error:build.held?Math.hypot(...gripPoint(build.z,build.i).map((v,k)=>v-build.wrist[k])):null},positions:{clear:Array.from({length:5},(_,i)=>clearPose(t,i)),build:Array.from({length:5},(_,i)=>buildPose(t,i))}};
 };
 window.CONTACT_TIMING={version,events:hits,clear_events:Array.from({length:5},(_,i)=>({index:i+1,...clearTimes(i),sound:'无新增音效：在篮中轻放，沿用锁定foley'})),build_events:Array.from({length:5},(_,i)=>({index:i+1,...buildTimes(i)}))};
 window.PORTRAIT_REPAIR={version,ready:true,content_changed:false,audio_changed:false,scope:'R-V03-01 and actual wood-contact alignment; 9:16 only'};
})();
