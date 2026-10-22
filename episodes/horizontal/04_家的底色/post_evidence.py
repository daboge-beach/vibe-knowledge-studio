from pathlib import Path
import sys,json,subprocess,shutil,hashlib
import numpy as np
from PIL import Image,ImageDraw
from cue_frames import supplement
from audio_export import audition
from covers_export import export
from filmtools import sha,fingerprint
def run(root):
 supplement(root);audition(root);export(root)
 q=json.loads((root/'review/final_validation.json').read_text(encoding='utf-8'));plan=json.loads((root/'timeline.json').read_text(encoding='utf-8'));d=root/'review/最终手机单帧';d.mkdir(exist_ok=True);points=[]
 for i,(a,b,s) in enumerate(plan['subtitles']):
  t=round((a+b)/2*60)/60;src=root/'review'/f'final_{t:08.4f}.jpg';assert src.exists()
  im=Image.open(src).convert('RGB').resize((640,360),Image.Resampling.LANCZOS);f=d/f'{i+1:02d}_{t:08.4f}.png';im.save(f)
  mask=Image.new('RGBA',(640,360));draw=ImageDraw.Draw(mask)
  for box in [(0,0,640,18),(0,342,640,360),(0,18,32,342),(608,18,640,342)]:draw.rectangle(box,fill=(220,75,65,80))
  Image.alpha_composite(im.convert('RGBA'),mask).convert('RGB').save(d/f'UI5pct_{i+1:02d}_{t:08.4f}.png');points.append({'time':t,'text':s,'file':f.name,'final_mp4_sha256':q['media'][0]['sha256']})
 (d/'索引.json').write_text(json.dumps(points,ensure_ascii=False,indent=2),encoding='utf-8')
 # Verify the silent/foley version actually contains the same newly rendered video stream.
 videos=[]
 for m in q['media']:
  path=root/'renders'/m['name'];v=subprocess.run(['ffmpeg','-v','error','-i',str(path),'-map','0:v:0','-c','copy','-f','h264','-'],capture_output=True,check=True).stdout;videos.append(hashlib.sha256(v).hexdigest())
  r=subprocess.run(['ffmpeg','-hide_banner','-i',str(path),'-vn','-af','loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json','-f','null','-'],capture_output=True,check=True)
  (root/'review'/(path.stem+'_响度原始日志.txt')).write_bytes(r.stderr)
 assert videos[0]==videos[1]
 no=root/'renders'/q['media'][1]['name'];raw=subprocess.run(['ffmpeg','-v','error','-i',str(no),'-vn','-ar','48000','-ac','2','-f','f32le','-'],capture_output=True,check=True).stdout;mx=float(abs(np.frombuffer(raw,dtype='<f4')).max())
 if not root.name.startswith('03'):assert mx==0
 baseline=Path(json.loads((root/'baseline_manifest.json').read_text(encoding='utf-8'))['latest_project'])/'renders/final_vertical.mp4';t=points[min(5,len(points)-1)]['time']
 if baseline.exists():
  out=root/'review/同内容竖屏对照.png';subprocess.run(['ffmpeg','-v','error','-y','-ss',str(t),'-i',str(baseline),'-frames:v','1',str(out)],check=True)
  v=Image.open(out).convert('RGB').resize((360,640));h=Image.open(root/'review'/f'final_{t:08.4f}.jpg').convert('RGB').resize((640,360));both=Image.new('RGB',(1030,690),'#111d20');both.paste(v,(10,40));both.paste(h,(380,170));dr=ImageDraw.Draw(both);dr.text((10,10),f'Locked vertical baseline {t:.3f}s',fill='#fff1da');dr.text((380,140),'Editable landscape v3.1 - same content clock',fill='#fff1da');both.save(out)
 result={'version_id':fingerprint(root),'final_media_sha256':[m['sha256'] for m in q['media']],'both_final_video_elementary_sha256':videos,'main_noBGM_same_video_stream':True,'decoded_noBGM_peak':mx,'noBGM_type':'新版木块音效' if root.name.startswith('03') else '静音AAC轨，实际解码全零','final_phone_subtitle_frames':points,'platform_actual_UI_verified':False,'full_normal_speed_human_viewing':False,'subjective_listening_seconds':0,'user_accepted':False}
 (root/'review/补充成片证据.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8');print(root.name,'POST EVIDENCE COMPLETE',len(points),'final phone frames',flush=True)
if __name__=='__main__':run(Path(sys.argv[1]).resolve())
