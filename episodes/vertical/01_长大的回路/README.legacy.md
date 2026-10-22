> 历史制作说明。命令、音轨、验收及文件清单只对应原快照；当前入口见 README.md。

# 第一集 · BGM连续修订v2

定稿时长118.200000000秒，60fps；文案与字幕时间不变。原曲从0秒连续播放，内部零剪接，无循环/变速，末尾2.8秒淡出。当前音轨为audio/score.wav。

index.html依次加载baseline/画面、pace.js节奏映射、music_sync.js视觉踩点。pace.js的完整计划副本与timeline.json一致；music_sync.js的完整配置副本与music_sync.json一致。2026-10-22仅纠正内嵌元数据，未改画面绘制、字幕、时长或音频。music_sync.js仅微调动作/换场时间，字幕单独使用锁定时间；music_sync.json记录原曲起音、画面节点和误差。baseline/保留历史源场景，scene时间仍为原130秒。不要把音乐跟着画面删减映射再次剪掉。

预览：python render.py --serve
渲染：python render.py --render vertical --jobs 4
依赖：Python、numpy、scipy、Pillow、Playwright、Chrome、ffmpeg。

横屏复用新版score.wav、timeline.json、字幕.srt和music_sync.json，按横屏自己的场景绘制函数应用同等视觉节点映射；caption使用锁定字幕时钟。不可直接覆盖横屏布局文件。第三集无BGM音效改用同目录foley_only.wav。本工程自包含。
