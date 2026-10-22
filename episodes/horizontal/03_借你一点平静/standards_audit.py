"""Record the actual coverage of v2 checks, including the older detector's blind spots."""
from pathlib import Path
import argparse,json,io,hashlib,math
from PIL import Image,ImageDraw
from playwright.sync_api import sync_playwright
from filmtools import server,browser,frame,sha
ROOT=Path(__file__).resolve().parents[1]
def dump(p,x):p.write_text(json.dumps(x,ensure_ascii=False,indent=2),encoding='utf-8')
def run(root):
 parent=ROOT.parent/'横屏BGM连贯修订_20261022/工程'/root.name
 plan=json.loads((root/'timeline.json').read_text(encoding='utf-8'))
 review=json.loads((root/'review/source_review.json').read_text(encoding='utf-8'))
 prior=json.loads((root/'review/source_audit.json').read_text(encoding='utf-8'))
 names=['timeline.json','music_sync.json','music_sync.js','字幕.srt','定稿文案.txt','audio/score.wav']
 if (root/'audio/foley_only.wav').exists():names+=['audio/foley_only.wav']
 if parent.exists():
  lock={'parent':str(parent),'sha256':{n:sha(parent/n) for n in names},'pace_normalized_sha256':sha(parent/'pace.js')}
  dump(root/'父版锁定输入.json',lock)
 else:lock=json.loads((root/'父版锁定输入.json').read_text(encoding='utf-8'))
 locked={n:sha(root/n)==lock['sha256'][n] for n in names}
 pace=(root/'pace.js').read_text(encoding='utf-8').replace('185,954,1550,91','185,958,1550,83').replace('960,998,51','960,998,45')
 if parent.exists():locked['pace_only_caption_size_changed']=pace==(parent/'pace.js').read_text(encoding='utf-8')
 else:
  # File hashes preserve CRLF, while read_text normalizes them; write a normalized hash too.
  locked['pace_only_caption_size_changed']=hashlib.sha256(pace.encode('utf-8')).hexdigest()==lock['pace_normalized_text_sha256']
 if parent.exists():
  lock['pace_normalized_text_sha256']=hashlib.sha256((parent/'pace.js').read_text(encoding='utf-8').encode('utf-8')).hexdigest();dump(root/'父版锁定输入.json',lock)
 assert all(locked.values()),locked
 d=root/'review/规范补查';d.mkdir(exist_ok=True)
 checked={round(t*2)/2 for t in prior['glyph_ink_sample_times']}
 excluded=[i/2 for i in range(math.ceil(plan['duration']*2)) if i/2 not in checked]
 alltimes=sorted(set([i/4 for i in range(math.ceil(plan['duration']*4))]+excluded+[t for t,_ in review['transition_action_times']]))
 srv,url=server(root);metrics=[];phone=[]
 try:
  with sync_playwright() as p:
   b,pg=browser(p,url)
   pg.evaluate(r'''()=>{window.auditText=[];const original=CanvasRenderingContext2D.prototype.fillText;CanvasRenderingContext2D.prototype.fillText=function(s,x,y,...rest){original.call(this,s,x,y,...rest);if(this!==g||this.globalAlpha<.2||!s)return;const m=this.measureText(s),z=this.getTransform();const p=[[x-m.actualBoundingBoxLeft,y-m.actualBoundingBoxAscent],[x+m.actualBoundingBoxRight,y-m.actualBoundingBoxAscent],[x+m.actualBoundingBoxRight,y+m.actualBoundingBoxDescent],[x-m.actualBoundingBoxLeft,y+m.actualBoundingBoxDescent]].map(([a,b])=>[z.a*a+z.c*b+z.e,z.b*a+z.d*b+z.f]);auditText.push({text:s,alpha:this.globalAlpha,display_font_px:parseFloat(this.font.match(/([0-9.]+)px/)[1])*Math.hypot(z.a,z.b)/4,box640:[Math.min(...p.map(v=>v[0]))/4,Math.min(...p.map(v=>v[1]))/4,Math.max(...p.map(v=>v[0]))/4,Math.max(...p.map(v=>v[1]))/4]})}}''')
   for t in alltimes:
    rows=pg.evaluate('t=>{auditText=[];window.seek(t);return auditText}',t);metrics.append({'time':t,'rows':rows})
   selected=[round((a+z)/2*60)/60 for a,z,_ in plan['subtitles']]+excluded
   for t in sorted(set(selected)):
    im=Image.open(io.BytesIO(frame(pg,t,True))).convert('RGB').resize((640,360),Image.Resampling.LANCZOS)
    f=d/f'phone_{t:08.4f}.png';im.save(f)
    overlay=im.copy().convert('RGBA');mask=Image.new('RGBA',overlay.size);draw=ImageDraw.Draw(mask)
    for box in [(0,0,640,18),(0,342,640,360),(0,18,32,342),(608,18,640,342)]:draw.rectangle(box,fill=(220,75,65,80))
    draw.rectangle((32,18,607,341),outline=(233,196,133,200),width=1);Image.alpha_composite(overlay,mask).convert('RGB').save(d/f'UI5pct_{t:08.4f}.png')
    phone.append({'time':t,'plain':f.name,'mask':f'UI5pct_{t:08.4f}.png','kind':'旧检测排除时点补查' if t in excluded else '字幕中点单帧'})
   b.close()
 finally:srv.shutdown()
 captions=[]
 for row in metrics:
  active=[s for a,z,s in plan['subtitles'] if a+.18<=row['time']<=z-.18]
  for text in row['rows']:
   if text['text'] in active:
    x0,y0,x1,y1=text['box640'];captions.append({'time':row['time'],**text,'inside_5pct':x0>=32 and x1<=608 and y0>=18 and y1<=342})
 assert all(x['inside_5pct'] for x in captions),[x for x in captions if not x['inside_5pct']]
 dump(d/'全画面文字测量.json',metrics)
 dump(d/'补查范围与方法.json',{'spec':'2026-10-22 v2.0','locked_content_checks':locked,'full_canvas_text_measurement_times':alltimes,'no_transition_exclusion_in_this_measurement':True,'legacy_excluded_half_second_times':excluded,'legacy_static_crop_original_pixels':[180,310,2380,1170],'legacy_static_crop_excludes':'顶部标题/外缘/大部分字幕与来源，低变化仅筛选候选，不判断意义','phone_frames':phone,'caption_ink_5pct_safe':all(x['inside_5pct'] for x in captions),'caption_samples':captions,'platform_UI':'5%内部预留模拟遮挡，未取得当前B站/头条真实播放器截图；UI覆盖未验证','full_normal_speed_viewing':False,'subjective_listening_seconds':0,'user_accepted':False})
 print(root.name,'STANDARDS',len(alltimes),'full-canvas text points;',len(excluded),'excluded times supplemented;',len(phone),'single phone frames',flush=True)
if __name__=='__main__':
 ap=argparse.ArgumentParser();ap.add_argument('root',type=Path);run(ap.parse_args().root.resolve())
