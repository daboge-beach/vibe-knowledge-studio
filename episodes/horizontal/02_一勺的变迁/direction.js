/* v3.1: editable landscape direction only; clocks and approved mix stay locked. */
note=function(s){text(s,960,915,40,P.muted,'NotoSans',400,1730)};

const directionChip=chip;
chip=function(s,x,y,w,c){if(s==='4—6月龄 · 高风险路径'){rr(x-330,y-37,660,74,28,c+'20');text(s,x,y,42,c,'NotoSans',500,620)}else directionChip(s,x,y,w,c)};
monthRuler=function(year,k=1){
 const y=176;line([[-340,y],[340,y]],'#c2c5ab',3);
 for(let i=0;i<=8;i++){const x=-340+i*85;line([[x,y-9],[x,y+13]],P.muted,2);text(String(i),x,y+47,42,P.muted)}
 text('月龄',0,y+113,40,P.muted);
 rr(-340,y-54,340,36,6,'#d88a7920');
 if(year===1974){line([[-340,y-36],[0,y-36]],P.red,6);text('不早于4个月',-172,y-104,46,P.red)}
 if(year===1994){line([[0,y-36],[170,y-36]],P.gold,8);ellipse(0,y-36,7,7,P.gold);ellipse(170,y-36,7,7,P.gold)}
 if(year===2003){const x=lerp(0,170,k);line([[x,y-71],[x,y-15]],P.gold,3);poly([[x-10,y-22],[x+10,y-22],[x,y-9]],P.gold);text('约6个月',x,y-109,46,P.gold)}
};
const directionBaseText=text;
text=function(s,x,y,size=40,c=P.white,font='NotoSans',weight=400,max){
 if(['高风险儿童','初始皮试阴性队列','可评估人数','肉泥 · 富铁','蔬菜泥','谷物泥','泥糊','碎软','随能力','整颗花生','成坨浓酱','4—6月龄 · 高风险路径','证据不足以支持延后预防'].includes(s))size=Math.max(size,41);
 if(['严重湿疹 / 鸡蛋过敏','医生评估','按路径引入'].includes(s))size=Math.max(size,40);
 if(s==='严重湿疹 / 鸡蛋过敏'){directionBaseText('严重湿疹 /',x,y-25,40,c,font,weight,max);return directionBaseText('鸡蛋过敏',x,y+25,40,c,font,weight,max)}
 if(s==='证据不足以支持延后预防'){directionBaseText('证据不足以支持',x,y-25,41,c,font,weight,max);return directionBaseText('延后预防',x,y+25,41,c,font,weight,max)}
 return directionBaseText(s,x,y,size,c,font,weight,max);
};

window.DIRECTION_READY=true;
