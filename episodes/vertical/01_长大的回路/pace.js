/* Output clock and baseline clock are separate. Plan is embedded below; JSON edits require syncing pace.js, subtitles, audio and renderer duration. */
(()=>{
 const plan={"episode": "第一集", "baseline_folder": "historical-workspace\\第一集_孩子大脑发育简史_重制版", "baseline_video_sha256": "221bc01b5e4a2a25947f1fd8d4225cdb811467fc4fb37637aad4522992f27027", "baseline_duration": 130, "duration": 118.2, "fps": 60, "cuts": [{"a": 12.9, "b": 16.9, "reason": "标题显现完成后的重复停留"}, {"a": 38.5, "b": 40.9, "reason": "建连演示结束后的重复信号"}, {"a": 74.0, "b": 76.8, "reason": "髓鞘演示结束后的重复信号"}, {"a": 126.4, "b": 129.0, "reason": "关注卡重复停留"}], "segments": [{"source_start": 0, "source_end": 12.9, "output_start": 0, "output_end": 12.9}, {"source_start": 16.9, "source_end": 38.5, "output_start": 12.9, "output_end": 34.5}, {"source_start": 40.9, "source_end": 74.0, "output_start": 34.5, "output_end": 67.6}, {"source_start": 76.8, "source_end": 126.4, "output_start": 67.6, "output_end": 117.2}, {"source_start": 129.0, "source_end": 130, "output_start": 117.2, "output_end": 118.19999999999999}], "subtitles": [[0.5, 3.5, "孩子咿呀一声，"], [3.9, 6.8, "你回他一句。"], [7.2, 10.3, "大脑里，发生了什么？"], [13.6, 17.0, "还没出生，大脑就已开工。"], [17.4, 21.0, "神经板卷起，形成神经管。"], [21.4, 24.8, "它的一端，逐渐发育成脑。"], [25.7, 29.3, "神经元伸出细长的突起。"], [29.8, 34.2, "细胞之间，开始建立连接。"], [35.2, 38.8, "出生后，连接仍在大量形成。"], [39.2, 42.6, "他看你、听你，也伸手探索。"], [43.0, 46.2, "经验参与塑造这些回路。"], [47.2, 50.8, "常被使用的连接，会得到加强。"], [51.2, 54.6, "另一些连接，逐渐被修整。"], [55.0, 58.1, "这叫突触修剪。"], [59.6, 63.2, "神经纤维外，髓鞘逐渐增多。"], [63.7, 67.3, "信号传递，变得更高效。"], [68.5, 72.1, "从抓住积木，到搭起一座塔。"], [72.6, 76.2, "动作、语言与自控，步调不同。"], [76.6, 79.5, "发育，也有个体差异。"], [80.7, 84.1, "到了青春期，大脑还在调整。"], [84.5, 88.1, "参与计划的前额叶，成熟较晚。"], [88.5, 91.4, "长高了，也仍需要陪伴。"], [92.8, 96.8, "早期很重要，学习也贯穿一生。"], [97.2, 101.5, "发育没有一条统一的截止线。"], [103.2, 106.3, "他发出一个信号。"], [106.6, 110.2, "你看见，也回应。"]], "transition_seconds": 0.16, "audio_crossfade_seconds": 0, "notes": ["所有原字幕逐句保留；科学限定、文献页和品牌片尾保留。", "新增短叠化连接被压缩的停留，片段按原速播放。", "第二集另按字幕顺序显现历史书页的月份尺与3岁标记。", "BGM连续修订v2：原曲内部不剪切，音乐与画面分离；music_sync.js仅微调视觉节点，字幕保持原时间。"], "music": {"version": "bgm-continuous-v2", "path": "audio/score.wav", "source_offset": 0, "continuous": true, "internal_splices": 0, "source_rate": 1, "sync_manifest": "music_sync.json", "visual_clock": "music_sync.js", "subtitle_clock": "unchanged"}}, originalSeek=window.seek, copy=document.createElement('canvas');
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
