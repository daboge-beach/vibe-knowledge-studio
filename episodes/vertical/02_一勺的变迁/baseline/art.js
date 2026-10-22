/* New episode-specific teaching illustrations, deterministic in t. */
function stage(fn,s=1,dy=0){save(()=>{g.translate(V?500:960,(V?910:525)+dy);g.scale((V?1:1.12)*s,(V?1:1.12)*s);fn()})}
function strokeCurve(points,k,col,width=3){let n=Math.max(1,Math.ceil(clamp(k)*(points.length-1)));line(points.slice(0,n+1),col,width)}
function bezier(a,b,c,d,n=70){let out=[];for(let i=0;i<=n;i++){let k=i/n,q=1-k;out.push([q*q*q*a[0]+3*q*q*k*b[0]+3*q*k*k*c[0]+k*k*k*d[0],q*q*q*a[1]+3*q*q*k*b[1]+3*q*k*k*c[1]+k*k*k*d[1]])}return out}
function shadow(x,y,rx,ry,a=.25){alpha(a,()=>ellipse(x,y,rx,ry,'#020c10'))}
function ruleLabel(s,y,c=P.gold,size=27){text(s,0,y,size,c,'NotoSans',500,800)}
function chip(s,x,y,w=240,c=P.teal){rr(x-w/2,y-23,w,46,23,c+'20');text(s,x,y,22,c,'NotoSans',500,w-24)}
function paperPanel(x,y,w,h){shadow(x+6,y+h/2+12,w*.47,20,.35);rr(x-w/2,y-h/2,w,h,13,'#bcaa86');rr(x-w/2+4,y-h/2-4,w-8,h-7,11,gradient(x-w/2,y-h/2,x+w/2,y+h/2,'#f3e8cc','#d7c5a2'));line([[x-w/2+25,y-h/2+35],[x+w/2-25,y-h/2+35]],'#8c796244',1)}
function neuralBrain(x=0,y=0,s=1,frontal=0){save(()=>{g.translate(x,y);g.scale(s,s);
 shadow(0,195,265,27,.25);
 path(k=>{k.moveTo(-120,100);k.bezierCurveTo(-129,142,-94,177,-75,229);k.lineTo(-28,228);k.bezierCurveTo(-48,162,-34,140,4,112);k.closePath()},gradient(-100,105,-20,240,'#d8b99a','#8e7a6b'));
 path(k=>{k.moveTo(-245,75);k.bezierCurveTo(-310,90,-282,176,-217,191);k.bezierCurveTo(-145,214,-92,147,-129,99);k.closePath()},gradient(-260,90,-120,195,'#c7ad94','#867e74'));
 for(let i=0;i<7;i++)path(k=>{k.moveTo(-267+i*6,107+i*10);k.quadraticCurveTo(-215+i*7,146+i*8,-142+i,119+i*5)},null,'#605b553a',3);
 const outline=k=>{k.moveTo(-276,58);k.bezierCurveTo(-315,-15,-280,-121,-186,-155);k.bezierCurveTo(-141,-212,-42,-201,13,-184);k.bezierCurveTo(94,-191,186,-148,216,-103);k.bezierCurveTo(269,-75,288,-9,258,41);k.bezierCurveTo(247,105,189,129,117,127);k.bezierCurveTo(66,153,-15,133,-59,116);k.bezierCurveTo(-121,140,-188,104,-213,80);k.quadraticCurveTo(-257,98,-276,58);k.closePath()};
 path(outline,gradient(-230,-180,245,140,'#e3bbac','#aa7e77'),'#f3d5b145',2.5);
 save(()=>{g.beginPath();outline(g);g.clip();
  for(let i=0;i<11;i++){const xx=-246+i*45;path(k=>{k.moveTo(xx,-130+Math.sin(i)*20);k.bezierCurveTo(xx-30,-75,xx+54,-88,xx+30,-35);k.bezierCurveTo(xx+11,1,xx+47,24,xx+14,59)},null,'#795b5966',5);path(k=>{k.moveTo(xx+5,-130+Math.sin(i)*20);k.bezierCurveTo(xx-25,-75,xx+59,-88,xx+35,-35)},null,'#f9dbc137',3)}
  for(let i=0;i<4;i++)path(k=>{k.moveTo(-250,18+i*28);k.bezierCurveTo(-191,-2+i*20,-166,55+i*18,-108,29+i*23);k.bezierCurveTo(-52,13+i*25,18,69+i*16,82,42+i*22)},null,'#85625b77',4);
  path(k=>{k.moveTo(20,-180);k.bezierCurveTo(-4,-124,17,-80,-18,-35);k.quadraticCurveTo(-35,-2,-13,39)},null,'#74565388',6);
  alpha(frontal,()=>{path(k=>{k.moveTo(118,-166);k.bezierCurveTo(222,-136,291,-70,260,54);k.bezierCurveTo(248,101,206,126,139,126);k.bezierCurveTo(175,65,122,24,150,-21);k.bezierCurveTo(178,-80,124,-106,118,-166)},'#e9c485b0');path(k=>{k.moveTo(151,-147);k.bezierCurveTo(213,-129,189,-48,220,-13);k.quadraticCurveTo(243,18,211,60)},null,'#b7926570',4)})
 });
 path(k=>{k.moveTo(-254,42);k.bezierCurveTo(-175,33,-123,60,-71,65);k.bezierCurveTo(-25,67,3,109,70,112)},null,'#795758aa',5);
})}
function neuronBody(x,y,s=1,col='#c39b87',seed=1){save(()=>{g.translate(x,y);g.scale(s,s);
 for(let i=0;i<7;i++){let a=(i/7)*Math.PI*2+.17,xx=Math.cos(a)*84,yy=Math.sin(a)*86;
  const pts=bezier([Math.cos(a)*24,Math.sin(a)*24],[Math.cos(a+.2)*44,Math.sin(a+.2)*44],[xx*.7,yy*.7],[xx,yy]);line(pts,col,5.5);
  for(let j of[-1,1]){let b=a+j*.5;line([[xx*.62,yy*.62],[xx*.78+Math.cos(b)*18,yy*.78+Math.sin(b)*18],[xx+Math.cos(b)*28,yy+Math.sin(b)*27]],col,2.8)}
 }
 path(k=>{for(let i=0;i<=14;i++){let a=i/14*Math.PI*2,r=34+(i%2?5:-4);i?k.lineTo(Math.cos(a)*r,Math.sin(a)*r):k.moveTo(Math.cos(a)*r,Math.sin(a)*r)}k.closePath()},gradient(-30,-30,35,35,'#ebc6a7',col),'#f0ceb04a',2);
 ellipse(-2,1,14,17,gradient(-14,-12,11,15,'#a9807f','#756675'));ellipse(-5,-3,5,6,'#d4b29b55');
})}
function neuralConnection(k=1,fire=0,prune=0){
 const x0=-245,x1=245;neuronBody(x0,0,1.05);neuronBody(x1,-25,1.05,'#9db2a3');
 const pts=bezier([-210,7],[-70,100],[42,-90],[142,-26]);strokeCurve(pts,k,'#c6ab89',9+prune*3);
 strokeCurve(pts,k,'#f2d8b354',3);
 if(k>.98){ellipse(143,-26,9,8,P.gold);line([[160,-34],[163,-18]],'#acc2b0',5)}
 for(let j=0;j<3;j++){let q=bezier([-97,21],[-33,80+j*45],[54,80+j*34],[119,70+j*45]);line(bezier([223,-5],[189,48],[184,81+j*40],[135,70+j*45]),'#8da89b',3);alpha(1-prune*.93,()=>{strokeCurve(q,ss(k,.3+j*.1,1),'#9a8976',5);if(k>.99)ellipse(119,70+j*45,5,5,'#c6ab89')});}
 if(fire>0&&k>.98){let q=(fire%1),i=Math.floor(q*(pts.length-1));ellipse(...pts[i],8,8,P.white);glow(...pts[i],30,P.gold,.22)}
}
function tubeFold(k){
 ruleLabel('神经板 → 神经管',-235,P.gold,31);
 if(k<.99){const x=lerp(285,48,k),yy=lerp(0,-122,k);
 path(q=>{q.moveTo(-x,yy);q.bezierCurveTo(-x*.94,lerp(30,-45,k),-115,104,0,106);q.bezierCurveTo(115,104,x*.94,lerp(30,-45,k),x,yy);q.lineTo(x+28,yy+14);q.bezierCurveTo(x+35,65,135,150,0,150);q.bezierCurveTo(-135,150,-x-35,65,-x-28,yy+14);q.closePath()},gradient(-200,-120,210,150,'#d8b5a0','#ad7e79'),'#ebc8ac',2);
 for(let j=0;j<16;j++){let a=j/15,xx=lerp(-x,x,a),y=yy*(Math.pow(Math.abs(a-.5)*2,2))+100*(1-Math.pow(Math.abs(a-.5)*2,2));ellipse(xx,y+12,4,6,'#715b6650')}
 line([[-320,170],[320,170]],'#8ba79f44',3);
 }else{ellipse(0,13,103,139,gradient(-90,-100,90,130,'#e5c3a5','#ac7e7d'));ellipse(0,1,58,87,'#17282b');for(let i=0;i<15;i++){const a=i/15*Math.PI*2;ellipse(Math.cos(a)*83,13+Math.sin(a)*115,5,7,'#795e7060')}}
 ruleLabel('横切面 · 简化示意',238,P.muted,24);
}
function longTube(k){
 alpha(1-ss(k,.08,.49),()=>{
  path(q=>{q.moveTo(-42,198);q.bezierCurveTo(-47,50,-39,14,-72,-55);q.bezierCurveTo(-115,-142,-63,-195,0,-190);q.bezierCurveTo(79,-200,111,-118,70,-53);q.bezierCurveTo(39,12,45,74,42,198);q.closePath()},gradient(-80,-190,90,210,'#e5bea4','#a7807a'));
  path(q=>{q.moveTo(0,176);q.bezierCurveTo(0,93,7,8,-15,-70);q.quadraticCurveTo(-24,-109,0,-143)},null,'#7b626280',10);
 });
 alpha(ss(k,.12,.64),()=>neuralBrain(0,-18,lerp(.64,.94,k)));ruleLabel('头端逐渐发育成脑',279,P.gold,28);
}
function homeBackdrop(){
 dark();stage(()=>{alpha(.55,()=>{rr(-430,-291,188,275,90,'#637f7c');rr(-421,-282,170,256,82,'#8ca6a0');line([[-336,-282],[-336,-27]],'#233a3d',8);line([[-419,-155],[-253,-155]],'#233a3d',7);ellipse(-287,-218,21,21,'#e1d4ad')});plant(351,205,.85);ellipse(0,276,415,43,'#7995861e');line([[-440,245],[440,245]],'#d1b58a30',2)})
}
function baby(x,y,s=1,t=0,reach=0,talk=0){save(()=>{g.translate(x,y);g.scale(s,s);
 // Legs and complete chair are behind the torso and tray.
 rr(-74,-139,148,132,25,'#8a725b');rr(-64,-130,128,116,20,'#c0a47c');line([[-59,-2],[-80,139]],'#866a4c',14);line([[59,-2],[80,139]],'#866a4c',14);
 line([[-27,-30],[-36,39],[-47,66]],'#8c9c88',23);line([[27,-30],[38,39],[48,66]],'#8c9c88',23);ellipse(-47,67,22,11,'#dcc8a4');ellipse(48,67,22,11,'#dcc8a4');
 path(q=>{q.moveTo(-40,-163);q.quadraticCurveTo(0,-182,39,-163);q.lineTo(51,-38);q.quadraticCurveTo(0,-16,-51,-38);q.closePath()},gradient(-48,-165,52,-25,'#d5b677','#ad8652'));
 path(q=>{q.moveTo(-29,-153);q.quadraticCurveTo(0,-127,29,-153);q.lineTo(34,-85);q.quadraticCurveTo(0,-64,-34,-85);q.closePath()},'#e9d8b1');
 ellipse(0,-218,54,61,skin(0,-218,54));ellipse(-53,-206,7,13,'#d8a583');ellipse(53,-206,7,13,'#d8a583');
 path(q=>{q.moveTo(-52,-223);q.bezierCurveTo(-64,-266,-24,-290,6,-280);q.bezierCurveTo(42,-284,63,-254,52,-223);q.lineTo(40,-240);q.quadraticCurveTo(27,-240,16,-249);q.quadraticCurveTo(-2,-238,-18,-247);q.quadraticCurveTo(-34,-245,-43,-231);q.closePath()},gradient(-40,-282,47,-228,'#574139','#30292a'));
 for(let q of[-1,1]){ellipse(q*19+2,-214,6,5,'#f4e3c9');ellipse(q*19+4,-214,2.7,4,'#304444');line([[q*19-7,-229],[q*19+7,-230]],'#765240',2)}
 path(q=>{q.moveTo(2,-210);q.lineTo(0,-200);q.lineTo(7,-198)},null,'#bc8767',2);
 ellipse(4,-183,9,3+talk*6,'#8c5b4c');ellipse(-32,-193,9,5,'#b7786840');ellipse(35,-193,9,5,'#b7786840');
 let hx=lerp(70,117,reach),hy=lerp(-95,-146,reach);sleeve([[-39,-143],[-57,-99],[-25,-84]],'#c5a366',18);hand(-25,-84,9);sleeve([[39,-143],[67,-113],[hx,hy]],'#d2b172',18);hand(hx,hy,10);
 rr(-110,-65,220,25,12,'#a1855f');ellipse(0,-64,111,12,'#c6aa7e');
})}
function rattle(x,y,s=1,rot=0){save(()=>{g.translate(x,y);g.rotate(rot);g.scale(s,s);line([[0,-2],[0,64]],'#ba9160',12);ellipse(0,-13,26,27,'#d9b876');ellipse(0,-13,18,19,'#8cae9f');ellipse(0,-13,8,9,'#e9d7b3');line([[-14,-34],[-5,-36]],'#fff0c66b',3)})}
function exchange(t,respond=1,reach=0,close=0){
 const speech=(Math.sin(t*3.7)+1)/2;
 stage(()=>{const z=1+close*.13;g.scale(z,z);
  const hx=-205+lerp(70,117,reach)*1.1,hy=149+lerp(-95,-146,reach)*1.1;
  rattle(hx-3,hy-46,.80,.045);
  baby(-205,149,1.1,t,reach,respond<.45?speech:.2);
  chair(187,243,1.45);person(192,238,1.46,{seated:true,role:'dad',t,look:-.8,smile:true,talk:phase(t,3.8,6.8)*speech,lean:-.055*respond,left:[-104,-159],leftElbow:[-65,-122],right:[38,-92],rightElbow:[58,-119],palm:'left',palmOpen:respond});
  alpha(phase(t,0.25,3.65)*(1-close*.8),()=>bubble('咿呀',-192,-236,1,'gold',150));
  alpha(phase(t,3.9,7.1)*(1-close*.8),()=>bubble('我听见啦',188,-185,1,'neutral',210));
 });
}
function blocksTower(k,t=0){
 const colors=['#9cb8a4','#dfbb7e','#9aacb6','#c9927d'];
 function block(x,y,n,s=75){shadow(x+5,y+s*.5+7,s*.56,10,.2);rr(x-s/2,y-s/2,s,s,5,colors[n%4]);poly([[x-s/2,y-s/2],[x-s/2+12,y-s/2-12],[x+s/2+12,y-s/2-12],[x+s/2,y-s/2]],'#e4d2ac');poly([[x+s/2,y-s/2],[x+s/2+12,y-s/2-12],[x+s/2+12,y+s/2-12],[x+s/2,y+s/2]],'#6a8275');text(['A','B','C','D'][n%4],x,y,31,'#334c49','NotoSerif',500)}
 const bx=85,base=218,xx=lerp(-40,bx,k),yy=lerp(100,base-3*61,k);
 const hx=xx-33,hy=yy+4;
 person(-95,272,1.2,{child:true,seated:false,t,look:1,smile:true,left:[-45,-60],leftElbow:[-48,-91],right:[(hx+95)/1.2,(hy-272)/1.2],rightElbow:[lerp(30,84,k),lerp(-92,-111,k)]});
 for(let i=0;i<3;i++)block(bx,base-i*61,i,60);block(xx,yy,3,60);
}
function myelin(t){
 const pts=bezier([-340,10],[-190,-33],[180,43],[340,0]);line(pts,'#a7907d',20);line(pts,'#e6cfaa',9);
 for(let i=0;i<6;i++){let x=-278+i*108,yy=7*Math.sin(i*.9);const k=ss(t,66+i*.24,67.4+i*.24);alpha(k,()=>{save(()=>{g.translate(x,yy);g.scale(1,lerp(.2,1,k));rr(-40,-36,81,72,27,gradient(-35,-32,35,38,'#c3c9aa','#6f9990'));for(let j=0;j<3;j++)path(q=>q.ellipse(-23+j*22,0,7,32,0,0,Math.PI*2),null,'#e2d9b066',2);line([[-30,-20],[26,-20]],'#eff1cd44',2)})})}
 const p=clamp((t-69)%2.6/2.6),i=Math.floor(p*(pts.length-1));if(t>69){glow(...pts[i],28,P.gold,.3);ellipse(...pts[i],9,9,P.white)}
 line([[-277,-42],[-250,-121],[-80,-121]],P.muted,2);text('髓鞘',-30,-122,28,P.white);line([[-222,15],[-217,131],[-100,131]],P.muted,2);text('轴突',-51,132,28,P.white);
 ruleLabel('分段包裹，结间留有间隙',235,P.muted,24);
}
function timeline(t){
 const labels=['出生前','婴幼儿','儿童','青春期','成年'];
 if(V){let y=-250;labels.forEach((s,i)=>{const a=ss(t,101.7+i*.65,102.3+i*.65);alpha(a,()=>{line([[-225,y+i*115],[-182,y+i*115]],P.gold,3);ellipse(-225,y+i*115,6,6,P.gold);text(s,-62,y+i*115,39,i<4?P.white:P.gold,'NotoSerif',500);if(i<4)line([[-225,y+i*115+10],[-225,y+(i+1)*115-10]],'#b5b9ac50',2)})});
 }else{line([[-610,20],[610,20]],'#b5b9ac60',2);labels.forEach((s,i)=>alpha(ss(t,101.7+i*.65,102.3+i*.65),()=>{const x=-560+i*280;ellipse(x,20,7,7,P.gold);text(s,x,-53,33,P.white,'NotoSerif',500);if(i<4)text('→',x+140,20,28,P.teal)}))}
}
function blendColor(a,b,k){const aa=a.slice(1).match(/../g).map(v=>parseInt(v,16)),bb=b.slice(1).match(/../g).map(v=>parseInt(v,16));return '#'+aa.map((v,i)=>Math.round(lerp(v,bb[i],clamp(k))).toString(16).padStart(2,'0')).join('')}
function spoon(x,y,s=1,rot=0,thin=1){save(()=>{g.translate(x,y);g.rotate(rot);g.scale(s,s);shadow(40,26,183,15,.23);path(q=>{q.moveTo(20,-14);q.bezierCurveTo(75,-13,121,-9,216,-13);q.bezierCurveTo(244,-14,246,13,217,16);q.bezierCurveTo(126,20,85,12,20,15);q.closePath()},gradient(0,-15,180,15,'#dbb57e','#9e784f'));ellipse(-31,0,75,47,gradient(-80,-35,30,40,'#d6b383','#9a7650'));ellipse(-36,-3,61,35,'#805d3f');ellipse(-37,-5,54,29,gradient(-85,-28,8,27,blendColor('#b9894d','#dab485',thin),blendColor('#8b5a2c','#b18b60',thin)));alpha(1-thin,()=>{path(q=>{q.moveTo(-77,0);q.bezierCurveTo(-81,-23,-65,-30,-57,-27);q.bezierCurveTo(-65,-51,-29,-59,-23,-31);q.bezierCurveTo(-1,-37,7,-7,-1,0);q.closePath()},gradient(-65,-50,0,0,'#c6975d','#9b6839'));path(q=>{q.moveTo(-62,-17);q.quadraticCurveTo(-44,-38,-26,-19)},null,'#e3b777',3)});path(q=>{q.moveTo(-79,-8);q.quadraticCurveTo(-48,-25,-15,-15)},null,'#f4d3a844',3);line([[51,-7],[211,-7]],'#fff0bf3a',2)})}
function bowl(x,y,s=1,kind='peanut'){save(()=>{g.translate(x,y);g.scale(s,s);shadow(0,94,107,15,.3);path(q=>{q.moveTo(-119,0);q.bezierCurveTo(-104,105,-65,114,0,116);q.bezierCurveTo(64,115,106,99,119,0);q.closePath()},gradient(-100,0,115,110,'#b6c8ba','#5c8279'));ellipse(0,0,121,40,'#e0ddbd');ellipse(0,-3,109,31,kind==='veg'?'#8a9b67':kind==='meat'?'#af7f68':kind==='grain'?'#dbbd89':'#bb946b');path(q=>{q.moveTo(-62,-5);q.bezierCurveTo(-25,-25,15,20,67,-5)},null,'#eddbac77',3);ellipse(-44,-12,25,6,'#fff0cc25');line([[-83,49],[-72,71]],'#e1e8ce2a',4)})}
function peanut(x,y,s=1,rot=.2){save(()=>{g.translate(x,y);g.rotate(rot);g.scale(s,s);path(q=>{q.moveTo(0,-49);q.bezierCurveTo(40,-64,49,-28,31,0);q.bezierCurveTo(54,35,24,65,-2,48);q.bezierCurveTo(-37,64,-51,28,-29,0);q.bezierCurveTo(-50,-28,-28,-65,0,-49);q.closePath()},gradient(-35,-45,35,49,'#d5b17a','#98734d'),'#e2c18a',2);for(let i=-2;i<=2;i++)path(q=>{q.moveTo(-29,i*16);q.quadraticCurveTo(0,i*12+7,30,i*16)},null,'#755f4444',2);for(let i=-1;i<=1;i++)path(q=>{q.moveTo(i*16,-43);q.quadraticCurveTo(i*12-5,0,i*16,44)},null,'#755f4444',2)})}
function jar(x,y,s=1){save(()=>{g.translate(x,y);g.scale(s,s);shadow(0,115,82,14,.25);rr(-69,-78,138,190,21,gradient(-66,-60,65,95,'#b39369','#775f48'));rr(-76,-94,152,36,8,'#718e80');for(let i=0;i<10;i++)line([[-66+i*15,-89],[-66+i*15,-66]],'#c9cfaa20',2);rr(-60,-18,120,87,4,'#e5d8b7');text('花生酱',0,3,24,'#4b584c','NotoSerif',600);peanut(0,43,.35,.4);line([[-51,98],[43,98]],'#ebd5a93a',2)})}
function tabletop(){dark();stage(()=>{poly([[-452,160],[-366,85],[351,85],[446,160]],gradient(-340,80,390,250,'#96775b','#695441'));poly([[-452,160],[446,160],[446,291],[-452,291]],gradient(-400,160,400,300,'#775e48','#493f34'));for(let i=0;i<8;i++)path(q=>{q.moveTo(-427,178+i*14);q.bezierCurveTo(-120,167+i*17,90,190+i*10,430,173+i*14)},null,'#d2ae7b12',2)})}
function handbook(year,title,sub='',flip=0){
 save(()=>{g.rotate(-.025);shadow(5,201,302,22,.3);rr(-305,-203,610,398,12,'#6f8778');rr(-296,-194,592,382,8,'#baaa8c');rr(-284,-202,574,379,6,'#e9dec2');rr(-275,-210,555,378,6,gradient(-270,-210,280,168,'#f3e9cd','#d5c5a4'));line([[-234,-196],[-234,149]],'#bba38550',2);
 text(year,13,-126,79,'#725e49','NotoSerif',600);text(title,13,-25,37,'#364f4b','NotoSerif',600,464);text(sub,13,45,25,'#626b5c','NotoSans',400,465);line([[-177,99],[197,99]],'#93836a55',1.5);text('喂养建议 · 文献节点',13,129,18,'#8c8069');
 if(flip>0&&flip<1){const xx=lerp(275,-260,flip);path(q=>{q.moveTo(xx,-210);q.quadraticCurveTo(xx-100*Math.sin(flip*Math.PI),-35,xx,168);q.lineTo(280,168);q.lineTo(280,-210);q.closePath()},'#fff1d6');line([[xx,-210],[xx,168]],'#8f806540',2)}
 })
}
function monthRuler(year,k=1){
 const y=176;line([[-340,y],[340,y]],'#c2c5ab',3);for(let i=0;i<=8;i++){let x=-340+i*85;line([[x,y-8],[x,y+10]],P.muted,2);text(String(i),x,y+34,23,P.muted)}text('月龄',0,y+78,23,P.muted);
 const x4=0,x6=170;rr(-340,y-54,340,36,6,'#d88a7920');
 if(year===1974){line([[-340,y-36],[x4,y-36]],P.red,6);text('不早于4个月',-172,y-85,27,P.red)}
 if(year===1994){line([[x4,y-36],[x6,y-36]],P.gold,8);ellipse(x4,y-36,7,7,P.gold);ellipse(x6,y-36,7,7,P.gold)}
 if(year===2003){const x=lerp(0,170,k);line([[x,y-71],[x,y-15]],P.gold,3);poly([[x-10,y-22],[x+10,y-22],[x,y-9]],P.gold);text('约6个月',x,y-102,28,P.gold)}
}
function cross(x,y,s=1){line([[x-23*s,y-23*s],[x+23*s,y+23*s]],P.red,7*s);line([[x-23*s,y+23*s],[x+23*s,y-23*s]],P.red,7*s)}
function miniInfant(x,y,s=1,c='#c0a46e'){save(()=>{g.translate(x,y);g.scale(s,s);rr(-17,20,34,47,12,c);ellipse(0,0,24,28,'#d4ac8a');path(q=>{q.moveTo(-23,-5);q.quadraticCurveTo(-26,-34,3,-29);q.quadraticCurveTo(30,-26,23,-5);q.quadraticCurveTo(9,-20,-1,-14);q.quadraticCurveTo(-12,-19,-23,-5)},'#4a3830');ellipse(-8,2,2,3,'#35413b');ellipse(8,2,2,3,'#35413b');line([[-13,62],[-15,79]],c,10);line([[13,62],[15,79]],c,10)})}
function researchGroups(t){
 let move=ss(t,63.9,66.6);let tx=V?185:350;
 if(t<66.6){for(let i=0;i<6;i++){let from=(i-2.5)*73,xx=lerp(from,i%2?-tx:tx,move)+((i>>1)-1)*54*move,yy=lerp(-170,-90,move);miniInfant(xx,yy,.65)}text('随机分配',0,-261,30,P.gold);}
 else{for(let side of[-1,1]){for(let i=0;i<3;i++)miniInfant(side*tx+(i-1)*56,-110,.65);bowl(side*tx,45,.68);if(side<0)cross(side*tx,45,.75);text(side<0?'回避花生':'规律摄入花生制品',side*tx,-190,V?26:31,side<0?P.red:P.gold,'NotoSans',500,V?320:600)}text('随访至5岁',0,255,33,P.white,'NotoSerif',500)}
}
function trialChart(t){
 const hh=330,y=205,x0=-300,x1=280,top=20;
 for(let val of[0,5,10,15,20]){let yy=y-val/20*hh;line([[x0,yy],[x1+70,yy]],val===0?'#d0d2b1':'#b0c0ac25',val===0?2:1);text(val+'%',x0-55,yy,22,P.muted)}
 const grow=ss(t,71.5,73.6);let items=[[-140,13.7,'回避',P.red],[160,1.9,'摄入',P.teal]];
 for(let [x,val,lab,col] of items){let h=val/20*hh*grow;rr(x-61,y-h,122,Math.max(1,h),6,gradient(x,y-h,x+100,y,col,col+'88'));text((val*grow).toFixed(1)+'%',x,y-h-52,48,col,'NotoSerif',600);text(lab,x,y+53,30,P.white)}
 ruleLabel('5岁时的花生过敏比例',-250,P.gold,32);
}
function evaluation(t){
 const labels=['严重湿疹 / 鸡蛋过敏','医生评估','按路径引入'];
 if(V){labels.forEach((s,i)=>alpha(ss(t,79.0+i*1.6,79.6+i*1.6),()=>{let y=-220+i*180;paperPanel(0,y,650,105);text(s,0,y,34,'#364f49','NotoSans',500,600);if(i<2)text('↓',0,y+100,34,P.gold)}));chip('4—6月龄 · 高风险路径',0,320,600,P.gold)}
 else{labels.forEach((s,i)=>alpha(ss(t,79.0+i*1.6,79.6+i*1.6),()=>{let x=-510+i*510;paperPanel(x,-30,416,150);text(s,x,-30,29,'#364f49','NotoSans',500,380);if(i<2)text('→',x+254,-30,38,P.gold)}));chip('4—6月龄 · 高风险路径',0,199,500,P.gold)}
}
function servingTray(t){
 const c=V?[-255,0,255]:[-420,0,420];for(let i=0;i<3;i++){bowl(c[i],15,V?.82:1.03,['meat','veg','grain'][i]);text(['肉泥 · 富铁','蔬菜泥','谷物泥'][i],c[i],-117,V?29:31,P.white)}
 if(t>95)alpha(ss(t,95.2,96),()=>{line([[-250,213],[250,213]],'#a7bda05a',2);text('泥糊',-230,264,29,P.muted);text('→',-93,264,31,P.gold);text('碎软',30,264,29,P.muted);text('→',150,264,31,P.gold);text('随能力',285,264,29,P.gold)});
}
function safety(t){
 const k=ss(t,102.2,104.6);spoon(-60,-112,1.13,.08,k);
 alpha(phase(t,102.15,104.65),()=>{let q=((t-102.15)%.72)/.72,yy=lerp(-260,-131,clamp(q));save(()=>{g.translate(-100,yy);g.scale(.55,.65);path(z=>{z.moveTo(0,-28);z.quadraticCurveTo(-27,0,0,23);z.quadraticCurveTo(27,0,0,-28)},'#9fc4be')})});
 if(t>104.6){let x=V?195:360;peanut(-x,167,.95);spoon(x+25,167,.57,-.2,0);cross(-x,167,1.2);cross(x,167,1.2);text('整颗花生',-x,269,28,P.red);text('成坨浓酱',x,269,28,P.red)}
}
function ending(t){dark();const x=V?500:W/2;tracked('陪伴 · 理解 · 成长',x,V?578:270,V?22:21,P.muted,6);text('关注不焦虑爸爸',x,V?872:485,V?69:80,P.gold,'NotoSerif',600,V?850:1600);line([[x-(V?200:265),V?960:576],[x+(V?200:265),V?960:576]],'#d7bd8240',1.5);text('陪孩子长大，也陪自己成长',x,V?1060:683,V?33:34,P.white,'NotoSans',400,V?830:1600);breathe(t,V?1200:795)}
function references(t,lines){dark();const x=V?500:960;tracked('文献线索 · 完整链接随包',x,V?320:182,V?22:19,P.muted,4);text(EP.title,x,V?500:292,V?79:75,P.gold,'NotoSerif',500);lines.forEach((s,i)=>text(s,x,(V?725:442)+i*(V?108:81),V?27:27,i%2?P.muted:P.white,'NotoSans',400,V?825:1700));text('结构、比例与过程均为简化示意',x,V?1320:894,V?24:22,P.muted)}
function titleCard(t,motif){dark();const x=V?500:960;alpha(ss(t,10.8,11.7),()=>{tracked(EP.en,x,V?565:260,V?20:24,P.muted,V?3:6);text(EP.title,x,V?790:454,V?113:131,P.gold,'NotoSerif',600,V?850:1600);text(EP.topic,x,V?1086:744,V?33:34,P.white,'NotoSans',400,V?840:1600);text(EP.no+' · Vibe知识大赏',x,V?1170:817,V?23:24,P.muted)});alpha(ss(t,11.3,12.5),()=>stage(motif,V?.40:.38,V?-12:68))}
