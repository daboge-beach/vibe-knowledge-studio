"""Export subtitles, inspect all transition boundaries, validate mastered files."""
from pathlib import Path
import base64, concurrent.futures, hashlib, io, json, subprocess, sys
from PIL import Image, ImageDraw
from playwright.sync_api import sync_playwright
import render
ROOT=Path(__file__).resolve().parent

def tc(t):
    n=round(t*1000);return f'{n//3600000:02d}:{n//60000%60:02d}:{n//1000%60:02d},{n%1000:03d}'

def visual():
    srv,url=render.server()
    try:
        with sync_playwright() as p:
            for mode in ['vertical','horizontal']:
                b,pg=render.browser(p,url,mode)
                subs=pg.evaluate('window.SUBS')
                if mode=='vertical':
                    srt='\n\n'.join(f'{i+1}\n{tc(a)} --> {tc(z)}\n{s}' for i,(a,z,s) in enumerate(subs))+'\n'
                    (ROOT/'字幕.srt').write_text(srt,encoding='utf-8-sig')
                cuts=pg.evaluate('window.SCENES.slice(1)')+[3.2,41.1,111.8]
                cuts=sorted(cuts)
                tw,th=(180,320) if mode=='vertical' else (320,180)
                sheet=Image.new('RGB',(tw*4,(th+24)*len(cuts)),'#101612');draw=ImageDraw.Draw(sheet)
                for row,t in enumerate(cuts):
                    for col,d in enumerate([-.03,.15,.45,.72]):
                        ts=t+d;im=Image.open(io.BytesIO(render.frame(pg,ts,True))).convert('RGB');im.thumbnail((tw,th));x,y=col*tw,row*(th+24);sheet.paste(im,(x,y));draw.text((x+7,y+th+4),f'{ts:.2f}s',fill='#edc883')
                sheet.save(ROOT/f'review/transitions_{mode}.jpg',quality=92)
                b.close()
    finally:srv.shutdown()

def technical(path):
    raw=subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(path)])
    info=json.loads(raw);v=next(s for s in info['streams'] if s['codec_type']=='video');a=next(s for s in info['streams'] if s['codec_type']=='audio')
    decode=subprocess.run(['ffmpeg','-v','error','-threads','2','-i',str(path),'-f','null','-'],capture_output=True,text=True,encoding='utf-8',errors='replace')
    loud=subprocess.run(['ffmpeg','-hide_banner','-i',str(path),'-af','loudnorm=I=-16:TP=-1.5:LRA=9:print_format=json','-f','null','-'],capture_output=True,text=True,encoding='utf-8',errors='replace')
    l=json.JSONDecoder().raw_decode(loud.stderr[loud.stderr.rfind('{'):])[0]
    expected=[1440,2560] if 'vertical' in path.name else [2560,1440]
    checks={'size':[v['width'],v['height']]==expected,'frames':int(v['nb_frames'])==7800,'fps':v['avg_frame_rate']=='60/1','duration':abs(float(info['format']['duration'])-130)<.05,'av_duration_match':abs(float(v['duration'])-float(a['duration']))<.05,'h264':v['codec_name']=='h264','pixel_format':v['pix_fmt']=='yuv420p','limited_range':v.get('color_range')=='tv','bt709':v.get('color_space')=='bt709','aac_stereo':a['codec_name']=='aac' and a['channels']==2 and a['sample_rate']=='48000','complete_decode':decode.returncode==0 and not decode.stderr.strip(),'loudness':-16<float(l['input_i'])<-12,'no_clipping':float(l['input_tp'])<=-1.5}
    return {'file':path.name,'passed':all(checks.values()),'checks':checks,'bytes':path.stat().st_size,'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'video':{k:v.get(k) for k in ['width','height','codec_name','profile','pix_fmt','color_range','color_space','avg_frame_rate','nb_frames','duration']},'audio':{k:a.get(k) for k in ['codec_name','channels','sample_rate','duration']},'measured_loudness':l,'decode_errors':decode.stderr}

if __name__=='__main__':
    if '--technical-only' not in sys.argv:visual()
    files=[ROOT/'renders/final_vertical.mp4',ROOT/'renders/final_horizontal.mp4']
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:results=list(pool.map(technical,files))
    (ROOT/'review/validation.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps([{'file':r['file'],'passed':r['passed'],'checks':r['checks'],'LUFS':r['measured_loudness']['input_i']} for r in results],ensure_ascii=False,indent=2),flush=True)
    if not all(r['passed'] for r in results):raise SystemExit('Media validation failed')
