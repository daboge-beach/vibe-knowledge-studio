"""Create the verified publishing bundle. Leaves the editable project in place."""
from pathlib import Path
import hashlib,json,shutil,subprocess,zipfile
ROOT=Path(__file__).resolve().parent
verified=json.loads((ROOT/'review/validation.json').read_text(encoding='utf-8'))
assert all(x['passed'] for x in verified)
for item in verified:
    assert hashlib.sha256((ROOT/'renders'/item['file']).read_bytes()).hexdigest()==item['sha256']
dest=ROOT/'发布包_关注版';dest.mkdir(exist_ok=True)
files={
    'renders/final_vertical.mp4':'抖音小红书_竖屏_关注版.mp4',
    'renders/final_horizontal.mp4':'横屏_关注版.mp4',
    'renders/vertical_platform_music.mp4':'平台加音乐版_竖屏_关注版.mp4',
    'cover_vertical.png':'封面_抖音9比16.png',
    'cover_xiaohongshu_3x4.png':'封面_小红书3比4.png',
    'publishing.md':'发布文案与说明.md',
    '字幕.srt':'字幕.srt',
    'facts.md':'事实来源.md',
    'review/QA.md':'检查记录.md',
    'review/validation.json':'媒体校验.json',
    'audio/BGM来源说明.md':'BGM来源说明.md',
}
for src,target in files.items():shutil.copy2(ROOT/src,dest/target)
zip_path=ROOT/'借你一点平静_GitHub配乐_关注版发布包.zip'
with zipfile.ZipFile(zip_path,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
    for file in sorted(dest.iterdir()):z.write(file,arcname='借你一点平静_发布包/'+file.name)
with zipfile.ZipFile(zip_path) as z:assert z.testzip() is None
# Refresh the 30-second sample from the final revision, rather than leaving an early draft.
subprocess.run(['ffmpeg','-v','error','-y','-i',str(ROOT/'renders/final_vertical.mp4'),'-t','30','-c','copy',str(ROOT/'renders/vertical_preview_30s.mp4')],check=True)
print(zip_path,zip_path.stat().st_size,flush=True)
print(json.dumps([{'name':p.name,'bytes':p.stat().st_size} for p in dest.iterdir()],ensure_ascii=False,indent=2),flush=True)
