/* Layout refinements on the original scene clock. */
/* Story time here; film.js maps story to the original music clock.
   pace.js applies the locked revision once, after this editable wide layout. */
rule=function(t){
 dark();tracked('A SIMPLE ORDER',960,280,24,P.muted,7);
 ['先稳住','再连接','后解决'].forEach((s,i)=>alpha(ss(t,33.95+i*.88,34.45+i*.88),()=>{
  const x=440+i*520;
  text('0'+(i+1),x,410,29,P.muted);
  text(s,x,524,91,[P.gold,P.paper,P.green][i],'NotoSerif',500);
  tracked(['REGULATE','RELATE','REASON'][i],x,637,21,P.muted,4);
  if(i<2)text('→',x+260,525,42,P.muted);
 }));
 alpha(ss(t,36.4,36.9),()=>text('安全边界，任何时候都要守住',960,790,35,P.gold));
 text('AAP · Bruce Perry’s 3 Rs · Why Kids Act Out · 2024',960,868,24,P.muted);
};
scenes[3][2]=rule;
const wideConnectBefore=connect;
connect=function(t){
 if(t<70.2){wideConnectBefore(t);return}
 const approach=ss(t,70.2,71.4),back=ss(t,75.9,77.1),drop=ss(t,77.1,78.3),release=ss(t,78.3,78.65);
 const px=lerp(270,-260,approach)+530*back+100*drop*(1-release),floor=205;
 const baseX=lerp(px+35,430,drop),baseY=lerp(125,156,drop);
 const i=Math.min(4,Math.max(0,Math.floor((t-71.4)/.9)));
 const start=71.4+i*.9,q=ss(t,start,start+.72);
 const b=scatter[i],tx=lerp(b[0],baseX,q),ty=lerp(b[1],baseY-i*28,q)-Math.sin(q*Math.PI)*40;
 let left;
 if(t>=71.4&&t<75.9)left=[tx+22-px,ty+9-floor];
 else if(t>=75.9)left=[lerp(baseX-px-20,-65,release),lerp(baseY-96-floor,-102,release)];
 const right=t>=71.4?[lerp(baseX-px+28,68,release),lerp(baseY+18-floor,-100,release)]:undefined;
 DIRECT={x:960,y:540,s:1.12};room(t,.2);
 inStage(()=>{
  rug();basket(490,183,ss(t,70.2,70.7));
  person(px,floor,{adult:true,t,crouch:1-.40*Math.sin(approach*Math.PI)-.40*Math.sin(back*Math.PI),mood:.2,leftOverride:left,rightOverride:right});
  person(-100,200,{t,mood:.75});cloud(-100,-190,.63,t);
  blocks.forEach((item,j)=>{
   const a=71.4+j*.9,u=ss(t,a,a+.72),picked=t>=a+.72;
   if(picked){alpha(1-ss(drop,.55,1),()=>block(baseX,baseY-j*28,.42,0,item[3],j===0))}
   else if(t>=a){const p=scatter[j];block(lerp(p[0],baseX,u),lerp(p[1],baseY-j*28,u)-Math.sin(u*Math.PI)*40,lerp(1,.42,u),lerp(p[2],0,u),item[3],j===0)}
   else{const p=scatter[j];block(p[0],p[1],1,p[2],item[3],j===0)}
  });
 });
 header('03','理解感受，守住边界','FEELINGS ARE ALLOWED · HARM IS LIMITED');
 note('ZERO TO THREE · Limits for Little Ones · 2021');
};
scenes[5][2]=connect;
window.REFINE_READY=true;

/* Actual block contacts, keyed to the supplied foley sample clock. */
(()=>{
 const C={"version":"horizontal-contact-v3.0","events":[{"index":1,"actual_time":1.1333333333333333,"story_time":1.2503542793212754,"old_wide_progress_at_same_audio_time":0.26617969722630197,"kind":"fall"},{"index":2,"actual_time":1.4280625,"story_time":1.619945501046283,"old_wide_progress_at_same_audio_time":0.726158586328237,"kind":"fall"},{"index":3,"actual_time":1.6666666666666667,"story_time":1.9304493753496177,"old_wide_progress_at_same_audio_time":0.9593238952266757,"kind":"fall"},{"index":4,"actual_time":1.9333333333333333,"story_time":2.279927279507738,"old_wide_progress_at_same_audio_time":1,"kind":"fall"},{"index":5,"actual_time":2.2,"story_time":2.5794797687861273,"old_wide_progress_at_same_audio_time":0.9999994344173185,"kind":"fall"},{"index":6,"actual_time":85.9,"story_time":105.20003919012888,"old_wide_progress_at_same_audio_time":0.12856303604725286,"kind":"rebuild"},{"index":7,"actual_time":88.03333333333333,"story_time":106.70003134760672,"old_wide_progress_at_same_audio_time":0.02520908422496099,"kind":"rebuild"},{"index":8,"actual_time":90.29429166666667,"story_time":108.20070784793103,"old_wide_progress_at_same_audio_time":0.2499621784401594,"kind":"rebuild"},{"index":9,"actual_time":92.46677083333333,"story_time":109.60064582838028,"old_wide_progress_at_same_audio_time":0.5297796409259043,"kind":"rebuild"},{"index":10,"actual_time":94.93333333333334,"story_time":111.20000782004027,"old_wide_progress_at_same_audio_time":0.6432957539267788,"kind":"rebuild"}],"release_start_story":112.05796352966885,"release_end_story":112.65339372737824,"note":"仅按已有音效采样起点调整木块落定及手臂轨迹；同一音乐、总时长和字幕时间均不变。"};window.CONTACT_TIMING=C;
 function fallPose(t,i){const b=blocks[i],d=scatter[i],q=ss(t,.65+i*.05,C.events[i].story_time);return{q,x:lerp(b[0],d[0],q),y:lerp(b[1],d[1],q)-Math.sin(q*Math.PI)*(i*28+20),r:lerp(b[2],d[2],q)}}
 const originalTower=tower,originalHook=hook;let inHook=false;
 tower=function(fall=0,rebuild=0,t=0){if(!inHook){originalTower(fall,rebuild,t);return}blocks.forEach((b,i)=>{const z=fallPose(t,i);block(z.x,z.y,1,z.r,b[3],i===0)})};
 hook=function(t){inHook=true;try{originalHook(t)}finally{inHook=false}};scenes[0][2]=hook;
 function stepStart(i){return i===0?C.events[5].story_time-1.15:C.events[4+i].story_time+.04}
 function putPose(t,i){const d=scatter[i],end=C.events[5+i].story_time,q=ss(t,stepStart(i)+.22,end);return{q,x:lerp(d[0],-235,q),y:lerp(d[1],214-i*57,q)-Math.sin(q*Math.PI)*55,r:lerp(d[2],blocks[i][2],q)}}
 rebuild=function(t){
  let i=C.events.slice(5).findIndex(e=>t<e.story_time);if(i<0)i=4;
  const pose=putPose(t,i),approach=ss(t,stepStart(i),stepStart(i)+.22),release=ss(t,C.release_start_story,C.release_end_story),last=C.events[9].story_time;
  const pickupX=scatter[i][0]+90,cx=t>last?-100:lerp(lerp(-100,pickupX,approach),-100,pose.q);
  const previous=i?[-212,214-(i-1)*57]:[-165,133];
  let hx=lerp(previous[0],pose.x+23,approach),hy=lerp(previous[1],pose.y,approach);
  if(t>last){hx=lerp(-212,-165,release);hy=lerp(214-4*57,133,release)}
  DIRECT={x:960,y:540,s:1.17};room(t,.82);inStage(()=>{
   rug();person(cx,200,{t,mood:lerp(.24,.04,ss(t,99,105)),leftOverride:t>=stepStart(0)&&release<1?[hx-cx,hy-200]:undefined});
   person(305,205,{adult:true,t,crouch:1,mood:0,reach:.1*(1-ss(t,105,108))});
   blocks.forEach((b,j)=>{const z=putPose(t,j);block(z.x,z.y,.85,z.r,b[3],j===0)});
   speech('怎么搭更稳？',345,-180,phase(t,99.5,104));
  });
  header('05','等风小一点，再一起搭','A SMALL NEXT STEP · TOGETHER');
  if(t<104)note('等孩子缓和后，再进入讨论、示范和练习');else if(t<109)note('宽一点的底座，先让孩子自己试');
 };scenes[8][2]=rebuild;
 window.ACTION_DIAGNOSTICS=function(actual){
  const event=C.events.reduce((a,b)=>Math.abs(a.actual_time-actual)<Math.abs(b.actual_time-actual)?a:b),i=(event.index-1)%5;
  const src=window.sourceAt(window.VISUAL_TIME(actual)).source,t=mapTime(src,MUSIC_TIMES,STORY_TIMES),z=event.kind==='fall'?fallPose(t,i):putPose(t,i);
  const target=event.kind==='fall'?scatter[i]:[-235,214-i*57],error=Math.hypot(z.x-target[0],z.y-target[1]);
  return{event:event.index,kind:event.kind,story_time:t,progress:z.q,position:[z.x,z.y],target:[target[0],target[1]],maximum_contact_error_px:error};
 };
})();
