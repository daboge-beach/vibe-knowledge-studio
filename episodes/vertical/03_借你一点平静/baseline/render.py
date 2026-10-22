"""Deterministic offline Canvas rendering. No screen recording.
python render.py --review
python render.py --render vertical --jobs 4
python render.py --render horizontal --jobs 4
python render.py --serve
"""
import argparse, base64, concurrent.futures, hashlib, http.server, io, json, math, subprocess, threading, time
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parent
FPS=30
DURATION=130
class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self,*a,**kw): super().__init__(*a,directory=str(ROOT),**kw)
    def log_message(self,*a): pass
    def copyfile(self,source,outputfile):
        try:super().copyfile(source,outputfile)
        except (ConnectionResetError,BrokenPipeError):pass

def server():
    s=http.server.ThreadingHTTPServer(('127.0.0.1',0),Handler)
    threading.Thread(target=s.serve_forever,daemon=True).start()
    return s,f'http://127.0.0.1:{s.server_address[1]}/'

def browser(p,url,mode):
    b=p.chromium.launch(channel='chrome',headless=True,args=['--disable-lcd-text','--force-color-profile=srgb','--disable-background-timer-throttling'])
    pg=b.new_page(viewport={'width':1080 if mode=='vertical' else 1920,'height':1920 if mode=='vertical' else 1080},device_scale_factor=1)
    pg.on('pageerror',lambda e:print('PAGE ERROR',str(e),flush=True))
    pg.goto(url+'?mode='+mode)
    pg.wait_for_function('window.READY === true',timeout=120000)
    return b,pg

def frame(pg,t,png=False):
    raw=pg.evaluate('([t,png])=>{seek(t);return document.getElementById("c").toDataURL(png?"image/png":"image/jpeg",.95).split(",")[1]}',[t,png])
    return base64.b64decode(raw)

def review(url):
    (ROOT/'review').mkdir(exist_ok=True)
    ts=[1.8,5.8,10,16,21.5,26,32,38.5,44.5,49.5,54.5,62,67,72.5,77,82,86.5,91.5,97,101.5,106.5,111.5,116,123]
    report={}
    with sync_playwright() as p:
        for mode in ['vertical','horizontal']:
            b,pg=browser(p,url,mode)
            thumbs=[]
            for t in ts:
                data=frame(pg,t,True)
                path=ROOT/f'review/{mode}_{t:05.1f}.png'
                path.write_bytes(data)
                im=Image.open(io.BytesIO(data)).convert('RGB')
                im.thumbnail((270,480) if mode=='vertical' else (480,270))
                thumbs.append(im.copy())
            tw,th=thumbs[0].size
            sheet=Image.new('RGB',(tw*6,(th+28)*4),'#131815')
            d=ImageDraw.Draw(sheet)
            for i,im in enumerate(thumbs):
                x,y=i%6*tw,i//6*(th+28)
                sheet.paste(im,(x,y));d.text((x+8,y+th+5),f'{ts[i]:05.1f}s',fill='#edc883')
            sheet.save(ROOT/f'review/{mode}_sheet.jpg',quality=93)
            hashes={t:hashlib.sha256(frame(pg,t,True)).hexdigest() for t in [1.8,16,26,38.5,54.5,67,91.5,106.5,123]}
            report[mode]={'deterministic':all(hashlib.sha256(frame(pg,t,True)).hexdigest()==hashes[t] for t in reversed(hashes)),'frames_reviewed':len(ts),'size':pg.evaluate('[c.width,c.height]')}
            pg.evaluate('cover()')
            (ROOT/f'cover_{mode}.png').write_bytes(base64.b64decode(pg.evaluate('c.toDataURL("image/png").split(",")[1]')))
            if mode=='vertical':
                # A separately laid-out 3:4 cover, not a crop of subtitles.
                data=pg.evaluate('''()=>{const z=document.createElement('canvas');z.width=1080;z.height=1440;const q=z.getContext('2d');q.fillStyle='#132019';q.fillRect(0,0,1080,1440);q.drawImage(c,0,0,1080,1440,0,0,1080,1440);q.fillStyle='#132019';q.fillRect(0,1280,1080,160);q.fillStyle='#edc883';q.font='500 39px NotoSans';q.textAlign='center';q.fillText('先稳住 · 再连接 · 后解决',540,1360);return z.toDataURL('image/png').split(',')[1]}''')
                (ROOT/'cover_xiaohongshu_3x4.png').write_bytes(base64.b64decode(data))
            b.close()
    (ROOT/'review/determinism.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps(report,ensure_ascii=False),flush=True)

def segment(url,mode,a,b,out):
    start=time.monotonic()
    with sync_playwright() as p:
        br,pg=browser(p,url,mode)
        cmd=['ffmpeg','-hide_banner','-loglevel','error','-y','-f','image2pipe','-vcodec','mjpeg','-framerate',str(FPS),'-i','-','-an','-vf','scale=in_range=full:out_range=limited,format=yuv420p','-c:v','libx264','-threads','2','-crf','16','-preset','fast','-pix_fmt','yuv420p','-color_range','tv','-color_primaries','bt709','-color_trc','bt709','-colorspace','bt709','-movflags','+faststart',str(out)]
        enc=subprocess.Popen(cmd,stdin=subprocess.PIPE)
        try:
            n0,n1=round(a*FPS),round(b*FPS)
            for n in range(n0,n1):
                enc.stdin.write(frame(pg,n/FPS))
                if (n-n0)%300==0: print(f'{mode} {a:g}-{b:g}s: {n-n0}/{n1-n0}',flush=True)
        finally:
            enc.stdin.close();code=enc.wait();br.close()
        if code: raise RuntimeError(f'ffmpeg exit {code}')
    print(f'DONE {out.name}, {time.monotonic()-start:.1f}s',flush=True)

def render(url,mode,jobs,clip=None):
    output=ROOT/'renders';output.mkdir(exist_ok=True)
    a,b=clip if clip else (0,DURATION)
    cuts=[round((a+(b-a)*i/jobs)*FPS)/FPS for i in range(jobs+1)]
    parts=[output/f'{mode}_part{i:02d}.mp4' for i in range(jobs)]
    with concurrent.futures.ThreadPoolExecutor(max_workers=jobs) as pool:
        futures=[pool.submit(segment,url,mode,cuts[i],cuts[i+1],parts[i]) for i in range(jobs)]
        for f in futures:f.result()
    listing=output/f'{mode}_parts.txt'
    listing.write_text(''.join(f"file '{p.as_posix()}'\n" for p in parts),encoding='utf-8')
    raw=output/f'{mode}_raw.mp4'
    subprocess.run(['ffmpeg','-v','error','-y','-f','concat','-safe','0','-i',str(listing),'-c','copy',str(raw)],check=True)
    name=f'{mode}_preview_30s.mp4' if clip else f'final_{mode}.mp4'
    subprocess.run(['ffmpeg','-v','error','-y','-i',str(raw),'-ss',str(a),'-i',str(ROOT/'audio/score.wav'),'-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-b:a','320k','-ar','48000','-t',str(b-a),'-movflags','+faststart',str(output/name)],check=True)
    print('FINAL',output/name,flush=True)

if __name__=='__main__':
    ap=argparse.ArgumentParser();ap.add_argument('--review',action='store_true');ap.add_argument('--render',choices=['vertical','horizontal']);ap.add_argument('--jobs',type=int,default=4);ap.add_argument('--clip',nargs=2,type=float);ap.add_argument('--serve',action='store_true');args=ap.parse_args()
    srv,url=server()
    try:
        if args.serve:
            print(url,flush=True)
            while True:threading.Event().wait(30)
        if args.review:review(url)
        if args.render:render(url,args.render,args.jobs,args.clip)
    finally:srv.shutdown()
