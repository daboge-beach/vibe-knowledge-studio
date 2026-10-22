
window.renderCover=function(platform,ratio){
 const cw=ratio==='4:3'?1440:1920,ch=1080;
 canvas.width=cw*4/3;canvas.height=1440;g.setTransform(4/3,0,0,4/3,0,0);g.globalAlpha=1;g.shadowBlur=0;
 const gold=P.gold,white=P.white||P.paper,muted=P.muted;dark();
 const ct=(s,x,y,size,c=white,font='NotoSans',weight=500,max=1700)=>text(s,x,y,size,c,font,weight,'center',max);
 const ln=(a,b)=>line([a,b],'#e9c48545',1.5);
 const motif=(x,y,s)=>{save(()=>{g.translate(x,y);g.scale(s,s);rug();tower(1,0,0);person(-100,200,{mood:.7,t:5});person(225,205,{adult:true,crouch:1,t:0});cloud(-100,-190,.7,0)})};
 const titles=["孩子崩溃时", "先借他一点平静", "孩子崩溃时", "先借他一点平静"];
 const label="第三集 | Vibe知识大赏";
 ct(label,cw/2,104,29,gold,'NotoSans',500,cw-160);
 ln([100,158],[cw-100,158]);
 if(ratio==='4:3'){
  ct(titles[0],cw/2,294,104,white,'NotoSerif',700,cw-160);
  ct(titles[1],cw/2,432,102,gold,'NotoSerif',700,cw-140);
  motif(cw/2,735,true?.64:false?.65:.73);
 }else if(platform==='bilibili'){
  ct(titles[0],620,362,108,white,'NotoSerif',700,1040);
  ct(titles[1],620,521,106,gold,'NotoSerif',700,1050);
  ct("借你一点平静",620,744,38,gold,'NotoSerif',500,1040);
  motif(1460,555,true?.63:false?.74:.89);
 }else{
  ct(titles[2],cw/2,275,105,white,'NotoSerif',700,cw-220);
  ct(titles[3],cw/2,421,100,gold,'NotoSerif',700,cw-220);
  motif(cw/2,735,true?.65:false?.65:.67);
 }
 ct('不焦虑爸爸  ·  陪孩子长大，也陪自己成长',cw/2,1016,27,muted,'NotoSans',400,cw-170);
};
