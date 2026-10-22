/* Output clock and baseline clock are separate. Plan is embedded below; JSON edits require syncing pace.js, subtitles, audio and renderer duration. */
(()=>{
 const plan={"episode": "第二集", "baseline_folder": "historical-workspace\\第二集_辅食规则50年反转史_重制版", "baseline_video_sha256": "81a3fb203c7ec65a36fbe7be505ac665e67b03557986aa157792dce750c5651c", "baseline_duration": 130, "duration": 120.7, "fps": 60, "cuts": [{"a": 12.9, "b": 16.9, "reason": "标题显现完成后的重复停留"}, {"a": 38.2, "b": 40.9, "reason": "2003节点说明结束后的静止书页"}, {"a": 126.4, "b": 129.0, "reason": "关注卡重复停留"}], "segments": [{"source_start": 0, "source_end": 12.9, "output_start": 0, "output_end": 12.9}, {"source_start": 16.9, "source_end": 38.2, "output_start": 12.9, "output_end": 34.2}, {"source_start": 40.9, "source_end": 126.4, "output_start": 34.2, "output_end": 119.70000000000002}, {"source_start": 129.0, "source_end": 130, "output_start": 119.7, "output_end": 120.69999999999999}], "subtitles": [[0.4, 3.4, "同一勺花生，曾被劝晚一点。"], [3.8, 7.0, "后来，又被建议早点尝。"], [7.4, 10.3, "规则，为什么会变？"], [13.6, 17.0, "把时间拨回半个世纪前。"], [17.4, 21.1, "1974年，英国劝别太早加辅食。"], [21.5, 24.8, "尤其不要早于4个月。"], [25.8, 29.5, "1994年，建议多在4—6个月。"], [30.0, 33.8, "2003年，英国转向约6个月。"], [35.0, 38.3, "另一条规则，曾走向更晚。"], [38.7, 41.9, "2000年，美国儿科学会建议："], [42.3, 45.9, "高风险孩子，花生等到3岁。"], [47.0, 49.8, "2008年，这条延后建议被撤回。"], [50.1, 52.8, "晚吃能防过敏，证据不足。"], [53.7, 56.8, "2015年，LEAP试验带来新证据。"], [57.1, 60.3, "高风险婴儿，被随机分组。"], [60.7, 63.8, "规律吃，或回避，随访到5岁。"], [64.8, 67.6, "初始皮试阴性的队列里，"], [67.9, 71.3, "两组过敏比例，拉开了距离。"], [72.4, 75.3, "2017年，建议随证据更新。"], [75.6, 78.7, "严重湿疹或鸡蛋过敏的宝宝，"], [79.0, 82.3, "先由医生评估，再安排引入。"], [83.3, 86.8, "现在，多数宝宝约6个月加辅食。"], [87.2, 90.3, "富铁、多样，质地随能力调整。"], [90.7, 94.0, "常见致敏食物，无须刻意拖延。"], [95.3, 98.3, "花生要做成适龄、安全的形态。"], [98.6, 101.5, "整颗花生、成坨浓酱，都别喂。"], [101.8, 104.7, "已经过敏，不能自行试吃。"], [105.8, 109.0, "建议在变，因为证据在积累。"], [109.3, 112.8, "看清年份，也看清适用的孩子。"]], "transition_seconds": 0.16, "audio_crossfade_seconds": 0, "notes": ["所有原字幕逐句保留；科学限定、文献页和品牌片尾保留。", "新增短叠化连接被压缩的停留，片段按原速播放。", "第二集另按字幕顺序显现历史书页的月份尺与3岁标记。", "BGM连续修订v2：原曲内部不剪切，音乐与画面分离；music_sync.js仅微调视觉节点，字幕保持原时间。"], "music": {"version": "bgm-continuous-v2", "path": "audio/score.wav", "source_offset": 0, "continuous": true, "internal_splices": 0, "source_rate": 1, "sync_manifest": "music_sync.json", "visual_clock": "music_sync.js", "subtitle_clock": "unchanged"}}, originalSeek=window.seek, copy=document.createElement('canvas');
 const canvas=document.getElementById('c'); copy.width=canvas.width;copy.height=canvas.height;
 const temp=copy.getContext('2d'),ctx=canvas.getContext('2d');
 window.PACING=plan;window.END=plan.duration;window.SUBS=plan.subtitles;
 window.seek=function(t){
  t=Math.max(0,Math.min(plan.duration-1/plan.fps,t));
  let i=plan.segments.findIndex(s=>t<s.output_end);if(i<0)i=plan.segments.length-1;
  const s=plan.segments[i],dt=t-s.output_start,source=s.source_start+dt;
  if(i>0&&dt<plan.transition_seconds){
   originalSeek(plan.segments[i-1].source_end-1/plan.fps);
   temp.clearRect(0,0,copy.width,copy.height);temp.drawImage(canvas,0,0);
   originalSeek(source);
   let k=dt/plan.transition_seconds;k=k*k*(3-2*k);
   ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1-k;ctx.drawImage(copy,0,0);ctx.restore();
  }else originalSeek(source);
 };
})();
