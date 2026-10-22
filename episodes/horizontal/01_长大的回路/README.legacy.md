> 历史制作说明。命令、音轨、验收及文件清单只对应原快照；当前入口见 README.md。

# 01_长大的回路 可修改横屏工程 v3.1

状态：待验收候选；规范2026-10-22 v2.0；用户未验收；未公开发布。时长118.200000000秒，2560×1440/60fps，7092帧。

Python 3.13，Chrome，FFmpeg/FFprobe在PATH，当前渲染使用NVIDIA NVENC。依赖见requirements.txt。目录内全部媒体、字体、脚本使用相对路径。

```powershell
python -m pip install -r requirements.txt
python render.py --serve
python render.py --review
python qa.py --source
python standards_audit.py .
python sample_gate.py .
python render.py --render --jobs 4
python qa.py --final
python export_covers.py
python package.py
```

编辑绘图在layout.js/refine.js/direction.js及原始绘制脚本；字幕绘制尺寸在pace.js，但内容映射和字幕时间锁定。music_sync.js只作用画面，原曲audio/score.wav连续使用，不按画面删段。第三集无BGM保留audio/foley_only.wav。

index.html为当前预览；timeline.json内baseline_folder和baseline_manifest.json绝对路径仅为历史出处，不参与资源加载。原始130秒画面由单次映射形成锁定时长；不能再重复剪辑。第三集源绘图60fps重渲保持109.033333333秒。

改画面后须重新review、代表片段、全片render和final检查；旧记录不能充当新验收。工程包不含renders，按命令可重渲；发布包另附最终媒体。封面导出支持--out另存。

核查证据见review；来源和授权状态见内容来源.md、BGM来源说明.md；平台文案可直接复制。完整正常速度观影、完整主观试听、真实平台UI验证尚未完成，详见已填写核查表。
