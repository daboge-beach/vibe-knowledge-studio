'use strict';
const MODE=new URLSearchParams(location.search).get('mode')||'vertical';
const V=MODE==='vertical',W=V?1080:1920,H=V?1920:1080,END=130,FPS=60,SCALE=4/3;
const canvas=document.getElementById('c');canvas.width=W*SCALE;canvas.height=H*SCALE;
const g=canvas.getContext('2d',{alpha:false});
const P={bg:'#111d20',gold:'#e9c485',white:'#fff1da',muted:'#b5b9ac',teal:'#8caeaa',red:'#d88a79',blue:'#718e9a',skin:'#d9a986',hair:'#392b2c',wood:'#88664f',paper:'#efe4ca'};
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x)),lerp=(a,b,k)=>a+(b-a)*k;
const smooth=x=>{x=clamp(x);return x*x*(3-2*x)},ss=(t,a,b)=>smooth((t-a)/(b-a));
const phase=(t,a,b)=>ss(t,a,a+.45)*(1-ss(t,b-.45,b));
const hash=n=>{let x=Math.sin(n*12.9898+4.1414)*43758.5453;return x-Math.floor(x)};
function save(f){g.save();f();g.restore()}
function alpha(a,f){if(a>.001)save(()=>{g.globalAlpha*=clamp(a);f()})}
function path(f,fill,stroke,width=1){g.beginPath();f(g);if(fill){g.fillStyle=fill;g.fill()}if(stroke){g.strokeStyle=stroke;g.lineWidth=width;g.stroke()}}
function ellipse(x,y,rx,ry,c){path(k=>k.ellipse(x,y,rx,ry,0,0,Math.PI*2),c)}
function rr(x,y,w,h,r,c){path(k=>k.roundRect(x,y,w,h,r),c)}
function line(pts,c,width=2){g.lineCap='round';g.lineJoin='round';path(k=>pts.forEach((p,i)=>i?k.lineTo(...p):k.moveTo(...p)),null,c,width)}
function poly(pts,c){path(k=>{pts.forEach((p,i)=>i?k.lineTo(...p):k.moveTo(...p));k.closePath()},c)}
function gradient(x,y,x1,y1,a,b){const z=g.createLinearGradient(x,y,x1,y1);z.addColorStop(0,a);z.addColorStop(1,b);return z}
function glow(x,y,r,col,a=.15){alpha(a,()=>{const z=g.createRadialGradient(x,y,0,x,y,r);z.addColorStop(0,col);z.addColorStop(1,col+'00');g.fillStyle=z;g.fillRect(x-r,y-r,2*r,2*r)})}
function text(str,x,y,size=40,c=P.white,font='NotoSans',weight=400,max){g.font=`${weight} ${size}px ${font}`;if(max&&g.measureText(str).width>max)g.font=`${weight} ${size*max/g.measureText(str).width}px ${font}`;g.textAlign='center';g.textBaseline='middle';g.fillStyle=c;g.fillText(str,x,y)}
function tracked(str,x,y,size,c,space=5){g.font=`400 ${size}px NotoSans`;let a=[...str],ww=a.map(s=>g.measureText(s).width),len=ww.reduce((a,b)=>a+b,0)+(a.length-1)*space,xx=x-len/2;a.forEach((s,i)=>{text(s,xx+ww[i]/2,y,size,c);xx+=ww[i]+space})}
function begin(){g.setTransform(SCALE,0,0,SCALE,0,0);g.globalAlpha=1;g.shadowBlur=0;g.clearRect(0,0,W,H)}
function dark(){g.fillStyle=gradient(0,0,W,H,'#15272b','#0a151a');g.fillRect(0,0,W,H);glow(W*.46,H*.45,H*.52,'#6e8c79',.10)}
const VIEW={x:V?500:960,y:V?1000:550,s:V?.94:1.20};
function world(fn,z=1,px=0,py=0){save(()=>{const zoom=V?z:1+(z-1)*.25;g.translate(VIEW.x+px,VIEW.y+py);g.scale(VIEW.s*zoom,VIEW.s*zoom);fn()})}
const tex=document.createElement('canvas');tex.width=tex.height=192;{const q=tex.getContext('2d'),im=q.createImageData(192,192);for(let i=0;i<192*192;i++){let n=Math.floor(hash(i)*255);im.data.set([n,n,n,17],i*4)}q.putImageData(im,0,0)}
function finish(t){alpha(.23,()=>{for(let y=0;y<H;y+=192)for(let x=0;x<W;x+=192)g.drawImage(tex,x,y)});const z=g.createRadialGradient(W*.48,H*.48,H*.18,W*.5,H*.5,H*.77);z.addColorStop(0,'#0000');z.addColorStop(.72,'#07101213');z.addColorStop(1,'#050e1470');g.fillStyle=z;g.fillRect(0,0,W,H);const fade=ss(t,129.25,130);if(fade){g.fillStyle=`rgba(5,13,17,${fade})`;g.fillRect(0,0,W,H)}}
function header(no,title,en){const x=V?100:130,y=V?200:60;text(no,x,y,V?25:22,P.gold);line([[x+50,y],[W-(V?170:130),y]],'#dcc69a33',1);tracked(en,V?500:W/2,V?277:106,V?20:18,P.muted,4);text(title,V?500:W/2,V?365:171,V?58:49,P.white,'NotoSerif',500,V?850:1650)}
function note(s){text(s,V?500:W/2,V?1350:880,V?24:21,P.muted,'NotoSans',400,V?850:1700)}
function bubble(s,x,y,a=1,kind='neutral',max=290){alpha(a,()=>{g.font='500 25px NotoSans';let w=Math.min(max,g.measureText(s).width+42);const fill=kind==='red'?'#654944':kind==='gold'?'#d6bd8f':'#a6b8ab';rr(x-w/2,y-29,w,58,15,fill);poly([[x-17,y+28],[x-10,y+43],[x+7,y+28]],fill);text(s,x,y,25,kind==='red'?'#f4d9c5':'#293d3a','NotoSans',500,w-24)})}
function breathe(t,y){for(let j=0;j<2;j++){let p=[];const width=V?660:940;for(let i=0;i<130;i++){let u=i/129;p.push([W/2-width/2+width*u,y+Math.sin(u*12-t*.55+j*.28)*Math.sin(u*Math.PI)*(j?15:22)])}line(p,j?'#7c9f9165':'#e9c48585',j?1.4:2)}}
const shotLayer=document.createElement('canvas');shotLayer.width=canvas.width;shotLayer.height=canvas.height;
function shotBlend(k,oldShot,newShot){if(k<=0){oldShot();return}if(k>=1){newShot();return}oldShot();const q=shotLayer.getContext('2d');q.clearRect(0,0,shotLayer.width,shotLayer.height);q.drawImage(canvas,0,0);newShot();alpha(1-k,()=>g.drawImage(shotLayer,0,0,W,H))}
