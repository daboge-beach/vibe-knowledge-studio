# Vibe知识大赏 · 不焦虑爸爸

用代码制作无旁白的育儿知识视频：具体的人物、真实的动作、看得懂的因果，以及可复用的育儿方法。横屏和竖屏使用各自的构图。

仓库包含前四集的八套可编辑工程、第五和第六集策划、制作规范、复查清单与历史交接记录。跨电脑入口统一为 `tools/studio.py`，默认CPU编码，不依赖原机器目录或NVIDIA显卡。

**当前是待验收的开源工程候选。** 原配乐未取得可确认的再分发许可，因此不上传原曲、混音或含该曲的MP4。首次运行默认无BGM，第三集保留代码合成的原创木块音效。历史技术报告不代表本版完成完整观影、试听、平台UI或用户验收。

## 新电脑开始

需要 Python **3.11–3.14**、Git，以及包含 `libx264`、AAC编码器的FFmpeg（`ffmpeg`和`ffprobe`可在命令行调用）。初次安装需要联网下载Python依赖、Chromium和两款开源字体；之后预览和渲染可离线运行。机器差异可能带来轻微字体栅格/编码差异，不能保证不同系统MP4逐字节相同。

Windows建议克隆到空间足够的盘。当前工作机使用E盘：

```powershell
Set-Location E:\
git clone https://github.com/daboge-beach/vibe-knowledge-studio.git
Set-Location vibe-knowledge-studio
powershell -ExecutionPolicy Bypass -File scripts/bootstrap.ps1
.\.venv\Scripts\python.exe tools/studio.py list
.\.venv\Scripts\python.exe tools/studio.py preview vertical-01
```

打开终端输出的本机地址预览。`ExecutionPolicy Bypass`仅作用于上述脚本进程，不更改系统策略；也可阅读脚本后逐行执行。

macOS / Linux：

```bash
git clone https://github.com/daboge-beach/vibe-knowledge-studio.git
cd vibe-knowledge-studio
bash scripts/bootstrap.sh
.venv/bin/python tools/studio.py preview horizontal-01
```

Linux若缺少Chromium系统库，在本机按Playwright提示安装，或执行 `.venv/bin/python -m playwright install-deps chromium`（可能需要系统管理员权限）。FFmpeg安装入口见[官方说明](https://ffmpeg.org/download.html)。不要把自己的登录凭据交给项目脚本。

安装脚本将虚拟环境、pip缓存、浏览器和临时文件放在本仓库的 `.venv/`、`.cache/`、`.tmp/`；产物在 `.outputs/`。这些目录不入Git。本项目不会自动安装Python/FFmpeg或清理旧盘文件。

## 常用命令

下文 `python` 指本仓库虚拟环境中的Python；Windows可用 `.\.venv\Scripts\python.exe`，macOS/Linux可用 `.venv/bin/python`。

```shell
python tools/studio.py doctor
python tools/studio.py check all
python tools/studio.py frame vertical-03 --time 85.9
python tools/studio.py render horizontal-04 --start 0 --end 2
python tools/studio.py render vertical-03
python tools/verify_export.py .outputs/vertical-03/no-bgm-0-3271.mp4
```

先抽帧、导出短片，检查完再导出全片。导出默认 `--audio no-bgm`；已有同名输出会拒绝覆盖。每次导出记录实际输入摘要、帧数、媒体参数，并完整解码最终MP4、提取实际音轨。verify_export比较首中尾画面及整段实际音轨；全片交付还需按核查清单补齐全部动作/转场/分段检查点，技术检查不能替代完整观看和试听。

若本机已经安装Chrome，可在 `check/frame/render` 命令加 `--browser-channel chrome`。不同Chromium版本需重新核对画面。旧工程内其他工具与 `README.legacy.md`仅保留作历史实现参考，不是跨电脑启动入口。

自备有授权的**最终混音**：

```shell
python tools/studio.py audio vertical-03 /path/to/licensed-final-mix.wav --license-note "授权依据和适用范围"
python tools/studio.py render vertical-03 --audio score
```

该命令只转为48kHz双声道PCM、取本集时长，不循环、不拼接、不自动补音效或淡出。第三集最终混音应包含原有木块音效；原音效在prepare后位于对应 `audio/foley_only.wav`。两画幅分别登记同一内容版本的混音。换曲后须重核音乐节点、乐句、动作、首尾淡化及最终MP4实际音轨；填许可说明不等于工具验证了授权。

## 内容与入口

| 集数 | 片名 | 竖屏来源 | 横屏来源 |
|---|---|---|---|
| 1 | 长大的回路 | 连续BGM修订后的a1代码快照 | v3.1 / h1交接 |
| 2 | 一勺的变迁 | r1来源与图表修订 | v3.1 / h1交接 |
| 3 | 借你一点平静 | r1抓取与木块动作修订 | v3.1 / h1交接 |
| 4 | 家的底色 | 连续BGM修订后的a1代码快照 | v3.1 / h1交接 |
| 5 | 下一步 | 策划完成，尚无成片 | 同一策划、独立构图 |
| 6 | 被看见 | 策划完成，尚无成片 | 同一策划、独立构图 |

竖屏r1改动没有被擅自覆盖到横屏。尤其第二、三集，继续制作前对照历史问题和来源交接，确认内容限定与动作修订是否应同步。

- [制作总规范](视频制作总规范.md)、[风格与转化](Vibe风格与内容转化规范.md)、[四平台交接](四平台视频制作与交接方案.md)、[节奏与验收](视频节奏与验收规范.md)
- [单集任务单](单集制作任务单模板.md)、[制作核查清单](视频制作核查清单.md)、[发布复盘](视频发布复盘模板.md)、[踩坑记录](视频制作踩坑记录.md)
- [第五、六集策划](planning/选题总览与交接.md)、[发给竖屏会话](planning/转发给竖屏会话.txt)、[发给横屏会话](planning/转发给横屏会话.txt)
- [跨电脑继续工作](docs/跨电脑接续.md)、[独立复查会话话术](docs/独立复查会话话术.md)
- [公开范围及素材许可](docs/公开范围与素材许可.md)、迁移验证（历史引用：`docs/迁移验证.md`；未随本仓库分发）

`project.json`是本仓库的可运行版本索引；`provenance.json`记录复制前的来源摘要；`history/`和工程内旧清单是历史证据，不是新版本通过证明。`historical-workspace`表示原本地档案标识，不是需要创建的目录。

## 协作与许可

换电脑前提交并推送代码与文档；换电脑后先 `git pull --ff-only`，重新prepare再核对项目索引。未入Git的自备配乐、最终视频和私有素材需另行备份，参见[接续说明](docs/跨电脑接续.md)。尚未有后台数据证明这些规范带来高转化。

项目自有代码和文档使用MIT许可，第三方来源与字体许可见[第三方声明](THIRD_PARTY_NOTICES.md)。保留上游作者的许可。账号名称和品牌标识不代表对第三方的背书。教育内容不替代针对具体孩子的专业判断。
