/* Original film. Method reference: Dave-cc/vibe-knowledge-film (MIT).
   Every frame is a pure function of time. No source-footage or reference-shot reuse.
   Emotional clouds / breathing lines are metaphors, not measurements. */
'use strict';
const MODE=new URLSearchParams(location.search).get('mode')||'horizontal';
const V=MODE==='vertical', W=V?1080:1920, H=V?1920:1080, END=130, FPS=60, SCALE=4/3;
const canvas=document.getElementById('c');canvas.width=W*SCALE;canvas.height=H*SCALE;
const g=canvas.getContext('2d',{alpha:false});
const P={ink:'#171615',wall:'#35332e',paper:'#fff3df',gold:'#edc883',muted:'#b6a897',red:'#eb8069',green:'#91b7a6',skin:'#d6a477',hair:'#3b2920',shirt:'#dfa966',blue:'#7f9e9d'};
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x)),lerp=(a,b,k)=>a+(b-a)*k;
const ease=x=>{x=clamp(x);return x*x*(3-2*x)},ss=(t,a,b)=>ease((t-a)/(b-a));
const phase=(t,a,b)=>ss(t,a,a+.65)*(1-ss(t,b-.65,b));
const mix=(a,b,k)=>{const A=a.match(/\w\w/g).map(x=>parseInt(x,16)),B=b.match(/\w\w/g).map(x=>parseInt(x,16));return '#'+A.map((x,i)=>Math.round(lerp(x,B[i],k)).toString(16).padStart(2,'0')).join('')};
function save(fn){g.save();fn();g.restore()}
function alpha(a,fn){if(a<=0)return;save(()=>{g.globalAlpha*=a;fn()})}
function ellipse(x,y,rx,ry,c){g.fillStyle=c;g.beginPath();g.ellipse(x,y,rx,ry,0,0,Math.PI*2);g.fill()}
function rect(x,y,w,h,r,c){g.fillStyle=c;g.beginPath();g.roundRect(x,y,w,h,r);g.fill()}
function path(p,c){g.fillStyle=c;g.beginPath();p(g);g.fill()}
function line(points,c,width=3){g.strokeStyle=c;g.lineWidth=width;g.lineCap='round';g.lineJoin='round';g.beginPath();points.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));g.stroke()}
function text(str,x,y,size=40,c=P.paper,family='NotoSans',weight=400,align='center',max){g.fillStyle=c;g.font=`${weight} ${size}px ${family}`;g.textAlign=align;g.textBaseline='middle';if(max&&g.measureText(str).width>max)g.font=`${weight} ${size*max/g.measureText(str).width}px ${family}`;g.fillText(str,x,y)}
function tracked(str,x,y,size,c,spacing=5){g.font=`400 ${size}px NotoSans`;const chars=[...str],width=chars.reduce((a,ch)=>a+g.measureText(ch).width,0)+spacing*(chars.length-1);let xx=x-width/2;for(const ch of chars){const w=g.measureText(ch).width;text(ch,xx+w/2,y,size,c);xx+=w+spacing}}
function bloom(x,y,r,c,a=.14){const z=g.createRadialGradient(x,y,0,x,y,r);z.addColorStop(0,c);z.addColorStop(1,c+'00');alpha(a,()=>{g.fillStyle=z;g.fillRect(x-r,y-r,r*2,r*2)})}
const SUBS=[
 [.65,3.9,'积木倒了，孩子也崩溃了。'],[4.25,7.9,'你说“再搭一次”，他却哭得更凶。'],[8.4,11.8,'这时候，道理该从哪里进去？'],
 [19.7,23.7,'小小的孩子，还在学怎么停下来。'],[24.4,28.7,'情绪一上来，长句子更难听进去。'],[29.4,33.7,'先让他缓下来，才有余地想办法。'],
 [42.6,46.7,'先把自己的声音放低。'],[47.3,51.8,'蹲下来，少说一点，留在附近。'],[52.5,56.8,'“我在这里。”'],
 [60.5,64.8,'“积木倒了，你很失望。”'],[65.3,69.8,'“可以难过，不能朝人扔积木。”'],[70.4,74.8,'把会伤人的东西，先移开。'],[75.3,78.7,'接住情绪，也守住边界。'],
 [79.5,83.8,'“想抱抱，还是让我坐旁边？”'],[84.3,88.8,'他不想被碰，就留一点空间。'],
 [99.5,103.8,'等他缓过来，再问“怎么搭更稳？”'],[104.4,108.8,'让他试一次，你在旁边帮一点。'],[114.1,118.8,'这份平静，会在一次次陪伴里练出来。']
];
function caption(t){for(const[a,b,s]of SUBS){if(t<a||t>b)continue;alpha(phase(t,a,b),()=>{const size=V?50:46,y=V?1495:947;g.shadowColor='#000b';g.shadowBlur=15;g.shadowOffsetY=3;if(V&&[...s].length>17){let cut=Math.ceil(s.length/2),p=s.indexOf('，');if(p>4&&p<18)cut=p+1;const arr=[s.slice(0,cut),s.slice(cut)];arr.forEach((str,i)=>text(str,500,y+(i-.5)*78,size,P.paper,'NotoSans',500,'center',850))}else text(s,V?500:960,y,size,P.paper,'NotoSans',500,'center',V?850:1650)})}}
function header(no,zh,en){const x=V?100:130,y=V?230:63;text(no,x,y,V?26:22,P.gold,'NotoSans',500,'left');line([[x+58,y],[x+(V?810:1660),y]],'#e8c68c30',1);tracked(en,V?500:960,V?317:111,V?21:18,P.muted,4);text(zh,V?500:960,V?415:177,V?61:51,P.paper,'NotoSerif',500,'center',V?850:1600)}
// The same domestic room is the visual anchor throughout the film.
function room(t,warm=.2){const z=g.createLinearGradient(0,0,0,H);z.addColorStop(0,mix('#242a28','#3a2e27',warm));z.addColorStop(.68,mix('#46453c','#68503c',warm));z.addColorStop(1,'#1c211f');g.fillStyle=z;g.fillRect(0,0,W,H);
 const floor=V?1200:767;const f=g.createLinearGradient(0,floor,0,H);f.addColorStop(0,'#594437');f.addColorStop(1,'#252a25');g.fillStyle=f;g.fillRect(0,floor,W,H-floor);
 line([[0,floor],[W,floor]],'#cab49225',2);
 // window and its soft light; fixed geometry ensures no frame-to-frame random flicker
 alpha(.5,()=>{const x=V?760:1490,y=V?620:310,ww=V?240:255,hh=V?360:325;bloom(x+80,y+160,440,'#dac79e',.28);rect(x,y,ww,hh,120,'#a4afa57a');g.fillStyle='#36463f';g.fillRect(x+ww*.48,y,8,hh);g.fillRect(x,y+hh*.56,ww,8);ellipse(x+ww*.73,y+hh*.25,37,37,'#d1c7a0')});
 // low sideboard and a few recognisable books
 alpha(V?.35:.55,()=>{let x=V?-90:110,y=V?920:625;rect(x,y,260,150,10,'#282d28');for(let i=0;i<6;i++)rect(x+28+i*28,y+25+(i%2)*6,21,75-(i%2)*6,2,['#9a755b','#7f9787','#b8a582'][i%3]);rect(x-5,y-6,270,12,4,'#81745b')});
 // front vignette
 const v=g.createRadialGradient(W*.46,H*.46,W*.18,W*.5,H*.5,H*.78);v.addColorStop(0,'#0000');v.addColorStop(.7,'#080b0818');v.addColorStop(1,'#080807b8');g.fillStyle=v;g.fillRect(0,0,W,H);
}
const stage={x:V?500:960,y:V?1005:565,s:V?.87:1.10};
function inStage(fn,zoom=1,dx=0,dy=0){save(()=>{g.translate(stage.x+dx,stage.y+dy-(V?0:(zoom-1)*200*stage.s));g.scale(stage.s*zoom,stage.s*zoom);fn()})}
function rug(){ellipse(-15,V?240:214,570,V?114:43,'#1e251d66');ellipse(-15,V?229:210,540,V?102:42,'#7e826958');ellipse(-15,V?229:210,493,V?86:35,'#a4a08a20');for(let i=0;i<9;i++)alpha(.09,()=>line([[-415+i*98,V?187:193],[-435+i*102,V?268:231]],'#f1dfb9',2))}
function block(x,y,s=1,rot=0,c=P.gold,wide=false){save(()=>{g.translate(x,y);g.rotate(rot);g.scale(s,s);let w=wide?100:64;ellipse(4,36,w*.6,9,'#131a1640');rect(-w/2,-32,w,64,7,c);path(k=>{k.moveTo(-w/2,-32);k.lineTo(-w/2+12,-43);k.lineTo(w/2+12,-43);k.lineTo(w/2,-32);k.closePath()},mix(c,'#fff3d8',.22));path(k=>{k.moveTo(w/2,-32);k.lineTo(w/2+12,-43);k.lineTo(w/2+12,21);k.lineTo(w/2,32);k.closePath()},mix(c,'#362a22',.24));alpha(.15,()=>{for(let i=0;i<3;i++)line([[-w/2+9,-16+i*17],[w/2-9,-19+i*17]],'#fff4cf',1)});rect(-w/2+7,-26,w-14,4,2,'#fff0c022')})}
const blocks=[[-340,184,0,P.gold],[-340,117,.01,P.blue],[-340,50,-.01,P.red],[-340,-17,.01,P.gold],[-340,-84,0,P.green]];
const scatter=[[-403,205,-.18],[-318,211,.21],[-432,135,-.45],[-254,192,.4],[-362,133,.16]];
function tower(fall=0,rebuild=0,t=0){blocks.forEach((b,i)=>{let k=ss(fall,Math.max(0,.05*i),Math.min(1,.60+.1*i)),xx=lerp(b[0],scatter[i][0],k),yy=lerp(b[1],scatter[i][1],k)-Math.sin(k*Math.PI)*(i*28+20),r=lerp(b[2],scatter[i][2],k);if(rebuild>0){let q=ss(rebuild,i*.16,i*.16+.29);xx=lerp(scatter[i][0],b[0],q);yy=lerp(scatter[i][1],b[1],q)-Math.sin(q*Math.PI)*80;r=lerp(scatter[i][2],b[2],q)}block(xx,yy,1,r,b[3],i===0)})}
function basket(x,y,a=1){alpha(a,()=>{ellipse(x,y+45,110,23,'#13201b55');path(k=>{k.moveTo(x-94,y-34);k.lineTo(x+94,y-34);k.lineTo(x+76,y+44);k.quadraticCurveTo(x,y+60,x-76,y+44);k.closePath()},'#96764e');for(let i=0;i<8;i++)line([[x-80+i*22,y-30],[x-65+i*18,y+44]],'#c3a16b66',3);for(let i=0;i<4;i++)line([[x-86+i*3,y-15+i*17],[x+86-i*3,y-15+i*17]],'#3e342955',3);ellipse(x,y-34,95,15,'#bc9b69');ellipse(x,y-35,79,8,'#564b35')})}
function cloud(x,y,k,t){if(k<.01)return;alpha(k*.75,()=>{save(()=>{g.translate(x,y);const s=.6+k*.65;g.scale(s,s);for(let i=0;i<6;i++)ellipse((i-2.5)*30,Math.sin(i*2.1)*13,40,29,mix('#7a5a4e',P.red,.35));line([[-15,16],[0,32],[-11,43],[13,59]],P.red,6);for(let j=0;j<2;j++){const yy=42+(t*26+j*30)%70;alpha(1-(yy-42)/70,()=>line([[-53+j*97,yy],[-56+j*97,yy+12]],'#e7baaa',3))}})})}
// Person made of simple but recognisable shapes: hands, hair, clothing, shoes, face.
// crouch moves the parent's eye-line down; arms are two-segment paths, not floating icons.
function person(x,floor,{adult=false,crouch=0,mood=0,t=0,arm=0,reach=0,look=-1,space=0}={}){save(()=>{g.translate(x,floor);const height=adult?lerp(490,305,crouch):270,headY=-height+52,headR=adult?50:48,bodyTop=headY+50,hip=-75,shirt=adult?P.blue:P.shirt;ellipse(0,4,adult?91:66,15,'#111a1644');
 // trousers / knees / shoes
 if(adult){const c=crouch;line([[-23,hip],[-30-40*c,-34],[(-30-40*c)+38*c,-8]],'#283936',36);line([[29,hip],[31+45*c,-41],[48+30*c,-6]],'#34473f',36);ellipse(-32-2*c,-2,36,11,'#1b2420');ellipse(52+29*c,1,35,11,'#1b2420')}else{line([[-25,-69],[-44,-30],[-55,-8]],'#756b50',29);line([[22,-69],[46,-35],[63,-8]],'#6e644a',29);ellipse(-60,0,30,12,'#c8b58e');ellipse(67,0,29,12,'#c8b58e')}
 path(k=>{k.moveTo(-33,bodyTop);k.quadraticCurveTo(-64,bodyTop+23,-56,hip);k.quadraticCurveTo(0,hip+24,59,hip);k.quadraticCurveTo(59,bodyTop+20,34,bodyTop);k.closePath()},shirt);
 line([[3,bodyTop+15],[5,hip-7]],mix(shirt,'#fff6da',.15),2);
 // neck and head, a slight downwards tilt as child cries
 rect(-16,headY+35,34,32,10,P.skin);const shake=mood>.7?Math.sin(t*7)*1.6:0;save(()=>{g.translate(shake,headY);g.rotate((adult?-.06*look:.07*look)*mood);ellipse(0,0,headR,headR+5,P.skin);ellipse(look*46,6,8,14,'#cc986f');
 path(k=>{k.moveTo(-49,3);k.bezierCurveTo(-63,-48,-15,-69,24,-49);k.bezierCurveTo(62,-36,55,-7,47,0);k.lineTo(38,-23);k.quadraticCurveTo(6,-11,-14,-29);k.quadraticCurveTo(-28,-23,-49,3)},P.hair);
 // adult bun
 if(adult)ellipse(36,-43,23,24,P.hair);
 const eyeY=4;for(let q of[-1,1]){if(mood>.55){line([[q*21-7,eyeY-2],[q*21,eyeY-5],[q*21+7,eyeY]],'#493529',3)}else ellipse(q*19,eyeY,3.4,4,'#493529');line([[q*19-7,eyeY-15],[q*19+7,eyeY-16+q*mood*5]],'#684730',2.7)}
 g.strokeStyle='#87543d';g.lineWidth=2.6;g.beginPath();g.moveTo(-10,25);g.quadraticCurveTo(0,25+(adult?(mood>.5?-5:mood>.1?1:5):(mood>.5?-9:9)),10,25);g.stroke();ellipse(-28,19,9,4,'#bb735755');ellipse(28,19,9,4,'#bb735755');
 if(!adult&&mood>.30){for(const q of[-1,1]){const u=(t*.55+(q===1?.4:0))%1;alpha(mood*(1-u),()=>{ellipse(q*27,17+u*43,4,8,'#d3e5d9')})}}
 });
 // arms: open palms and hand boundary, changes visibly at the subtitle
 let sy=bodyTop+33;const raised=!adult&&arm>0;let left=[-65-reach*65,sy+68-reach*28],right=[68+arm*65,sy+70-arm*145];if(!adult&&mood>.7){left=[-34,headY+40];right=[35,headY+43-arm*65]}
 if(adult&&reach>0){left=[-85-reach*75,sy+60-reach*190]}
 if(!adult&&reach>0){left=[-65-reach*95,sy+68-reach*100]}
 line([[-42,sy],[-62,sy+36],left],shirt,adult?29:22);line([[42,sy],[64+arm*27,sy+35-arm*50],right],shirt,adult?29:22);ellipse(left[0],left[1],adult?14:11,adult?17:13,P.skin);ellipse(right[0],right[1],adult?14:11,adult?17:13,P.skin);
 if(adult&&reach>.6){for(let i=0;i<4;i++)line([[left[0]-7+i*5,left[1]-3],[left[0]-9+i*5,left[1]-23]],P.skin,4)}
})}
function speech(s,x,y,appear=1,{red=false,max=390}={}){alpha(appear,()=>{g.font='500 29px NotoSans';let w=Math.min(max,g.measureText(s).width+60),h=67;rect(x-w/2,y-h/2,w,h,17,red?'#6d5145':'#a4aa8e');path(k=>{k.moveTo(x-15,y+h/2-1);k.lineTo(x-33,y+h/2+21);k.lineTo(x+6,y+h/2-1);k.closePath()},red?'#6d5145':'#a4aa8e');text(s,x,y,29,red?'#f3ddca':'#25372f','NotoSans',500,'center',w-28)})}
function roomScene(t,opts={}){room(t,opts.warm||.2);inStage(()=>{rug();if(opts.blocks!==false)tower(opts.fall===undefined?1:opts.fall,opts.rebuild||0,t);if(opts.basket)basket(365,183,opts.basket);person(-100,200,{t,mood:opts.mood===undefined?.82:opts.mood,arm:opts.childArm||0,reach:opts.childReach||0});person(225+(opts.space||0),205,{adult:true,t,mood:opts.parentMood===undefined?.30:opts.parentMood,crouch:opts.crouch||0,reach:opts.reach||0,arm:opts.parentArm||0});cloud(-100,-190,opts.cloud===undefined?.8:opts.cloud,t);if(opts.draw)opts.draw()},opts.zoom||1,opts.dx||0,opts.dy||0);}
function note(s){text(s,V?500:960,V?1337:846,V?25:21,P.muted,'NotoSans',400,'center',V?820:1600)}
// First ten seconds: a real object falls; a proposed solution doesn't land.
function hook(t){roomScene(t,{fall:ss(t,.7,2.6),mood:ss(t,1.5,3.3),cloud:ss(t,2.2,5.3),parentMood:.24,draw(){speech('再搭一次就好了',V?245:445,V?-370:-250,phase(t,4,8),{red:true,max:340})}});header('00','积木倒下的那一刻','WHEN A LITTLE WORLD FALLS');}
function dark(){const z=g.createRadialGradient(W*.5,H*.47,0,W*.5,H*.5,H*.7);z.addColorStop(0,'#26312b');z.addColorStop(.48,'#17201c');z.addColorStop(1,'#090f0d');g.fillStyle=z;g.fillRect(0,0,W,H)}
function breathing(t,y,a=1){alpha(a,()=>{const width=V?700:1050,xx=W*.5;for(let j=0;j<2;j++){let pts=[];for(let i=0;i<160;i++){const u=i/159;pts.push([xx-width/2+width*u,y+Math.sin(u*Math.PI*4-t*.65+j*.2)*Math.sin(u*Math.PI)*(j?21:31)])}line(pts,j?P.green:P.gold,j?1.6:2.4)}bloom(xx,y,220,P.gold,.16)})}
function title(t){dark();const a=ss(t,12,13.3)*(1-ss(t,18.3,19.3));alpha(a,()=>{tracked('CO — REGULATION',W/2,V?570:295,V?24:22,P.muted,8);if(V){text('借你一点',W/2,775,110,P.gold,'NotoSerif',600);text('平静',W/2,925,140,P.gold,'NotoSerif',600)}else text('借你一点平静',960,460,126,P.gold,'NotoSerif',600);breathing(t,V?1110:635);text('孩子的情绪，需要有人一起接住',W/2,V?1280:764,V?33:28,P.paper,'NotoSans',400,'center',V?850:1700)})}
function learning(t){const k=ss(t,28.7,33.5);roomScene(t,{zoom:1.17,dx:V?30:35,mood:lerp(.91,.70,k),crouch:.30,cloud:lerp(1,.65,k),draw(){const labels=['别哭了','这有什么好哭的','你要学会……'];labels.forEach((s,i)=>{const a=phase(t,24+i*.45,28.8+i*.3);speech(s,V?185-i*20:440,V?-455+i*75:-215+i*80,a,{red:true,max:V?300:320})});speech('我在',V?185:430,V?-325:-125,ss(t,30,31))}});header('01','他还在学习，怎样停下来','BIG FEELINGS · SMALL CHILD');note(t<24?'AAP · Emotional Development: 2 Year Olds · 2022':'情绪云是视觉比喻，不是大脑或生理测量');}
function rule(t){dark();tracked('A SIMPLE ORDER',W/2,V?420:220,V?24:21,P.muted,7);const words=['先稳住','再连接','后解决'],eng=['REGULATE','RELATE','REASON'];words.forEach((s,i)=>{const a=ss(t,34.6+i*1.5,35.5+i*1.5);alpha(a,()=>{const x=V?W/2:480+i*480,y=V?655+i*240:487;text(String(i+1).padStart(2,'0'),x,y-(V?66:90),V?28:27,P.muted);text(s,x,y,V?87:85,i===0?P.gold:i===1?P.paper:P.green,'NotoSerif',500);tracked(eng[i],x,y+(V?80:83),V?21:20,P.muted,4)})});text('安全边界，任何时候都要守住',W/2,V?1510:765,V?32:30,P.gold);text('AAP · Bruce Perry’s 3 Rs · Why Kids Act Out · 2024',W/2,V?1600:842,V?22:21,P.muted,'NotoSans',400,'center',V?860:1700);}
function regulate(t){const down=ss(t,47,50);roomScene(t,{zoom:1+.08*down,mood:.82-.10*ss(t,52,57),cloud:.80-.16*ss(t,49,57),crouch:down,parentMood:.2*(1-ss(t,42.5,45.5)),reach:.12,draw(){if(t<47){const k=ss(t,42.4,46.5);for(let i=0;i<3;i++)alpha(Math.sin(k*Math.PI)*.60,()=>{let x=235+55*k+i*20;line([[x,-280-i*10],[x+35,-285-i*10]],P.gold,2)})}speech('我在这里',220,-180,phase(t,52,57.3))}});header('02','先稳住自己','A SOFTER VOICE · A SAFER PRESENCE');note('先确保环境安全，再用平稳的声音和姿态靠近');}
function connect(t){const hand=ss(t,65,66)*(1-ss(t,69,70));const remove=ss(t,70.5,73.4);roomScene(t,{zoom:1.15,dx:V?30:35,space:-130*hand,mood:.75,cloud:.63,crouch:1,reach:hand,childArm:hand,blocks:false,basket:remove,draw(){speech('你很失望',220,-180,phase(t,60.3,65));if(hand>0){block(-61,lerp(108,-52,hand), .50,-.18,P.red)}scatter.forEach((b,i)=>{const k=ss(t,70.2+i*.42,72+i*.42);if(k<.98)block(lerp(b[0],365,k),lerp(b[1],155,k)-Math.sin(k*Math.PI)*140,lerp(1,.45,k),b[2],blocks[i][3],i===0)})}});header('03','理解感受，守住边界','FEELINGS ARE ALLOWED · HARM IS LIMITED');note('ZERO TO THREE · Limits for Little Ones · 2021');}
function space(t){const dist=ss(t,84.5,87)*65;roomScene(t,{mood:lerp(.76,.22,ss(t,88,94)),cloud:lerp(.6,.10,ss(t,87,94)),blocks:false,basket:1,crouch:1,space:dist,parentArm:.25*(1-ss(t,84,86)),draw(){speech('抱抱？  陪你坐着？',240,-180,phase(t,79.5,84),{max:390});if(t>85){alpha(phase(t,85,88),()=>{line([[-132,-109],[-110,-103],[-88,-109]],P.gold,3)})}}});header('04','陪伴，也可以有距离','STAY CLOSE · LEAVE A LITTLE SPACE');note('拥抱可以邀请；孩子不愿意时，不强迫身体接触');}
function patience(t){dark();tracked('NO UNIVERSAL COUNTDOWN',W/2,V?600:285,V?23:21,P.muted,5);if(V){text('平静，没有',W/2,850,86,P.gold,'NotoSerif',500);text('统一的倒计时',W/2,975,86,P.gold,'NotoSerif',500)}else text('平静，没有统一的倒计时',960,495,88,P.gold,'NotoSerif',500);breathing(t,V?1150:660);text('每个孩子，需要的时间不同',W/2,V?1340:790,V?38:31,P.paper);}
function rebuild(t){const k=ss(t,104.1,112.7);const reaching=Math.sin(clamp((t-104.1)/8.6)*Math.PI*5)**2*phase(t,104,113);roomScene(t,{warm:.82,zoom:1.03,childReach:reaching,mood:lerp(.24,.04,ss(t,99,105)),cloud:.10*(1-ss(t,99,104)),crouch:1,space:35,reach:.10*(1-ss(t,105,108)),rebuild:k,draw(){speech('怎么搭更稳？',240,-180,phase(t,99.5,104))}});header('05','等风小一点，再一起搭','A SMALL NEXT STEP · TOGETHER');if(t<104)note('等孩子缓和后，再进入讨论、示范和练习');else if(t<109)note('宽一点的底座，先让孩子自己试');}
function closing(t){
 dark();
 // Keep the evidence card first, then leave the last few seconds to the account.
 alpha(1-ss(t,122.75,123.10),()=>{
  const cy=V?630:280;text('借你一点平静',W/2,cy,83,P.gold,'NotoSerif',500,'center',V?900:1700);
  tracked('CO — REGULATION',W/2,cy+100,V?23:21,P.muted,7);
  const y=V?960:515;text('文 献 线 索',W/2,y,V?27:24,P.paper);
  const rows=[['American Academy of Pediatrics','Why Kids Act Out · 2024'],['American Academy of Pediatrics','Emotional Development: 2 Year Olds · 2022'],['ZERO TO THREE','Limits for Little Ones · 2021 / Toddler Tantrums 101 · 2024']];
  rows.forEach((r,i)=>{text(r[0],W/2,y+80+i*(V?140:90),V?24:23,P.gold);text(r[1],W/2,y+118+i*(V?140:90),V?20:19,P.muted,'NotoSans',400,'center',V?900:1700)});
  text('情绪云与时间经过为示意；实际反应存在个体差异',W/2,V?1595:910,V?22:20,P.muted,'NotoSans',400,'center',V?880:1700);
 });
 const a=ss(t,123.15,123.65);
 alpha(a,()=>{save(()=>{
  g.translate(0,(1-a)*18);
  tracked('陪伴 · 理解 · 成长',W/2,V?630:285,V?26:23,P.muted,6);
  bloom(W/2,V?885:480,V?430:580,P.gold,.065);
  text('关注不焦虑爸爸',W/2,V?880:475,V?92:112,P.gold,'NotoSerif',600,'center',V?880:1650);
  const width=(V?570:800)*ss(t,123.28,123.85);
  line([[W/2-width/2,V?1000:590],[W/2+width/2,V?1000:590]],'#edc88375',1.5);
  text('陪孩子长大，也陪自己成长',W/2,V?1115:685,V?37:34,P.paper,'NotoSans',400,'center',V?880:1600);
  breathing(t,V?1280:815,.55);
 })});
}
const scenes=[[0,12.6,hook],[11.9,19.6,title],[18.8,34.6,learning],[33.8,42.7,rule],[41.9,60.6,regulate],[59.8,79.5,connect],[78.8,94.7,space],[93.9,99.7,patience],[98.9,119.7,rebuild],[118.9,128.1,closing]];
// Composite complete scenes, not individual overlapping semi-transparent objects.
const layer=document.createElement('canvas');layer.width=W*SCALE;layer.height=H*SCALE;
// Transitions use an outgoing complete scene plus incoming complete scene at alpha k.
function drawStory(t){g.setTransform(SCALE,0,0,SCALE,0,0);t=clamp(t,0,128);g.globalAlpha=1;g.clearRect(0,0,W,H);let current=0;for(let i=1;i<scenes.length;i++)if(t>=scenes[i][0])current=i;const [a,b,fn]=scenes[current];if(current>0&&t<a+.70){const previous=scenes[current-1];previous[2](Math.min(t,previous[1]));const data=canvas.toDataURL; // all scenes paint their own opaque backgrounds
 const snap=layer.getContext('2d');snap.clearRect(0,0,layer.width,layer.height);snap.drawImage(canvas,0,0);fn(t);const k=ss(t,a,a+.70);g.globalAlpha=1-k;g.drawImage(layer,0,0,W,H);g.globalAlpha=1;
 }else fn(t);caption(t);
 // stationary, low-opacity texture is deterministic and doesn't create compression noise
 alpha(.030,()=>{for(let i=0;i<95;i++){const x=((i*713+37)%W),y=((i*457+89)%H);ellipse(x,y,1,1,'#f0dfb6')}});
 const out=1-ss(t,127.2,128);if(out<1){g.fillStyle=`rgba(7,12,9,${1-out})`;g.fillRect(0,0,W,H)}
}
function cover(){room(0,.65);inStage(()=>{rug();tower(1,0,0);person(-100,200,{mood:.8,t:5});person(225,205,{adult:true,crouch:1,t:0});cloud(-100,-190,.8,0)});const z=g.createLinearGradient(0,0,0,H);z.addColorStop(0,'#0c1410df');z.addColorStop(.55,'#14201700');z.addColorStop(1,'#07100cdd');g.fillStyle=z;g.fillRect(0,0,W,H);tracked('关于孩子，也关于大人',W/2,V?270:165,V?27:23,P.gold,7);if(V){text('孩子崩溃时',W/2,430,101,P.paper,'NotoSerif',700);text('先借他一点',W/2,580,96,P.paper,'NotoSerif',700);text('平静',W/2,730,133,P.gold,'NotoSerif',700);text('先稳住 · 再连接 · 后解决',W/2,1535,39,P.gold)}else{text('孩子崩溃时',960,315,111,P.paper,'NotoSerif',700);text('先借他一点平静',960,470,114,P.gold,'NotoSerif',700);text('先稳住 · 再连接 · 后解决',960,947,35,P.gold)}}

// Recut the existing story against the actual reference soundtrack. Source animation
// time stays continuous; segment boundaries land on measured musical attacks.
const STORY_TIMES = [0, 11.9, 18.8, 33.8, 41.9, 59.8, 78.8, 93.9, 98.9, 104.1, 112.7, 118.9, 128];
const MUSIC_TIMES = [0, 10.726, 17.101, 33.304, 41.546, 59.884, 78.472, 89.377, 93.617, 99.205, 111.956, 119.927, 130];
function mapTime(t,from,to){if(t<=from[0])return to[0];for(let i=1;i<from.length;i++)if(t<=from[i])return lerp(to[i-1],to[i],(t-from[i-1])/(from[i]-from[i-1]));return to[to.length-1]}
function toMusic(t){return mapTime(t,STORY_TIMES,MUSIC_TIMES)}
function seek(t){drawStory(mapTime(t,MUSIC_TIMES,STORY_TIMES))}

window.seek=seek;window.cover=cover;window.SUBS=SUBS.map(([a,b,s])=>[toMusic(a),toMusic(b),s]);window.END=END;window.FPS=FPS;window.MODE=MODE;
document.fonts.ready.then(()=>Promise.all([document.fonts.load('500 48px NotoSans'),document.fonts.load('500 90px NotoSerif')])).then(()=>{seek(0);window.READY=true});
