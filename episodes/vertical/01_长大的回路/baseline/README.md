# 第一集《长大的回路》重制工程

主题：孩子大脑发育简史。130秒无旁白原创动画。账号：不焦虑爸爸。
参考标准：第四集《家的底色》姿态优化版的字体、配色、人物完整性、横竖2K/60fps与完整交付。

## 文件
- episode.json / episode.js：题目、字幕、分镜数据；改字幕时须同步两者（JSON为文档数据，JS供画布使用）。
- scenes.js：本集独立镜头与调度；art.js：本集讲解图形与道具。
- people.js：沿用第四集修订过的原创人物绘制函数，添加回应嘴型；未使用的旧场景函数不在本片调用。
- engine.js / film.js：确定性seek(t)、字体、纹理、字幕、画幅与封面。
- assets/：Noto中文字体及OFL许可；audio/score.wav：连续130秒音乐。
- facts.md / storyboard.md：论点、文献、边界与逐镜脚本。

## 依赖与重渲染
Python 3.11+、Chrome、ffmpeg、ffprobe（命令可从PATH找到）。
pip install -r requirements.txt
python render.py --serve
python font_check.py .
python text_layout_audit.py .
python render.py --review
python visual_check.py . --label final
python render.py --render vertical --jobs 4
python render.py --render horizontal --jobs 4
python qa.py --technical-only
python check_exports.py .
python package_episode.py .

渲染通过Canvas逐帧输出，时间只由seek(t)决定；没有屏幕录制或旁白。
导出1440×2560与2560×1440、60fps、H.264/yuv420p/BT.709 limited、AAC 48kHz双声道。
在修改任何画面源文件后，必须重做review、visual_check、横竖全片与qa，再打包。打包程序会拒绝早于源文件的成片和检查记录。
本片没有对外发布。音乐来源与使用边界在audio/BGM来源说明.md。
