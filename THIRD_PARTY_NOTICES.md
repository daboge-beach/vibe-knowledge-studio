# 第三方来源与许可

1. 方法和部分引擎实现参考 [HeyChengC/vibe-knowledge-film](https://github.com/HeyChengC/vibe-knowledge-film)。本地来源许可原文保留于 [upstream-vibe-LICENSE.txt](licenses/upstream-vibe-LICENSE.txt)。代码适用MIT；该上游许可明确排除参考影片中的画面、字幕和设计。公开仓库未复制其参考影片、look参考图片、受排除的分析/提示词章节或示例镜头。
2. Noto Sans SC、Noto Serif SC来自[Google Fonts](https://github.com/google/fonts)。两份SIL OFL原文位于 `licenses/`。字体二进制不入Git；`assets/fonts.lock.json`锁定上游提交、下载地址与SHA-256，prepare校验后安装。
3. 第三集木块音效由项目代码合成。`assets/foley/*.wav.gz`为既有定稿无BGM音轨的无损压缩；下载/解压后校验原WAV摘要。合成实现出处保留于 `history/foley_origin/mix_reference.py`，其中涉及旧背景音乐的部分仅是历史源代码，不运行也不下载旧BGM。
4. 原配乐曾引用 [wwwyh007/Vibe-GPT-Evolution](https://github.com/wwwyh007/Vibe-GPT-Evolution/blob/main/bgm.mp4)。能访问不等于获得再分发许可；本仓库不包含该音频、其派生混音或含该音乐的MP4。原曲相关哈希和剪辑参数是来源记录，不授予音乐使用权。
5. 事实资料仅保留引用、链接和本项目的表达/核查记录，不分发原论文或机构文章全文。视频的适用年龄、风险条件与研究边界仍需逐集检查。

第三方各自的许可优先于本仓库根目录MIT。仓库许可不授予对账号名称、商标或他人作品的额外权利。
