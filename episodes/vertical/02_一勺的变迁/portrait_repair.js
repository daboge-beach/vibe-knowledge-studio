/* portrait-chart-v2.1-r1 — clearer cohort tag, same data/captions/music/time. */
(()=>{
 if(!V)throw new Error('This repair project supports portrait only.');
 const chart=trialChart;
 trialChart=function(t){
  chart(t);
  alpha(ss(t,71.1,71.6),()=>{
   text('初始皮试阴性 · n=530',0,335,43,P.gold,'NotoSans',500,780);
  });
 };
 const oldNote=note;
 note=function(s){if(s==='初始皮试阴性，可评估n=530；非全体受试者合并结果'){
  text('非全体受试者合并结果',500,1350,32,P.muted,'NotoSans',400,850);
 }else oldNote(s)};
 window.PORTRAIT_REPAIR={version:'portrait-chart-v2.1-r1',ready:true,scope:'O-V02-01; captions, values and clocks unchanged'};
})();
