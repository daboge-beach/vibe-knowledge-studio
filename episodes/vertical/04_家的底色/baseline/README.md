# 第四集《家的底色》

主题：夫妻关系如何影响孩子的安全感。账号：不焦虑爸爸。

成片 2 分 10 秒，无旁白，原创场景插画与中文字幕。竖屏 1440×2560、横屏 2560×1440，均为 60 fps；H.264 / yuv420p / BT.709 limited，AAC 48 kHz 双声道。

## 内容与画面

用孩子画全家福作为首尾呼应。前段表现孩子的警觉与自责，中段以日历、接送和休息安排演示暂停、协商与兑现约定。正文不把一次争执等同于终身伤害，不让孩子承担修复父母关系的责任。

与上一集相比，本集提高输出分辨率和帧率，增加人物表情、手势、纸张近景、镜头切换和家居细节；横竖画面单独排版。片尾使用“关注不焦虑爸爸 / 陪孩子长大，也陪自己成长”。

## 文件

- `renders/final_vertical.mp4`：带 GitHub 参考配乐的竖屏主片。
- `renders/final_horizontal.mp4`：带同款配乐的横屏备份。
- `发布包_姿态优化版/平台加音乐版_竖屏.mp4`：相同画面、无背景音乐，供平台内另配曲库音乐。
- 最新版本为 `发布包_姿态优化版`，调整夫妻肩肘腕连接、前臂弯曲方向与桌边手掌连接；保留孩子头顶露肤修复和自然刘海。三种比例封面、标题文案、SRT 字幕、事实来源、BGM 来源和质检说明都在其中。
- 最新压缩包为 `第四集_家的底色_姿态优化版发布包.zip`。
- `storyboard.md`、`facts.md`、`engine.js`、`art.js`、`scenes.js`、`film.js` 为可修改源文件。

## 再次渲染

需要 Python、Playwright/Chrome、Pillow 和 ffmpeg；本机环境已具备。

```powershell
python render.py --review
python render.py --render vertical --jobs 4
python render.py --render horizontal --jobs 4
python qa.py
python package.py
```

打包前必须重新完成当前源文件的画面检查与横竖渲染，并通过媒体质检。打包脚本核对主片 SHA-256 与质检数据，拒绝早于场景源文件的成片、封面或画面检查报告。压缩包只收录明确列出的交付物，校验成功后再替换正式 ZIP。

音乐来源与使用信息见 `audio/BGM来源说明.md`。字体为 Noto Sans SC 与 Noto Serif SC，OFL 许可在 assets 中。
