const SUBS=[
 [.4,3.6,'你以为孩子在画画。'],[4.1,7.8,'可你们的语气一变，他的笔就停了。'],[8.2,10.3,'他听见的，只有争吵吗？'],
 [17.7,21.1,'反复、激烈又没有解决的冲突，'],[21.4,25.1,'可能让孩子一直担心：家还安全吗？'],[25.7,29.2,'有的会躲开，有的会跑来劝架。'],[29.6,32.8,'安静，也不一定代表没受影响。'],
 [33.7,37.3,'有些孩子，还会把错揽到自己身上。'],[37.8,41.1,'“是不是我乖一点，你们就不吵了？”'],[41.8,45.2,'让孩子选边，他会更难安心。'],[45.7,48.0,'大人的矛盾，要由大人来处理。'],
 [49,52.5,'意见不同，可以有尊重的表达。'],[53,56.4,'孩子也在学：分歧可以怎样解决。'],
 [60.6,64.2,'声音越来越大，就先约好暂停。'],[64.7,68.1,'平静后，再回到那件具体的事。'],[68.6,72.2,'“刚才我那样说话，不合适。”'],[72.8,76.8,'让孩子看见，道歉之后也有改变。'],
 [78.8,82.3,'也请单独告诉他：“不是你的错。”'],[82.8,86.3,'“我们的分歧，不需要你来解决。”'],
 [89.5,93.0,'若有暴力、恐吓或控制，先确保安全。'],
 [94.2,98,'商量出一个办法，也认真去做到。'],[98.8,103.1,'“明天我来接，你先休息。”'],[103.8,107.6,'“下次生气，我们先停一下再说。”'],
 [112.5,116,'家的底色，藏在每天怎样相处里。'],[116.4,119.5,'给孩子安心，也给彼此尊重。']
];
function parents(t,mood=.7,calm=false){
 const motion=Math.sin(t*1.8)*6;
 person(-235,226,.96,{role:'mom',t,mood,look:1,lean:calm?0:.018,right:calm?[76,-148]:[98,-206+motion],rightElbow:[60,-180],left:[-23,-143],leftElbow:[-59,-185],smile:calm});
 person(235,226,.98,{role:'dad',t,mood,look:-1,lean:calm?0:-.017,left:calm?[-76,-148]:[-98,-206-motion],leftElbow:[-60,-180],right:[23,-143],rightElbow:[59,-185],smile:calm});
}
function heldPaper(x,y,progress=.8){rr(x-91,y-48,182,102,4,'#26383455');save(()=>{g.translate(x,y);g.rotate(-.025);rr(-95,-53,190,103,3,P.paper);g.beginPath();g.rect(-95,-53,190,103);g.clip();familyDrawing(0,2,.67,progress)});hand(x-95,y+2,7);hand(x+95,y+1,7)}
function drawingCloseup(t,progress=.8,writing=true){
 room(t,.48);alpha(.34,()=>{g.fillStyle='#10232a';g.fillRect(0,0,W,H)});
 world(()=>{
  rr(-488,-247,976,535,24,gradient(-400,-230,430,270,'#947854','#5e4838'));
  for(let i=0;i<16;i++)line([[-461,-222+i*30],[459,-205+i*30]],'#d9bb8a15',1);
  save(()=>{g.rotate(-.025);ellipse(7,20,331,175,'#172f2c35');rr(-304,-186,608,354,3,'#f1e6ce');poly([[274,-186],[304,-157],[274,-155]],'#fff3dd');g.beginPath();g.rect(-304,-186,608,354);g.clip();familyDrawing(0,2,2.2,progress)});
  pencil(-372,-91,111,'#b98470',-.86);pencil(-373,31,111,'#6e9692',-.52);
  const q=ss(progress,.55,1),tipX=lerp(-46.2,-19.8,q),tipY=74.6;
  const angle=2.85,cx=tipX-Math.cos(angle)*51.5,cy=tipY-Math.sin(angle)*51.5;
  line([[341,286],[189,122],[cx+11,cy+8]],'#bd965e',48);line([[335,275],[180,116],[cx+11,cy+8]],'#d0ac70',37);hand(cx+11,cy+8,21);pencil(cx,cy,95,'#c6a35d',angle);
 },V?.99:1.06,0,V?-50:-10);
}
function openingWide(t){room(t,.24);const z=lerp(1.13,1.02,ss(t,4,9));world(()=>{parents(t,.83);childAtDesk(t,true,.75)},z,V?18:0,V?-25:-15)}
function opening(t){shotBlend(ss(t,3.2,4.4),()=>drawingCloseup(t,lerp(.56,.77,ss(t,.2,3.2)),t<3.2),()=>openingWide(t));header('04','你们说的话，他也在听','THE CHILD HEARS MORE THAN WORDS');}
function titleCard(t){dark();const a=ss(t,10.73,11.65);alpha(a,()=>{tracked('THE CLIMATE OF HOME',W/2,V?570:285,V?25:23,P.muted,7);text('家的底色',W/2,V?822:465,V?130:138,P.gold,'NotoSerif',600,V?850:1700);save(()=>{g.translate(W/2,V?1085:680);familyDrawing(0,0,V?1.4:1.0,.90)});text('夫妻关系，如何影响孩子的安全感',W/2,V?1320:837,V?32:29,P.white,'NotoSans',400,V?850:1700)})}
function listening(t){room(t,.18);world(()=>{
 parents(t,.78);
 // Different reactions are examples; they are not a diagnostic checklist.
 const move=-66*ss(t,25.5,27.0)+64*ss(t,27.1,28.9),reach=ss(t,27.1,28.1)*(1-ss(t,29.0,29.7));
 person(move,221,1.07,{child:true,seated:false,t,mood:.72,look:Math.sin(t*.8)*.7,right:[lerp(77,102,reach),lerp(-91,-145,reach)],left:[-77,-91],headTilt:-.03});
 heldPaper(move,126,.76);
 },lerp(1.64,1.36,ss(t,25,28.6)),0,V?-108:-80);
 header('01','孩子先在确认：家，还安全吗？','EMOTIONAL SECURITY');note(t<25?'Harold & Sellers · 2018 / Davies et al. · 2016':'人物反应是情境示意；不能凭某个动作判断孩子的心理状态');}
function middle(t){room(t,.18);world(()=>{
 parents(t,.7);
 person(0,226,1.08,{child:true,t,mood:.68,look:Math.sin(t*.7)*.75,left:[-77,-91],right:[77,-91]});heldPaper(0,125,.76);
 bubble('是不是我不乖？',0,-112,phase(t,35.6,41.3),'gold',285);
 bubble('你觉得谁对？',-256,V?-242:-180,phase(t,41.6,45.3),'red',260);
 bubble('你跟谁？',257,V?-242:-180,phase(t,42.0,45.3),'red',235);
 },lerp(1.62,1.13,ss(t,41.1,42.4)),0,V?-106:-78);header('02','别让孩子，做大人的裁判','ADULT PROBLEMS · ADULT RESPONSIBILITY');note('Grych et al. · 2003 / AAP · 避免让孩子卷入成人关系冲突');}
function cup(x,y,c='#c4b794'){ellipse(x,y+23,23,7,'#102b2933');rr(x-20,y-20,40,42,8,c);ellipse(x,y-20,20,5,'#ddcfac');ellipse(x,y-20,15,3,'#6f6150');path(k=>{k.moveTo(x+18,y-10);k.bezierCurveTo(x+47,y-17,x+46,y+16,x+18,y+11)},null,c,6)}
function meetingWorld(t,arrange=0,o={}){
 const pause=o.pause||0,rest=o.rest||0,bagK=o.bagK||0;
 const innerR=[lerp(105,96,pause),lerp(-72,-143,pause)],elbowR=[lerp(44,57,pause),lerp(-77,-87,pause)],innerL=[-innerR[0],innerR[1]],elbowL=[-elbowR[0],elbowR[1]],bagHand=[lerp(40,49,bagK),lerp(-66,-119,bagK)],bagElbow=[lerp(56,67,bagK),lerp(-83,-81,bagK)];
 chair(-248,219,1);chair(248,219,1);
 person(-245,220,1,{role:'mom',t,seated:true,mood:o.mood===undefined?.20:o.mood,look:1,smile:rest>.6,right:innerR,rightElbow:elbowR,left:[-40,-66],leftElbow:[-56,-83],palm:'right',palmOpen:pause});
 person(245,220,1,{role:'dad',t,seated:true,mood:o.mood===undefined?.20:o.mood,look:-1,smile:rest>.6,left:innerL,leftElbow:elbowL,right:bagHand,rightElbow:bagElbow,palm:'left',palmOpen:pause});
 // Solid furniture comes after the legs. Palms and props then sit on top.
 ellipse(0,237,370,44,'#112b293b');poly([[-348,186],[-277,120],[277,120],[348,186]],gradient(-240,120,280,190,'#b39970','#806047'));poly([[-348,186],[348,186],[348,207],[-348,207]],'#73573e');line([[-308,202],[-302,271]],'#594a37',15);line([[308,202],[302,271]],'#594a37',15);
 for(let i=0;i<4;i++)line([[-260+i*15,135],[250+i*15,177]],'#f6d7a015',1);
 // Draw the full visible arm above the table so the edge cannot cut the elbow away.
 tableArm(-245+36,220-143,-245+elbowR[0],220+elbowR[1],-245+innerR[0],220+innerR[1],'#9ba89a',21,pause,1);
 tableArm(245-36,220-143,245+elbowL[0],220+elbowL[1],245+innerL[0],220+innerL[1],'#678792',21,pause,-1);
 calendar(0,101,.90,arrange);cup(-237,153,'#9fb2a1');cup(236,153,'#c8b68b');
 pencil(157,165,64,'#b9995f',-.20);
 if(o.phone){save(()=>{g.translate(-170,176);g.rotate(.13);g.scale(1,.30);rr(-24,-38,48,73,8,'#23373d');rr(-20,-33,40,59,4,o.phone>.5?'#25383a':'#728d8b');ellipse(0,30,2,2,'#c4bc94')})}
 if(bagK)alpha(bagK,()=>bag(245+bagHand[0],220+bagHand[1]+74,.80));
 if(o.dialogue)bubble(o.dialogue,o.bubbleX||0,-135,o.bubbleA||1,'gold',V?300:365);
}
function different(t){room(t,.53);world(()=>meetingWorld(t,ss(t,54,58),{mood:.12}),lerp(1.48,1.64,ss(t,49,57)),0,V?-155:-95);header('03','分歧，可以有另一种样子','DISAGREEMENT WITH RESPECT');note('Davies et al. · 2025 · 建设性冲突与儿童问题解决能力的前瞻性联系');}
function pauseRepair(t){room(t,.53);const p=phase(t,60,64.3);world(()=>meetingWorld(t,ss(t,72,76.6),{pause:p,mood:t<65?.30:.1,phone:ss(t,60.5,64),dialogue:t>68?'刚才那样说，不合适':null,bubbleX:V?112:150,bubbleA:phase(t,68.4,72.5)}),1.56,0,V?-150:-95);header('04','把道歉，接到具体的改变上','PAUSE · RETURN · TAKE RESPONSIBILITY');note('一般分歧的示例：暂停后回到问题，不以冷处理取代沟通');}
function reassure(t){room(t,.64);world(()=>{
 person(-220,218,1,{role:'dad',t,kneel:true,mood:.12,look:1,right:[96,-116],rightElbow:[62,-101],left:[-35,-66],leftElbow:[-61,-111],palm:'right',palmOpen:.35});
 person(240,220,.96,{role:'mom',t,kneel:true,mood:.12,look:-1,left:[-96,-116],leftElbow:[-62,-101],right:[35,-66],rightElbow:[61,-111],palm:'left',palmOpen:.35});
 person(10,230,1,{child:true,t,mood:lerp(.55,.22,ss(t,79,87)),look:-.4,left:[-77,-91],right:[77,-91]});heldPaper(10,134,.78);
 bubble('不是你的错',-212,-128,phase(t,78.6,83.0),'gold',265);
 bubble('不用你来解决',230,-128,phase(t,83.1,87.0),'neutral',270);
 },1.48,0,V?-120:-85);header('05','把孩子，放回孩子的位置','REASSURE THE CHILD');note('AAP · 成人的关系问题由成人负责，避免让孩子当信使或选边');}
function safety(t){dark();tracked('SAFETY COMES FIRST',W/2,V?560:265,V?24:21,P.muted,7);text('安全，始终优先',W/2,V?800:445,V?88:96,P.gold,'NotoSerif',600,V?870:1700);text('暴力 · 恐吓 · 控制',W/2,V?988:598,V?43:38,P.red,'NotoSans',500,V?850:1600);text('寻求可信赖的人与当地专业支持',W/2,V?1165:737,V?32:29,P.white,'NotoSans',400,V?850:1600);text('不要让孩子介入制止，也不用孩子承担劝和的责任',W/2,V?1260:814,V?24:22,P.muted,'NotoSans',400,V?850:1650);}
function cooperation(t){room(t,.82);const bk=phase(t,98.3,103.5);world(()=>meetingWorld(t,1,{rest:1,bagK:bk,mood:0,dialogue:t<103.5?'明天我来接':'先停一下，再好好说',bubbleX:t<103.5?(V?118:174):0,bubbleA:t<103.5?phase(t,98.3,103.4):phase(t,103.6,107.7)}),1.50,0,V?-150:-95);header('06','让修复，出现在下一次行动里','AGREEMENTS THAT BECOME ACTIONS');note('接送与休息是生活示例；关系修复需要持续行动');}
function returnWide(t){room(t,.82);world(()=>{
 chair(-252,168,.82);chair(253,168,.83);
 person(-252,166,.86,{role:'mom',t,seated:true,mood:0,look:1,smile:true,right:[91,-80],rightElbow:[42,-84],left:[-30,-65],leftElbow:[-59,-87]});
 person(251,166,.88,{role:'dad',t,seated:true,mood:0,look:-1,smile:true,left:[-91,-80],leftElbow:[-42,-84],right:[30,-65],rightElbow:[59,-87]});
 childAtDesk(t,false,lerp(.83,1,ss(t,108.5,117.7)));
 },1.09,V?12:0,V?-35:-20);}
function returnHome(t){shotBlend(ss(t,111.8,112.6),()=>drawingCloseup(t,lerp(.80,1,ss(t,108.2,111.6)),true),()=>returnWide(t));header('07','家的底色，在每天怎样相处里','SMALL MOMENTS · A SAFER HOME');}
function credits(t){dark();text('家的底色',W/2,V?610:270,V?114:104,P.gold,'NotoSerif',600);tracked('THE CLIMATE OF HOME',W/2,V?740:370,V?22:20,P.muted,6);text('文 献 线 索',W/2,V?920:490,V?27:23,P.white);const rows=[['Harold & Sellers · 2018','Interparental conflict and youth psychopathology'],['Davies et al. · 2025','Constructive interparental conflict'],['American Academy of Pediatrics','Family Arguments / Divorce and Separation']];rows.forEach((r,i)=>{text(r[0],W/2,(V?1010:565)+i*(V?135:85),V?25:23,P.gold);text(r[1],W/2,(V?1054:606)+i*(V?135:85),V?20:19,P.muted,'NotoSans',400,V?890:1650)});text('人物与对话为情境示意；影响存在个体差异',W/2,V?1510:898,V?24:21,P.muted,'NotoSans',400,V?880:1700);}
function follow(t){dark();tracked('陪伴 · 理解 · 成长',W/2,V?620:280,V?26:23,P.muted,6);text('关注不焦虑爸爸',W/2,V?868:463,V?92:112,P.gold,'NotoSerif',600,V?880:1700);line([[W/2-(V?285:400),V?990:580],[W/2+(V?285:400),V?990:580]],'#e9c48570',1.4);text('陪孩子长大，也陪自己成长',W/2,V?1107:679,V?37:34,P.white,'NotoSans',400,V?880:1650);breathe(t,V?1270:813)}
const SCENES=[
 {a:0,draw:opening},{a:10.726,draw:titleCard},{a:17.101,draw:listening},{a:33.304,draw:middle},
 {a:48.472,draw:different},{a:59.884,draw:pauseRepair},{a:78.472,draw:reassure},{a:89.377,draw:safety},
 {a:93.617,draw:cooperation},{a:107.90,draw:returnHome},{a:119.927,draw:credits},{a:124.6,draw:follow}
];
