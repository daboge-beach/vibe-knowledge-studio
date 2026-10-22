/* v3.1: editable landscape direction only; clocks and approved mix stay locked. */
note=function(s){text(s,960,915,40,P.muted,'NotoSans',400,1730)};

const directionBaseText=text;
text=function(s,x,y,size=40,c=P.white,font='NotoSans',weight=400,max){
 if(['细胞体','突起伸长 → 末梢接近','分段包裹，结间留有间隙','各有步调，也有个体差异'].includes(s))size=Math.max(size,42);
 return directionBaseText(s,x,y,size,c,font,weight,max);
};

window.DIRECTION_READY=true;
