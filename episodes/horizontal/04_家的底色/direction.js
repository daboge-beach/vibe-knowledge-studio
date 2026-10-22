/* v3.1: editable landscape direction only; clocks and approved mix stay locked. */
note=function(s){text(s,960,915,40,P.muted,'NotoSans',400,1730)};

function childPaperClose(t,selfBlame=false){
 room(t,.18);
 at(960,360,2.0,()=>{
  const move=selfBlame?0:-66*ss(t,25.5,27)+64*ss(t,27.1,28.9);
  person(move,221,1.07,{child:true,t,mood:.70,look:Math.sin(t*.7)*.5,right:[88.8,-87.9],left:[-88.8,-87.9],headTilt:-.03});
  heldPaper(move,126,.76);
 });
 if(selfBlame)bubble('是不是我不乖？',1450,360,phase(t,35.6,41.3),'gold',390);
}
const relationListening=listening,relationMiddle=middle;
listening=function(t){
 shotBlend(ss(t,25.25,25.75),()=>relationListening(t),()=>{
  childPaperClose(t);header('01','孩子先在确认：家，还安全吗？','EMOTIONAL SECURITY');
  note('人物反应是情境示意；不能凭某个动作判断孩子的心理状态');
 });
};
middle=function(t){
 shotBlend(ss(t,41.0,41.45),()=>{
  childPaperClose(t,true);header('02','别让孩子，做大人的裁判','ADULT PROBLEMS · ADULT RESPONSIBILITY');
  note('Grych et al. · 2003 / AAP · 避免让孩子卷入成人关系冲突');
 },()=>relationMiddle(t));
};
calendarDetail=function(t,k,a=1){alpha(a,()=>{
 rr(1210,332,590,430,18,'#10282cf0');text('一起安排明天',1505,389,43,P.gold);
 rr(1240,447,530,270,12,'#ddd3b9');rr(1240,447,530,43,12,'#7e9b92');
 for(let i=0;i<5;i++)rr(1280+i*104,431,12,39,5,'#cabd98');
 const yy=lerp(523,606,k),ry=lerp(620,606,k);
 rr(1256,yy-32,232,64,8,'#c6af7d');text('接孩子',1372,yy,43,'#3e514a','NotoSans',500);
 rr(1510,ry-32,232,64,8,'#9eb8a4');text('休息',1626,ry,43,'#334f46','NotoSans',500);
 line([[1192,682],[1210,658]],'#e9c48540',2);
})};
const approvedSafety=safety;
safety=function(t){dark();tracked('SAFETY COMES FIRST',960,280,25,P.muted,7);text('安全，始终优先',960,440,105,P.gold,'NotoSerif',600);text('暴力 · 恐吓 · 控制',960,592,49,P.red,'NotoSans',500);text('寻求可信赖的人与当地专业支持',960,736,44,P.white);text('不要让孩子介入制止，也不用孩子承担劝和的责任',960,831,40,P.muted,'NotoSans',400,1730)};
SCENES[2].draw=listening;SCENES[3].draw=middle;SCENES[7].draw=safety;

window.DIRECTION_READY=true;
