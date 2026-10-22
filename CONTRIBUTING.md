# 参与制作

先读AGENTS和视频制作总规范。提交应说明具体问题、最终行为、验证范围及未完成项。用独立分支，避免覆盖并行会话的工程。

执行 `python -m unittest discover -s tests -v`、`python tools/audit_publication.py`、`python tools/studio.py check all`；改动画时导出受影响片段并比较最终MP4，改音乐时复核最终实际音轨。技术通过不能代替完整视听或用户验收。

不要提交密钥、自备且未授权公开的音频、受限参考素材、环境或渲染缓存。历史报告保留原范围；新版本建立新证据。
