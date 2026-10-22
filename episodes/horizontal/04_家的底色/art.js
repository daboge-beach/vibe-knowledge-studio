/* Bespoke illustration assets, drawn as objects rather than labelled symbols. */
function skin(x,y,r){return gradient(x-r,y-r,x+r,y+r,'#e7ba97','#c99374')}
function hand(x,y,r=9,palm=false,angle=null,mirror=1){
 if(angle!==null){save(()=>{g.translate(x,y);g.rotate(angle);g.scale(mirror,1);hand(0,0,r,palm);if(!palm)ellipse(-r*.73,r*.32,r*.39,r*.59,'#d5a582')});return}
 ellipse(x,y,r,r*1.20,skin(x,y,r));const open=typeof palm==='number'?clamp(palm):(palm?1:0);
 if(open){for(let i=0;i<4;i++)line([[x-r*.6+i*r*.4,y-r*.2],[x-r*.65+i*r*.42,y-r*lerp(.2,1.6+i%2*.15,open)]],'#ddb08a',r*.32);ellipse(x-r*.9,y+1,r*.38,r*.62,'#ddb08a')}
}
function sleeve(points,c,width=20){line(points,'#243c3c',width+2);line(points,c,width);line(points.map(([x,y])=>[x+1.5,y-1]),'#ffffff11',width*.22)}
function wristHand(ex,ey,hx,hy,c,width=21,r=9,palm=0,mirror=1){
 const d=Math.hypot(hx-ex,hy-ey)||1,ux=(hx-ex)/d,uy=(hy-ey)/d,wx=hx-ux*11,wy=hy-uy*11;
 line([[wx-uy*width*.39,wy+ux*width*.39],[wx+uy*width*.39,wy-ux*width*.39]],'#dddac240',1.4);
 hand(hx,hy,r,palm,Math.atan2(hy-ey,hx-ex)+Math.PI/2,mirror);
}
function tableArm(sx,sy,ex,ey,hx,hy,c,width=21,palm=0,mirror=1){sleeve([[sx,sy],[ex,ey],[hx,hy]],c,width);wristHand(ex,ey,hx,hy,c,width,9,palm,mirror)}
function arm(sx,sy,hx,hy,c,width=20,bend=1,elbow=null){
 const dx=hx-sx,dy=hy-sy,d=Math.hypot(dx,dy)||1,max=132;
 if(d>max){hx=sx+dx/d*max;hy=sy+dy/d*max}
 const D=Math.hypot(hx-sx,hy-sy)||1,offset=Math.sqrt(Math.max(10,68*68-D*D/4))*.65;
 const mx=elbow?elbow[0]:(sx+hx)/2-(hy-sy)/D*offset*bend,my=elbow?elbow[1]:(sy+hy)/2+(hx-sx)/D*offset*bend;
 sleeve([[sx,sy],[mx,my],[hx,hy]],c,width);return{hx,hy,ex:mx,ey:my};
}
function person(x,y,s=1,o={}){save(()=>{g.translate(x,y);g.scale(s,s);g.rotate(o.lean||0);
 const child=!!o.child,seated=!!o.seated,kneel=!!o.kneel,mom=o.role==='mom',mood=o.mood||0,look=o.look||0,t=o.t||0;
 const hy=child?-208:seated?-225:kneel?-238:-324,top=hy+57,hip=child?-63:seated?-55:kneel?-60:-110;
 const shirt=child?'#cfa767':mom?'#9ba89a':'#678792',trousers=child?'#65766b':mom?'#4d6964':'#394f58';
 ellipse(0,6,child?53:75,11,'#0a151b40');
 if(seated||kneel){line([[-23,hip],[-62,-24],[-50,1]],trousers,child?23:30);line([[24,hip],[73,-33],[65,0]],trousers,child?23:30)}else{line([[-23,hip],[-24,-49],[-33,0]],trousers,child?24:33);line([[24,hip],[30,-48],[43,0]],trousers,child?24:33)}
 ellipse(seated||kneel?-51:-34,2,child?25:33,10,'#d4c4a0');ellipse(seated||kneel?67:46,2,child?25:34,10,'#b8bba3');line([[seated||kneel?-72:-58,8],[seated||kneel?-30:-12,8]],'#333b38',3);line([[seated||kneel?44:23,8],[seated||kneel?88:71,8]],'#333b38',3);
 path(k=>{k.moveTo(-32,top);k.bezierCurveTo(-54,top+12,-58,hip-35,-53,hip);k.quadraticCurveTo(0,hip+14,53,hip);k.bezierCurveTo(53,hip-45,51,top+12,31,top);k.closePath()},gradient(-40,top,55,hip,shirt,child?'#b78b52':mom?'#748d80':'#4d6b77'));
 line([[0,top+15],[0,hip-5]],'#f5edce25',1.2);for(let i=0;i<3;i++)ellipse(5,top+34+i*23,1.4,1.4,'#d3d5bd70');
 path(k=>{k.moveTo(-19,top+3);k.lineTo(-8,top+20);k.lineTo(1,top+8);k.lineTo(12,top+20);k.lineTo(23,top+3)},null,'#233e3c55',2);
 rr(-13,hy+29,27,39,9,'#c89473');
 // Face and hair have separate planes; look and eyebrows carry the emotional action.
 save(()=>{g.translate(look*3,hy);g.rotate((o.headTilt||0)+(mood*.025*look));const r=child?44:40;
 ellipse(0,0,r,r+7,skin(0,0,r));ellipse(-r+1,8,6,12,'#ce9b7b');ellipse(r-1,8,6,12,'#ca9476');
 if(child){
  // A separate, fuller short haircut covers the entire crown, including head tilts.
  path(k=>{k.moveTo(-45,5);k.bezierCurveTo(-53,-18,-47,-48,-29,-58);k.bezierCurveTo(-15,-68,8,-66,22,-59);k.quadraticCurveTo(31,-65,38,-59);k.quadraticCurveTo(39,-54,34,-49);k.bezierCurveTo(52,-43,53,-16,44,5);k.lineTo(36,-8);k.quadraticCurveTo(35,-17,30,-23);k.quadraticCurveTo(22,-16,13,-20);k.quadraticCurveTo(6,-21,1,-25);k.quadraticCurveTo(-12,-12,-23,-19);k.quadraticCurveTo(-31,-19,-35,-9);k.lineTo(-40,3);k.closePath()},gradient(-31,-61,38,4,'#514037','#30292b'));
  path(k=>{k.moveTo(-33,-36);k.quadraticCurveTo(-20,-53,-4,-50);k.moveTo(-14,-43);k.quadraticCurveTo(-1,-55,12,-49)},null,'#9a75502d',1.6);
 }
 else if(mom){ellipse(31,-34,22,27,'#3b3030');path(k=>{k.moveTo(-42,8);k.bezierCurveTo(-54,-35,-17,-66,18,-45);k.bezierCurveTo(58,-42,52,-9,40,14);k.lineTo(31,-22);k.quadraticCurveTo(9,-7,-8,-25);k.quadraticCurveTo(-30,-24,-42,8)},gradient(-30,-50,35,5,'#55413a','#302b2d'))}
 else{path(k=>{k.moveTo(-r,0);k.bezierCurveTo(-r-9,-42,-15,-58,13,-45);k.lineTo(28,-53);k.lineTo(29,-40);k.bezierCurveTo(55,-37,49,-9,r,0);k.lineTo(31,-21);k.quadraticCurveTo(8,-11,-9,-25);k.quadraticCurveTo(-25,-19,-r,0)},gradient(-30,-45,40,0,'#51413a','#2d292b'))}
 const blink=Math.cos(t*.81+1.8)>.996;
 for(let q of[-1,1]){const ex=q*16+look*2,ey=4;if(blink){line([[ex-6,ey],[ex+6,ey]],'#4d3c32',2)}else{ellipse(ex,ey,6.7,4.8,'#f5e6cc');ellipse(ex+look*1.9,ey+.2,2.6,3.9,'#394747');ellipse(ex+look*1.9+.7,ey-1.2,.8,1,'#fff6dd')}
 line([[q*16-7,ey-13-q*mood*3],[q*16+6,ey-14+q*mood*4]],'#604337',2.5)}
 path(k=>{k.moveTo(look*2,8);k.lineTo(look*2-2,16);k.lineTo(look*2+4,17)},null,'#b88267',1.8);
 path(k=>{k.moveTo(-8,27);k.quadraticCurveTo(0,27+(o.smile?5:mood>.5?-3:0),8,27)},null,'#855a4c',2.1);
 ellipse(-26,19,8,4,'#b8796844');ellipse(26,19,8,4,'#b8796844');
 if(!child&&!mom)alpha(.12,()=>{path(k=>{k.moveTo(-27,24);k.quadraticCurveTo(0,55,29,22);k.quadraticCurveTo(10,52,-8,47);k.closePath()},'#66504a')});
 });
 const sy=top+25,defL=[-54,sy+85],defR=[56,sy+83];
 let L=o.left||defL,R=o.right||defR;
 if(child){L=o.left||[-46,sy+60];R=o.right||[48,sy+60]}
 const lh=arm(-36,sy,...L,shirt,child?15:21,-1,o.leftElbow||(child?null:[-59,sy+57])),rh=arm(36,sy,...R,shirt,child?15:21,1,o.rightElbow||(child?null:[59,sy+57]));
 if(child){hand(lh.hx,lh.hy,7,o.palm==='left');hand(rh.hx,rh.hy,7,o.palm==='right')}
 else{const open=o.palmOpen===undefined?1:o.palmOpen;wristHand(lh.ex,lh.ey,lh.hx,lh.hy,shirt,21,9,o.palm==='left'?open:0,-1);wristHand(rh.ex,rh.ey,rh.hx,rh.hy,shirt,21,9,o.palm==='right'?open:0,1)}
})}
function book(x,y,w,h,c,rot=0){save(()=>{g.translate(x,y);g.rotate(rot);rr(0,0,w,h,3,c);rr(w-5,3,5,h-6,2,'#b9ad8d');line([[6,5],[w-9,5]],'#ffffff25',1)})}
function plant(x,y,s=1){save(()=>{g.translate(x,y);g.scale(s,s);path(k=>{k.moveTo(-22,0);k.lineTo(23,0);k.lineTo(16,38);k.quadraticCurveTo(0,45,-16,38);k.closePath()},'#a98a6c');for(let i=0;i<6;i++){const xx=(i%2?1:-1)*(23+i*2),yy=-17-i*10;line([[0,2],[xx*.4,yy]],'#637b64',3);save(()=>{g.translate(xx*.55,yy-4);g.rotate((i%2?1:-1)*.7);ellipse(0,0,10,23,i%2?'#8eab88':'#6d8c7b')})}})}
function room(t,warm=.4){g.fillStyle=gradient(0,0,W,H,'#1c3035',warm>.6?'#4b4d40':'#34454a');g.fillRect(0,0,W,H);
 const horizon=V?1220:773;g.fillStyle=gradient(0,horizon,0,H,'#795e4a','#253333');g.fillRect(0,horizon,W,H-horizon);line([[0,horizon],[W,horizon]],'#bdad8f40',2);
 // Perspective floorboards and a low baseboard supply depth without distracting motion.
 alpha(.11,()=>{for(let i=-3;i<12;i++)line([[W*.5+(i-4)*90,horizon],[W*.5+(i-4)*480,H]],'#dfc09c',2);for(let y=horizon+40;y<H;y+=110)line([[0,y],[W,y]],'#c9a986',1)});
 world(()=>{
  // Window, moon/sky, curtain folds and a broad directional wash of window light.
  rr(-525,-405,255,370,112,'#789a9c55');g.fillStyle=gradient(-500,-390,-290,-30,'#6d969c','#acc2ab');g.beginPath();g.roundRect(-513,-394,230,344,104);g.fill();ellipse(-352,-290,35,35,'#dbd3ab');
  line([[-400,-388],[-400,-55]],'#233d42',9);line([[-507,-203],[-290,-203]],'#233d42',8);
  for(let i=0;i<4;i++)line([[-545+i*9,-409],[-555+i*8,-19]],'#647772',4);
  poly([[-285,-50],[-400,-50],[320,240],[550,240]],'#d5ce9e08');
  // Framed family photograph remains a recognisable household object.
  rr(335,-280,112,139,4,'#243a3d');rr(343,-272,96,123,2,'#bcae8c');familyDrawing(391,-207,.49,1);
  // Cabinet and sofa.
  rr(-500,37,185,170,7,'#3c5150');rr(-509,28,203,15,4,'#9a8265');line([[-410,48],[-410,188]],'#192d30',2);ellipse(-424,118,3,3,'#ccb487');ellipse(-395,118,3,3,'#ccb487');plant(-443,24,.68);
  for(let i=0;i<4;i++)book(-387+i*14,-35,12,59,['#b7a781','#7d9a91','#ad8069','#798e94'][i]);
  rr(177,42,327,130,33,'#526963');rr(166,100,349,82,28,'#4b625e');rr(165,125,35,78,15,'#60776b');rr(484,125,35,78,15,'#60776b');rr(208,76,119,75,18,'#7e8d78');rr(350,76,115,75,18,'#7b8a76');line([[329,102],[329,169]],'#314d48',2);rr(204,176,17,33,3,'#263b38');rr(466,176,17,33,3,'#263b38');
  // Floor lamp with a soft cone and a suspended shade.
  line([[534,-202],[534,190]],'#8f9275',5);ellipse(534,195,49,9,'#263c3b');poly([[489,-217],[578,-217],[603,-152],[464,-152]],'#cdbf94');ellipse(534,-153,69,10,'#e8dab0');poly([[480,-145],[590,-145],[700,224],[353,224]],'#edd5a30b');
 },1,V?75:0,0);
 glow(W*(V?.56:.61),H*.55,H*.40,warm>.6?'#dcc789':'#719a99',warm>.6?.12:.09);
}
function chair(x,y,s=1){save(()=>{g.translate(x,y);g.scale(s,s);rr(-56,-124,111,110,19,'#735d46');rr(-48,-116,95,96,15,'#9c805c');line([[-42,-20],[-48,27]],'#554936',10);line([[44,-20],[49,27]],'#554936',10);rr(-66,-28,134,21,8,'#917550')})}
function familyDrawing(x,y,s=1,progress=1){save(()=>{g.translate(x,y);g.scale(s,s);const people=[[-56,-6,'#8a9e9a',36], [0,14,'#c79c61',23], [55,-4,'#819aa5',37]];people.forEach(([xx,yy,c,h],i)=>{alpha(ss(progress, i*.12,i*.12+.2),()=>{line([[xx,yy+5],[xx,yy+h]],c,4);line([[xx,yy+h],[xx-12,yy+h+17]],c,3);line([[xx,yy+h],[xx+13,yy+h+17]],c,3);path(k=>k.arc(xx,yy-7,12,0,Math.PI*2),null,'#8d7053',3);line([[xx-4,yy-6],[xx-3,yy-6]],'#705846',2);line([[xx+4,yy-6],[xx+5,yy-6]],'#705846',2);path(k=>{k.moveTo(xx-4,yy);k.quadraticCurveTo(xx,yy+4,xx+5,yy)},null,'#a37557',2)})});
 line([[-56,17],[-21,33]],'#9b8f6d',3);line([[55,19],[21,33]],'#9b8f6d',3);
 const k=ss(progress,.55,1);line([[-21,33],[lerp(-21,-9,k),lerp(33,33,k)]],'#bcaa73',3);if(progress>.88)line([[21,33],[lerp(21,9,ss(progress,.88,1)),33]],'#bcaa73',3);
 alpha(.75,()=>{line([[-92,70],[92,70]],'#bfa58a',1);path(k=>{k.moveTo(-84,-41);k.quadraticCurveTo(2,-106,87,-42)},null,'#bba173',2)})
})}
function desk(x=0,y=163,progress=.83){save(()=>{g.translate(x,y);ellipse(5,69,312,34,'#071b1a38');poly([[-288,-23],[-225,-78],[229,-78],[291,-23]],gradient(-200,-70,250,0,'#aa8862','#75563d'));poly([[-288,-23],[291,-23],[291,2],[-288,2]],'#795639');line([[-250,0],[-240,103]],'#4d4135',15);line([[252,0],[248,101]],'#544638',15);for(let i=0;i<5;i++)line([[-231+i*24,-65],[223+i*9,-32]],'#e9cca411',1);
 // A tapered sheet, its thickness and one curled edge.
 poly([[-108,-70],[158,-70],[184,-31],[-126,-31]],'#25373255');poly([[-111,-76],[153,-76],[178,-36],[-129,-36]],P.paper);poly([[153,-76],[178,-36],[158,-45]],'#fff0d3');
 save(()=>{g.beginPath();g.moveTo(-111,-76);g.lineTo(153,-76);g.lineTo(178,-36);g.lineTo(-129,-36);g.closePath();g.clip();g.translate(22,-55);g.scale(.75,.25);familyDrawing(0,0,1,progress)});
 for(let i=0;i<3;i++)pencil(-183+i*17,-47+i*2,47,['#bf8b6c','#749995','#c4aa68'][i],-.35+i*.12);
})}
function pencil(x,y,len=58,c='#c6a35d',rot=-.4){save(()=>{g.translate(x,y);g.rotate(rot);rr(-len/2,-3,len-7,6,1,c);poly([[len/2-7,-3],[len/2+4,0],[len/2-7,3]],'#e3c7a1');poly([[len/2+1,-.8],[len/2+4,0],[len/2+1,.8]],'#3c443d');line([[-len/2,-2],[len/2-8,-2]],'#f4dca24a',1)})}
function childAtDesk(t,stopped=true,complete=.8){
 chair(-91,231,.85);person(-80,228,1,{child:true,seated:true,t,mood:stopped?.70:.08,look:stopped?.72:0,headTilt:stopped?.05:.11,left:[-34,-93],right:[83,-81]});
 desk(0,175,complete);
 // Forearms lie on top of the desk, so hands visibly meet the paper and pencil.
 let dx=stopped?0:Math.sin(t*2.2)*12,dy=stopped?0:Math.cos(t*2.2)*1.7;
 line([[-116,104],[-112,131],[-83,144]],'#b78e52',15);hand(-83,144,7);
 line([[-44,104],[-18,120],[5+dx,137+dy]],'#c7a364',15);hand(5+dx,137+dy,8);
 pencil(24+dx,141+dy,53,'#c6a35d',.20);
}
function calendar(x,y,s=1,arrange=0){save(()=>{g.translate(x,y);g.scale(s,s);ellipse(0,66,133,14,'#11252a40');rr(-136,-74,272,145,12,'#ddd3b9');rr(-136,-74,272,30,12,'#7e9b92');rr(-136,-55,272,13,0,'#7e9b92');for(let i=0;i<5;i++){rr(-103+i*51,-85,7,24,4,'#cabd98')};text('一起安排明天',0,-59,18,'#eff1db','NotoSans',500);for(let i=0;i<4;i++)line([[-112+i*75,-29],[-112+i*75,53]],'#a9ac983f',1);line([[-112,11],[112,11]],'#a9ac983f',1);const k=ss(arrange,0,1);rr(lerp(-92,-90,k),lerp(-21,8,k),83,34,4,'#c6af7d');rr(lerp(22,5,k),lerp(17,8,k),90,34,4,'#9eb8a4');text('接孩子',lerp(-50,-49,k),lerp(-4,25,k),19,'#3e514a','NotoSans',500);text('休息',lerp(67,50,k),lerp(34,25,k),19,'#334f46','NotoSans',500)})}
function bag(x,y,s=1){save(()=>{g.translate(x,y);g.scale(s,s);path(k=>{k.moveTo(-20,-55);k.bezierCurveTo(-20,-93,22,-93,22,-55)},null,'#bea47b',9);rr(-45,-61,91,109,20,gradient(-45,-65,45,47,'#ba9b65','#8c734e'));rr(-30,-5,60,40,10,'#ccb585');line([[-29,6],[28,6]],'#856b49',2);rr(-6,-42,13,14,3,'#dcc49a')})}
