/* v3.1: editable landscape direction only; clocks and approved mix stay locked. */
note=function(s){text(s,960,915,40,P.muted,'NotoSans',400,1730)};

note=function(s){text(s,960,915,40,P.muted,'NotoSans',400,'center',1730)};
let directionStory=0;
const contactStage=inStage;
inStage=function(fn,zoom=1,dx=0,dy=0){
 const collect=ss(directionStory,71.2,71.65)*(1-ss(directionStory,78.3,78.65));
 const build=ss(directionStory,103.7,104.1)*(1-ss(directionStory,112.65,113.0));
 const amount=Math.max(collect,build);
 if(amount<=0){contactStage(fn,zoom,dx,dy);return}
 // Foreground geometry is drawn afresh at a closer scale, never from a portrait film.
 save(()=>{g.beginPath();g.rect(144,250,1632,620);g.clip();contactStage(fn,zoom*(1+.25*amount),dx-40*collect+75*build,dy-30*amount)});
};
const directionCloud=cloud;
cloud=function(x,y,intensity,t){const collect=ss(directionStory,71.2,71.65)*(1-ss(directionStory,78.3,78.65));directionCloud(x,y+65*collect,intensity,t)};
for(const i of [5,8]){const draw=scenes[i][2];scenes[i][2]=function(t){directionStory=t;draw(t);directionStory=0}};
const directionBaseText=text;
text=function(s,x,y,size=40,c=P.paper,font='NotoSans',weight=400,align='center',max){
 if(['安全边界，任何时候都要守住','等孩子缓和后，再进入讨论、示范和练习','宽一点的底座，先让孩子自己试'].includes(s))size=Math.max(size,42);
 return directionBaseText(s,x,y,size,c,font,weight,align,max);
};

window.DIRECTION_READY=true;
