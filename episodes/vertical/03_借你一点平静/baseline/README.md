# 借你一点平静

育儿动画短片的 GitHub 同款配乐修订版，片长 130 秒，无旁白，含参考工程原音轨、少量木块音效和中文字幕。

最新片尾已加入“关注不焦虑爸爸 / 陪孩子长大，也陪自己成长”。可直接使用的最新成片与文案在“发布包_关注版”，压缩包为“借你一点平静_GitHub配乐_关注版发布包.zip”。

## 直接使用

renders/final_vertical.mp4：抖音、小红书通用竖屏版，1080×1920，30fps。

renders/final_horizontal.mp4：横屏完整版，1920×1080，30fps。

cover_vertical.png / cover_xiaohongshu_3x4.png：分别为 9:16、3:4 封面。

publishing.md：两平台标题、正文、话题；facts.md：资料出处和适用边界；storyboard.md：完整分镜。

## 本地预览和编辑

在本目录运行：

```powershell
python render.py --serve
```

打开终端显示的本机地址。页面内可播放、拖动和切换画幅。

编辑 film.js（字幕、场景、时间）或 mix_reference.py（混音）。music_timing.json 记录原动画到音乐节拍的时间映射。每一帧由 seek(t) 唯一决定；横竖屏重新构图，不是从成片裁切。

```powershell
python mix_reference.py
python render.py --review
python render.py --render vertical --jobs 4
python render.py --render horizontal --jobs 4
```

需要 Python、Chrome、ffmpeg，以及 playwright、numpy、scipy、Pillow。当前电脑上制作依赖已经可用。

字体为 Noto Sans SC / Noto Serif SC，开放授权见 assets/OFL-*.txt。

动画制作方法学习来源：https://github.com/Dave-cc/vibe-knowledge-film （MIT）。动画、字幕与画面设计为本工程编写；本修订版音乐改用 https://github.com/wwwyh007/Vibe-GPT-Evolution/blob/main/bgm.mp4 中的音轨，来源及权利信息见 audio/BGM来源说明.md。

## 云端查找记录

2026-10-19：检查当前应用可见聊天、两类归档以及本聊天附件，没有找到旧成片。随后通过已登录的 Codex CLI 执行 codex cloud list --json，返回 tasks=[]、cursor=null。当前账号可访问列表为空，无法取回之前的制品，依用户指示在本机制作了新选题。这不证明其他账号或工作区内不存在旧任务。

## 验证

查看 review/QA.md 和 review/validation.json。已检查多时间点画面、转场和渲染确定性，并验证最终 MP4 音视频流及完整解码。没有将这些技术检查表述为人工完整观影或主观审听；发布前可按自己的账号风格试听成片。
