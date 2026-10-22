// Portable preview; audio mode is always shown, never inferred from a legacy filename.
(()=>{
let playing=false, anchor=0, origin=0, audioReady=false;
const btn=document.getElementById('play'), range=document.getElementById('scrub'), label=document.getElementById('time');
const audio=new Audio('audio/score.wav'); audio.preload=location.search.includes('offline')?'none':'auto';
audio.addEventListener('canplay',()=>audioReady=true);
const format=t=>Math.floor(t/60)+':'+String(Math.floor(t%60)).padStart(2,'0');
function draw(t){range.value=t;window.seek(t);label.textContent=format(t)+' / '+format(window.END);}
function tick(now){if(!playing)return;const t=Math.min(window.END,audioReady&&!audio.paused?audio.currentTime:anchor+(now-origin)/1000);draw(t);if(t<window.END)requestAnimationFrame(tick);else{playing=false;audio.pause();btn.textContent='播放';}}
btn.onclick=async()=>{playing=!playing;btn.textContent=playing?'暂停':'播放';if(playing){anchor=+range.value;if(anchor>=window.END)anchor=0;origin=performance.now();audio.currentTime=anchor;try{await audio.play();audioReady=true;}catch{audioReady=false;}requestAnimationFrame(tick);}else{audio.pause();}};
range.oninput=()=>{anchor=+range.value;origin=performance.now();audio.currentTime=anchor;draw(anchor);};
range.max=window.END;
const mode=document.createElement('p');mode.id='audio-mode';mode.style.cssText='font-size:13px;padding:0 16px;color:#e9c485;max-width:90vw';mode.textContent='开源候选 · 默认无BGM；第三集保留原创木块音效。完整视听与平台验收未完成。';document.querySelector('main').appendChild(mode);
fetch('.audio-state.json').then(r=>r.ok?r.json():null).then(s=>{if(s&&s.mode==='custom')mode.textContent='自备配乐候选 · 音源、乐句连续性、动作同步及最终MP4音轨仍需复核。';}).catch(()=>{});
})();
