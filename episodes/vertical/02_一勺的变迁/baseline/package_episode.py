"""Package one final, validated revision; verify ZIP CRC and payload digests."""
from pathlib import Path
import argparse,hashlib,json,shutil,subprocess,zipfile
from PIL import Image,ImageDraw,ImageFont

def sha(p):
    h=hashlib.sha256()
    with p.open('rb') as f:
        for chunk in iter(lambda:f.read(1024*1024),b''):h.update(chunk)
    return h.hexdigest()
def stamp(t):
    n=round(t*1000);return f'{n//3600000:02d}:{n//60000%60:02d}:{n//1000%60:02d},{n%1000:03d}'
def package(root):
    e=json.loads((root/'episode.json').read_text(encoding='utf-8'));no=e['no'];out=root/'发布包_重制版';out.mkdir(exist_ok=True)
    results=json.loads((root/'review/validation.json').read_text(encoding='utf-8'))
    assert len(results)==2 and all(r['passed'] for r in results)
    revision=max((root/f).stat().st_mtime_ns for f in ['engine.js','people.js','episode.js','art.js','scenes.js','film.js','index.html'])
    visual=json.loads((root/'review/final/evidence.json').read_text(encoding='utf-8'))
    assert all(v['deterministic'] and v['repeat_points']==12 for v in visual.values())
    assert (root/'review/final/evidence.json').stat().st_mtime_ns>revision
    for f in ['renders/final_vertical.mp4','renders/final_horizontal.mp4','cover_vertical.png','cover_horizontal.png','cover_xiaohongshu_3x4.png']:
        assert (root/f).stat().st_mtime_ns>revision,f+' predates final source'
    for result in results:assert sha(root/'renders'/result['file'])==result['sha256']
    srt='\n\n'.join(f'{i+1}\n{stamp(a)} --> {stamp(b)}\n{s}' for i,(a,b,s) in enumerate(e['subs']))+'\n'
    (root/'字幕.srt').write_text(srt,encoding='utf-8-sig')
    corrections=(
      '第一轮：修复摇铃悬空，让把手与婴儿手掌接触并随手臂移动；重算孩子搭积木的肩、肘、腕与积木位置，去掉重复手臂；横屏脑部插图避开标题。第二轮：修整非活动手臂，神经管到脑部的叠化不再留下贯穿脑体的长条；保留突触间隙，弱化的是连接而非神经元细胞体。第三轮：最终MP4放大复查发现横屏神经元、突触修剪、髓鞘化三处图示说明与出处过近；向上移动图示说明，按真实字形边界复查，再重新导出两种画幅。'
      if no=='第一集' else
      '第一轮：2000年手册中的花生罐、适用人群与3岁数字分开，移除重叠文字；降低横屏图表尺寸，图题与章节标题分开；月份尺与出处留出间距。第二轮：花生酱由浓稠到调稀的外形、颜色连续变化，液滴落到勺中；成坨浓酱与整颗花生的风险图形保留，旧建议撤回与现行路径分开。第三轮：文字边界检查发现55秒附近，旧建议纸条淡出时新说明出现偏早；错开二者显现时间，避免叠字，再重新导出两种画幅。')
    lines=[f'# {no}《{e["title"]}》质检说明','', '检查日期：2026-10-21。','',
      '## 视觉检查与修订','',corrections,'',
      '最终定稿分别对横屏、竖屏输出30张全片代表画面，并检查章节边界与内部动作节点的前、中、后状态。关键时间点另输出大图，复查人物头发、肩肘腕、道具接触、标注与字幕。',
      '两集各有开头30秒样片；定稿后从同一份源文件重新渲染横竖完整版及三种封面。两种画幅各12个乱序seek时间点重复输出PNG，SHA-256一致。',
      '本次为代表帧、动作节点与转场表的人工视觉检查，及最终文件抽帧检查；没有逐秒人工观看，也没有完整人工试听。音频沿用第四集已处理的连续130秒定稿WAV，另做客观响度与真峰值测量。',
      '', '## 实际媒体数据','', '| 文件 | 分辨率 | 帧率/帧数 | LUFS | 真峰值dBTP | 完整解码 |','|---|---|---|---|---|---|']
    for r in results:
        v=r['video'];l=r['measured_loudness'];lines.append(f'| {r["file"]} | {v["width"]}×{v["height"]} | 60 / {v["nb_frames"]} | {l["input_i"]} | {l["input_tp"]} | 通过 |')
    lines+=['','两条视频均为130秒、H.264、yuv420p、BT.709 limited；AAC 48kHz双声道。音源本来是单声道，双声道输出用于兼容。无BGM版直接复制同一视频流，故画面及帧数一致。',
      '音画时长、分辨率、帧率、帧数、编码、色彩标记、音频通道/采样率已由ffprobe核验；每条最终主片与无BGM版均通过ffmpeg完整解码。',
      '', '## 内容与交付','',e['thesis'],
      '事实表标明了出处、适用范围与示意边界。图形是原创科普动画，不能当真实显微图、个体发育测量或个体喂养方案。',
      'SRT与烧录字幕来自同一时间表。ZIP写入后检查CRC，解包后的内容摘要与原文件逐项比对。发布包不含中间分段。音乐来源与使用信息单独说明。']
    (root/'质检说明.md').write_text('\n'.join(lines)+'\n',encoding='utf-8')
    audit=json.loads((root/'review/text_layout_audit.json').read_text(encoding='utf-8'));assert all(r['sampled_times']==30 and not r['overlaps'] for r in audit.values())
    exported=json.loads((root/'review/export_check.json').read_text(encoding='utf-8'));assert all(r['source_matches_encoded_stills'] and r['compared_frames']==13 for r in exported.values())
    assert (root/'review/export_check.json').stat().st_mtime_ns>revision
    assert (root/'review/text_layout_audit.json').stat().st_mtime_ns>revision
    mapping={'renders/final_vertical.mp4':no+'_竖屏完整版.mp4','renders/final_horizontal.mp4':no+'_横屏完整版.mp4','标题文案.txt':'标题文案.txt','字幕.srt':'字幕.srt','facts.md':'内容来源.md','audio/BGM来源说明.md':'BGM来源说明.md','质检说明.md':'质检说明.md','review/validation.json':'媒体质检数据.json','review/final/evidence.json':'画面检查数据.json','review/export_check.json':'最终成片抽帧比对.json','review/font_coverage.json':'字体覆盖检查.json','review/text_layout_audit.json':'文字边界检查.json'}
    for src,name in mapping.items():shutil.copy2(root/src,out/name)
    covers=[('cover_vertical.png','封面_抖音_9x16.jpg'),('cover_xiaohongshu_3x4.png','封面_小红书_3x4.jpg'),('cover_horizontal.png','封面_横屏_16x9.jpg')]
    for src,name in covers:Image.open(root/src).convert('RGB').save(out/name,quality=96,subsampling=0)
    silent=out/'平台加音乐版_竖屏.mp4'
    subprocess.run(['ffmpeg','-v','error','-y','-i',str(root/'renders/final_vertical.mp4'),'-map','0:v:0','-c:v','copy','-an','-movflags','+faststart',str(silent)],check=True)
    info=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(silent)]));assert len(info['streams'])==1
    v=info['streams'][0];assert(v['width'],v['height'],v['avg_frame_rate'],int(v['nb_frames']))==(1440,2560,'60/1',7800)
    assert abs(float(info['format']['duration'])-130)<.05
    r=subprocess.run(['ffmpeg','-v','error','-threads','2','-i',str(silent),'-f','null','-'],capture_output=True);assert r.returncode==0 and not r.stderr.strip()
    # Packet-data hashes prove that no-BGM export is the exact same encoded video.
    def packets(path):return subprocess.check_output(['ffmpeg','-v','error','-i',str(path),'-map','0:v:0','-c','copy','-f','hash','-hash','sha256','-']).strip().decode()
    assert packets(silent)==packets(root/'renders/final_vertical.mp4')
    (out/'先读我.txt').write_text(f'''{no}《{e['title']}》重制发布包

优先使用“{no}_竖屏完整版.mp4”，1440×2560、60fps、2分10秒，已含参考配乐。
抖音使用9:16封面，小红书使用3:4封面。横屏备份2560×1440，同为60fps。
“平台加音乐版_竖屏.mp4”没有音轨，供平台内另加音乐。字幕已烧录，SRT为备份，正常发布无需再导入一遍。
标题、两平台正文、话题和置顶评论在“标题文案.txt”。
片尾：关注不焦虑爸爸 / 陪孩子长大，也陪自己成长。
来源、音乐说明与实际检查方法另附。可修改工程另有独立ZIP。
''',encoding='utf-8-sig')
    names=sorted(list(mapping.values())+[name for _,name in covers]+['平台加音乐版_竖屏.mp4','先读我.txt'])
    (out/'SHA256校验.txt').write_text('\n'.join(sha(out/n)+'  '+n for n in names)+'\n',encoding='utf-8-sig');names+=['SHA256校验.txt']
    archive=root/(no+'_'+e['topic']+'_重制发布包.zip')
    with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED,compresslevel=3) as z:
        for name in names:z.write(out/name,arcname=out.name+'/'+name)
    with zipfile.ZipFile(archive) as z:
        assert z.testzip() is None
        for name in names:assert hashlib.sha256(z.read(out.name+'/'+name)).hexdigest()==sha(out/name)
    # Add all render/check/package scripts so the source bundle is self-contained.
    readme=f'''# {no}《{e['title']}》重制工程

主题：{e['topic']}。130秒无旁白原创动画。账号：不焦虑爸爸。
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
'''
    (root/'README.md').write_text(readme,encoding='utf-8')
    source_names=['README.md','requirements.txt','episode.json','episode.js','index.html','engine.js','people.js','art.js','scenes.js','film.js','render.py','qa.py','visual_check.py','font_check.py','text_layout_audit.py','check_exports.py','package_episode.py','facts.md','storyboard.md','标题文案.txt','字幕.srt','质检说明.md']
    source_files=[root/n for n in source_names]+list((root/'assets').glob('*'))+list((root/'audio').glob('*'))
    source_zip=root/(no+'_'+e['topic']+'_可修改工程.zip')
    with zipfile.ZipFile(source_zip,'w',zipfile.ZIP_DEFLATED,compresslevel=5) as z:
        for p in source_files:z.write(p,arcname=root.name+'/'+p.relative_to(root).as_posix())
    with zipfile.ZipFile(source_zip) as z:assert z.testzip() is None
    summary={'episode':no,'publish_zip':str(archive),'source_zip':str(source_zip),'publication_MB':round(archive.stat().st_size/1024**2,1),'source_MB':round(source_zip.stat().st_size/1024**2,1),'files':names,'silent_video_stream_identical':True}
    (root/'交付记录.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2),encoding='utf-8');print(json.dumps(summary,ensure_ascii=False),flush=True)

if __name__=='__main__':
    ap=argparse.ArgumentParser();ap.add_argument('root');args=ap.parse_args();package(Path(args.root).resolve())
