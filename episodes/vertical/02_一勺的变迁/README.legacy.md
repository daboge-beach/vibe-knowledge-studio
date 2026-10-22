> 历史制作说明。命令、音轨、验收及文件清单只对应原快照；当前入口见 README.md。

# 第二集独立竖屏源工程 · portrait-chart-v2.1-r1

只负责9:16；未修改旧竖屏/另一画幅/其他会话工程。历史基线规格保留：1440×2560，60fps，7242帧，120.700000000秒。

安装requirements.txt所列Python包，ffmpeg/ffprobe需在PATH，安装Google Chrome。预览：python render.py --serve；在打印的本地URL加?mode=vertical。渲染：python render.py --render vertical --jobs 2；代表片段：python render.py --render vertical --clip 59 60 --jobs 1（第二集可用69.6 70.6）。预览和渲染均加载portrait_repair.js并等待准确版本和字体；不要删这层，也不要再次应用节奏映射。

原动画/字体许可在baseline/，字幕/时间轴为当前内容，score.wav保持已锁定混音。音乐来源与使用授权待确认状态见audio/说明。预览/渲染所需资源均为工程内相对路径；timeline.baseline_folder仅是父版追溯元数据，不作为运行依赖。工程中的绝对证据路径是本次实际采证地点。

默认渲染得到renders/final_vertical.mp4；正式发布候选及完整摘要见本轮交付入口。完整观影/主观试听/平台UI/用户验收未做或未记录，不宣布发布就绪。任务单、36项清单及最终MP4证据分开保存。
