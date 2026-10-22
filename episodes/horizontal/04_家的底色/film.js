function caption(t){
 const s=SUBS.find(s=>t>=s[0]&&t<=s[1]);if(!s)return;
 alpha(phase(t,s[0],s[1]),()=>{
  const str=s[2],size=V?48:43,y=V?1510:951,max=V?840:1650;
  g.shadowColor='#06171c';g.shadowBlur=12*SCALE;g.shadowOffsetY=2*SCALE;
  if(V&&[...str].length>17){let cut=Math.ceil(str.length/2),k=str.indexOf('，');if(k>=6&&k<=17)cut=k+1;const lines=[str.slice(0,cut),str.slice(cut)];lines.forEach((s,i)=>text(s,500,y+(i-.5)*72,size,P.white,'NotoSans',500,max))}
  else text(str,V?500:W/2,y,size,P.white,'NotoSans',500,max);
 });
}
const previousCanvas=document.createElement('canvas');previousCanvas.width=canvas.width;previousCanvas.height=canvas.height;
function seek(t){
 begin();t=clamp(t,0,130);let i=0;for(let j=1;j<SCENES.length;j++)if(t>=SCENES[j].a)i=j;
 const scene=SCENES[i],dur=.43;
 if(i&&t<scene.a+dur){SCENES[i-1].draw(t);const q=previousCanvas.getContext('2d');q.clearRect(0,0,previousCanvas.width,previousCanvas.height);q.drawImage(canvas,0,0);scene.draw(t);alpha(1-ss(t,scene.a,scene.a+dur),()=>g.drawImage(previousCanvas,0,0,W,H))}
 else scene.draw(t);
 caption(t);finish(t);
}
function cover(aspect){
 const xhs=aspect==='3:4',lh=xhs?1440:H;
 canvas.width=W*SCALE;canvas.height=lh*SCALE;begin();
 dark();
 save(()=>{g.translate(0,(xhs?-175:0)+(V?0:-70));room(2,.30);world(()=>{parents(4,.73);childAtDesk(4,true,.77)},.98,V?10:0,V?120:60)});
 g.fillStyle=gradient(0,0,0,lh,'#0c1c23ee','#0d20202a');g.fillRect(0,0,W,lh);
 const cy=V?(xhs?205:280):145;
 rr(W/2-(V?300:310),cy-32,V?600:620,64,32,'#e9c48515');tracked('第四集 | Vibe知识大赏',W/2,cy,V?28:27,P.gold,3);
 text('你们的关系',W/2,V?(xhs?394:500):301,V?110:112,P.white,'NotoSerif',700,V?870:1700);
 text('孩子都在感受',W/2,V?(xhs?548:655):463,V?100:114,P.gold,'NotoSerif',700,V?880:1700);
 text('家的底色',W/2,xhs?1280:V?1570:963,V?42:39,P.gold,'NotoSerif',500);
 text('夫妻关系，如何影响孩子的安全感',W/2,xhs?1354:V?1650:1026,V?25:24,P.muted,'NotoSans',400,V?850:1700);
}
window.seek=seek;window.cover=cover;window.SUBS=SUBS;window.SCENES=SCENES.map(s=>s.a);window.END=END;window.FPS=FPS;window.MODE=MODE;
document.fonts.ready.then(()=>Promise.all([document.fonts.load('500 48px NotoSans'),document.fonts.load('600 100px NotoSerif')])).then(()=>{seek(0);window.READY=true});
