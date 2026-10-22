"""Package only validated deliverables; keep intermediate renders out of the ZIP."""
from pathlib import Path
import hashlib,json,shutil,subprocess,zipfile
from PIL import Image

ROOT=Path(__file__).resolve().parent
OUT=ROOT/'发布包_姿态优化版'
OUT.mkdir(exist_ok=True)
checks=json.loads((ROOT/'review/validation.json').read_text(encoding='utf-8'))
assert {r['file'] for r in checks}=={'final_vertical.mp4','final_horizontal.mp4'} and len(checks)==2 and all(r['passed'] for r in checks)
visual=json.loads((ROOT/'review/determinism.json').read_text(encoding='utf-8'))
assert all(r['deterministic'] and r['frames_reviewed']==30 for r in visual.values())
visual_revision=max((ROOT/name).stat().st_mtime_ns for name in ['engine.js','art.js','scenes.js','film.js','index.html'])
assert (ROOT/'review/determinism.json').stat().st_mtime_ns>=visual_revision,'Visual review predates the current scene sources; rerun --review.'
for name in ['renders/final_vertical.mp4','renders/final_horizontal.mp4','cover_vertical.png','cover_xiaohongshu_3x4.png','cover_horizontal.png']:
    assert (ROOT/name).stat().st_mtime_ns>=visual_revision,f'{name} predates the current scene sources; rerender before packaging.'
rows=[]
for r in checks:
    v=r['video'];a=r['measured_loudness']
    rows.append(f"| {r['file']} | {v['width']}×{v['height']} | 60 | {v['nb_frames']} | {a['input_i']} LUFS | {a['input_tp']} dBTP | 全部通过 |")
report='''# 第四集《家的底色》质检说明

检查日期：2026-10-20。

本集输出 2 分 10 秒，横竖画面单独排版，2K 分辨率、60 fps。无旁白，连续使用用户选定的 GitHub 参考音轨前 130 秒，移除了来源视频末尾的提示音。

## 画面修订与检查

- 第一轮：人物与日历偏小。增加纸张俯视近景，调整孩子自责、安抚与协商段落的镜头距离。
- 第二轮：横屏标题与对话框重叠，画纸中的线条越过纸边。重新安排横屏镜头与话框，修正画纸内图案尺寸和裁切。
- 第三轮：对齐站立人物的脚部位置，修正桌面纸张的透视，去掉封面人物透明叠加。
- 发型修订：孩子单独使用更饱满的短发轮廓，覆盖头顶露出的肤色弧线；添加自然刘海与轻微发丝纹理，复查偏头、近景与安抚场景。横竖视频和三种封面同步更新。
- 姿态修订：重新安排夫妻肩、肘、腕的连接，前臂自然朝向对方或孩子；桌边手掌与手臂相接，并检查姿态变化的衔接。保留已经完成的孩子发型修订。
- 修订后重新导出两种画幅各 30 张关键帧，以及全部 11 处章节转场和 3 处内部镜头变化的前后帧。检查标题、话框、引用与字幕的关系。
- 两种画幅分别检查 9 个非顺序 seek 时间点，重复渲染的 PNG 哈希一致。

视觉检查方式为关键帧与转场表检查；没有逐秒人工播放观看。两条最终主片均完整解码检查，未检出损坏帧或解码错误。

## 最终媒体数据

| 文件 | 分辨率 | fps | 总帧数 | 综合响度 | 真峰值 | 结果 |
|---|---:|---:|---:|---:|---:|---|
'''+ '\n'.join(rows)+'''

已核对：时长 130 秒、音画时长差小于 0.05 秒、H.264、yuv420p、BT.709 limited、AAC 48 kHz 双声道、完整解码与音频峰值。来源音乐为单声道，双声道输出用于兼容，不声称恢复了立体声信息。

字幕已烧录；SRT 按同一份时间表导出。封面包含 9:16、3:4、16:9 三种尺寸。发布包另附无音轨版本供平台内加音乐，打包脚本会检查它的帧数、时长并完整解码。

内容表达已经核对原始研究摘要与 AAP 官方建议；人物与对话是演示，影响存在个体差异。完整来源与表达边界见“内容来源.md”。

压缩包写入后检查 ZIP CRC，文件 SHA-256 列于“SHA256校验.txt”。
'''
(ROOT/'质检说明.md').write_text(report,encoding='utf-8')

mapping={
    'renders/final_vertical.mp4':'第四集_竖屏完整版.mp4',
    'renders/final_horizontal.mp4':'第四集_横屏完整版.mp4',
    '标题文案.txt':'标题文案.txt',
    '字幕.srt':'字幕.srt',
    'facts.md':'内容来源.md',
    'audio/BGM来源说明.md':'BGM来源说明.md',
    'review/validation.json':'媒体质检数据.json',
    '质检说明.md':'质检说明.md',
}
for src,name in mapping.items():
    source=ROOT/src
    if source.suffix=='.mp4':
        match=next(r for r in checks if r['file']==source.name)
        assert hashlib.sha256(source.read_bytes()).hexdigest()==match['sha256']
    shutil.copy2(source,OUT/name)

cover_mapping=[('cover_vertical.png','封面_抖音_9x16.jpg'),('cover_xiaohongshu_3x4.png','封面_小红书_3x4.jpg'),('cover_horizontal.png','封面_横屏_16x9.jpg')]
for src,name in cover_mapping:
    im=Image.open(ROOT/src).convert('RGB')
    im.save(OUT/name,quality=96,subsampling=0)

silent=OUT/'平台加音乐版_竖屏.mp4'
subprocess.run(['ffmpeg','-v','error','-y','-i',str(ROOT/'renders/final_vertical.mp4'),'-map','0:v:0','-c:v','copy','-an','-movflags','+faststart',str(silent)],check=True)
meta=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(silent)]))
assert len(meta['streams'])==1
v=meta['streams'][0]
assert (v['width'],v['height'],v['avg_frame_rate'],int(v['nb_frames']))==(1440,2560,'60/1',7800)
assert abs(float(meta['format']['duration'])-130)<.05
decode=subprocess.run(['ffmpeg','-v','error','-i',str(silent),'-f','null','-'],capture_output=True,encoding='utf-8',errors='replace')
assert decode.returncode==0 and not decode.stderr.strip()

readme='''第四集《家的底色》发布包（姿态优化版）

优先上传“第四集_竖屏完整版.mp4”：1440×2560、60fps、2分10秒，已含 GitHub 参考配乐。
抖音配 9:16 封面，小红书配 3:4 封面。
标题与正文、统一话题、置顶评论都在“标题文案.txt”。
横屏文件为 2560×1440、60fps，可用于横屏渠道或备份。
“平台加音乐版_竖屏.mp4”是同一画面但没有音轨，可在平台内添加音乐。
字幕已烧录在画面里，SRT 是额外备份，正常发布不需要再导入一遍。
完整片尾已包含：关注不焦虑爸爸 / 陪孩子长大，也陪自己成长。
本版调整夫妻手臂的肩肘腕连接与弯曲方向，并保留孩子的饱满短发、自然刘海修订。

内容来源、音乐来源与质检数据另附。音乐来源说明不构成授权证明。
'''
(OUT/'先读我.txt').write_text(readme,encoding='utf-8-sig')

deliverables=sorted([*mapping.values(),*(name for _,name in cover_mapping),silent.name,'先读我.txt'])
assert len(deliverables)==len(set(deliverables))
assert all((OUT/name).is_file() for name in deliverables)
manifest='\n'.join(hashlib.sha256((OUT/name).read_bytes()).hexdigest()+'  '+name for name in deliverables)+'\n'
(OUT/'SHA256校验.txt').write_text(manifest,encoding='utf-8-sig')
deliverables=sorted([*deliverables,'SHA256校验.txt'])
archive=ROOT/'第四集_家的底色_姿态优化版发布包.zip'
temporary_archive=archive.with_suffix('.zip.tmp')
with zipfile.ZipFile(temporary_archive,'w',zipfile.ZIP_DEFLATED,compresslevel=5) as z:
    for name in deliverables:z.write(OUT/name,arcname='第四集_家的底色_姿态优化版/'+name)
with zipfile.ZipFile(temporary_archive) as z:
    assert z.testzip() is None
temporary_archive.replace(archive)
print(json.dumps({'zip':str(archive),'MB':round(archive.stat().st_size/1024**2,1),'files':deliverables},ensure_ascii=False,indent=2))
