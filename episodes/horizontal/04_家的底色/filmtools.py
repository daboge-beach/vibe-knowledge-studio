"""Deterministic paced source rendering; locked timeline and new WAV mix."""
from pathlib import Path
import argparse,base64,concurrent.futures,hashlib,http.server,io,json,math,re,shutil,subprocess,threading,time
from PIL import Image,ImageDraw,ImageFont
from playwright.sync_api import sync_playwright
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def run(args):return subprocess.run(args,capture_output=True,check=True)
def probe(p):return json.loads(run(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(p)]).stdout)
class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self,*a,root,**kw):super().__init__(*a,directory=str(root),**kw)
    def log_message(self,*a):pass
    def end_headers(self):self.send_header('Cache-Control','no-store, max-age=0');super().end_headers()
    def copyfile(self,src,out):
        try:super().copyfile(src,out)
        except (ConnectionResetError,ConnectionAbortedError,BrokenPipeError):pass
def server(root):
    srv=http.server.ThreadingHTTPServer(('127.0.0.1',0),lambda *a,**kw:Handler(*a,root=root,**kw));threading.Thread(target=srv.serve_forever,daemon=True).start();return srv,f'http://127.0.0.1:{srv.server_port}/'
def seal(root):
    root=Path(root).resolve();shared=Path(__file__).resolve().parent
    for n in ['filmtools.py','quality.py','audio_checks.py','covers_export.py']:
        if (shared/n).resolve()!=(root/n).resolve():shutil.copy2(shared/n,root/n)
    (root/'render.py').write_text('from pathlib import Path\nimport sys\nfrom filmtools import main\nif __name__=="__main__":\n sys.argv.insert(1,str(Path(__file__).resolve().parent));main()\n',encoding='utf-8')
    html=(root/'index.html').read_text(encoding='utf-8')
    if 'music_sync.js' not in html:html=html.replace('<script src="pace.js"></script>','<script src="music_sync.js"></script><script src="pace.js"></script>')
    if 'runtime_version.js' not in html:html=html.replace('<script src="', '<script src="runtime_version.js"></script><script src="',1)
    html=re.sub(r'(<script src="[^"]+\.js)(\?v=[^"]+)?',r'\1',html)
    html=re.sub(r"new Audio\('audio/score.wav(?:\?v=[^']+)?'\)","new Audio('audio/score.wav')",html)
    html=html.replace('anchor+(now-origin)/1000','audio.currentTime')
    (root/'index.html').write_text(html,encoding='utf-8')
    files=[p for p in root.glob('*.js') if p.name!='runtime_version.js']+[root/'timeline.json',root/'music_sync.json',root/'filmtools.py']+list((root/'assets').glob('*'))+list((root/'audio').glob('*.wav'))
    hashes={p.relative_to(root).as_posix():sha(p) for p in sorted(files) if p.is_file()}
    plan=json.loads((root/'timeline.json').read_text(encoding='utf-8'));manifest={'version':'horizontal-standards-v3.1-20261022','duration':plan['duration'],'fps':60,'frames':round(plan['duration']*60),'content_mapping_count':1,'music_visual_mapping_count':1,'preview_template_sha256':hashlib.sha256(html.encode('utf-8')).hexdigest(),'inputs':hashes};manifest['id']=hashlib.sha256(json.dumps(manifest,sort_keys=True).encode()).hexdigest()
    (root/'runtime_version.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8');(root/'runtime_version.js').write_text('if(window.RENDER_VERSION)throw new Error("duplicate runtime version");window.RENDER_VERSION='+json.dumps(manifest,ensure_ascii=False,separators=(',',':'))+';',encoding='utf-8')
    def versioned(m):
        name=m.group(1);h=sha(root/name);return '<script src="'+name+'?v='+h[:16]+'"'
    html=re.sub(r'<script src="([^"]+\.js)"',versioned,html);html=html.replace("new Audio('audio/score.wav')","new Audio('audio/score.wav?v="+sha(root/'audio/score.wav')[:16]+"')")
    (root/'index.html').write_text(html,encoding='utf-8');return manifest
def browser(p,url):
    for attempt in range(3):
        b=p.chromium.launch(channel='chrome',headless=True,args=['--disable-lcd-text','--force-color-profile=srgb','--disable-background-timer-throttling']);pg=b.new_page(viewport={'width':1920,'height':1080})
        try:
            expected=pg.request.get(url+'runtime_version.json').json();errors=[];pg.on('pageerror',lambda e:errors.append(str(e)))
            pg.goto(url+'?mode=horizontal&offline=1&v='+expected['id']);pg.wait_for_function('window.READY&&window.LAYOUT_READY&&window.PACE_READY&&window.REFINE_READY&&window.MUSIC_SYNC_READY&&window.RENDER_VERSION&&document.fonts.status==="loaded"',timeout=45000)
            assert pg.evaluate('window.MAPPING_COUNT')==1 and pg.evaluate('window.MUSIC_SYNC_COUNT')==1
            assert pg.evaluate('window.RENDER_VERSION')==expected
            assert pg.evaluate('window.END')==expected['duration'] and pg.evaluate('window.FPS')==60
            assert pg.evaluate('document.fonts.check("500 48px NotoSans")&&document.fonts.check("600 90px NotoSerif")')
            for n,h in expected['inputs'].items():
                if n.endswith('.js'):
                    response=pg.request.get(url+n+'?v='+h[:16]);assert response.ok and hashlib.sha256(response.body()).hexdigest()==h,n
            pg.evaluate('window.seek(0)');assert not errors,errors
            return b,pg
        except Exception:
            b.close()
            if attempt==2:raise
def frame(pg,t,png=False):return base64.b64decode(pg.evaluate('([t,p])=>{window.seek(t);return c.toDataURL(p?"image/png":"image/jpeg",.97).split(",")[1]}',[t,png]))
def sheet(files,path,cols=5,w=480):
    h=round(w*9/16)+27;out=Image.new('RGB',(w*cols,h*math.ceil(len(files)/cols)),'#09181b');dr=ImageDraw.Draw(out)
    for i,(p,label) in enumerate(files):
        im=Image.open(p).convert('RGB');im.thumbnail((w,h-27));x=i%cols*w;y=i//cols*h;out.paste(im,(x,y));dr.text((x+6,y+h-23),label,fill='#e9c485')
    out.save(path,quality=93)
def times(root,pg):
    plan=json.loads((root/'timeline.json').read_text(encoding='utf-8'));dur=plan['duration'];srcstarts=pg.evaluate('window.SCENES')
    if srcstarts is None:srcstarts=[0,10.726,17.101,33.304,41.546,59.884,78.472,89.377,93.617,119.927]
    def out(t):
        for s in plan['segments']:
            if s['source_start']<=t<=s['source_end']:return pg.evaluate('window.ACTUAL_TIME('+str(s['output_start']+t-s['source_start'])+')')
        return None
    scene=[out(x) for x in srcstarts];scene=[x for x in scene if x is not None]
    cuts=[pg.evaluate('window.ACTUAL_TIME('+str(s['output_start'])+')') for s in plan['segments'][1:]]
    action=([3.2,4.4,25.5,27.1,54,58,60,64.3,68.4,72,77.7,79,83.1,87,94.2,97.9,98.3,103.5,107.7,111.8,112.6,117.7] if root.name.startswith('04') else [21.5,24.8,25.25,29.8,33.8,35,37.8,57.8,60.6,66,69.3,70.1,73.4,77.9,80.9,82,84,85.8,93.8,95,97.6,99,101.7,104.9,112.8,114.3] if root.name.startswith('01') else [0,1.1,3.8,4.8,17.3,18.5,21.4,22.3,25.3,26,27,29.8,33.8,34.7,41.2,42.5,45.2,45.8,49,49.7,54,55.6,63.9,66.6,71.5,73.6,79,82.2,95.2,102.2,104.6] if root.name.startswith('02') else [3.2,24,28.7,34.6,35.5,37.6,38.5,42.4,46.5,47,50,52,60.3,65,66,69,70.5,73.4,79.5,84.5,87,88,94,99.5,104.1,112.7,118.9,123.15])
    if root.name.startswith('04'):action += [25.25,25.75,41.0,41.45]
    if root.name.startswith('03'):
        action += [33.95,34.45,34.83,35.33,35.71,36.21,36.4,36.9,70.2,71.4,72.12,73.02,73.92,74.82,75.72,75.9,77.1,78.3,78.65,103.7,114]
        action += [71.2,71.65,112.65,113.0]
        action=[pg.evaluate('toMusic('+str(x)+')') for x in action]
    actions=[out(x) for x in action];actions=[x for x in actions if x is not None]
    representatives=set(range(16))|{(a+b)/2 for a,b,_ in plan['subtitles']}|{dur-.5,dur-1/60}
    sync=json.loads((root/'music_sync.json').read_text(encoding='utf-8'));beats=[x['new_output_time'] for x in sync['cues']]+[x['new_output_time'] for x in sync.get('foley',[])]
    segs=[round(round(dur*60)*i/4) for i in range(5)]
    for a,z in zip(segs,segs[1:]):representatives|={a/60,(a+z)//2/60,(z-1)/60}
    alltrans=[]
    for label,xs in [('scene',scene[1:]),('cut',cuts),('action',actions),('beat',beats)]:
        for x in xs:
            for delta in [-.10,.08,.30]:
                t=round((x+delta)*60)/60
                if 0<=t<dur:alltrans.append((t,label))
    representatives|={t for t,_ in alltrans}
    return plan,sorted(set(round(t*60)/60 for t in representatives if 0<=t<dur)),alltrans,scene,cuts
def review(root,url):
    out=root/'review';out.mkdir(exist_ok=True)
    with sync_playwright() as p:
        b,pg=browser(p,url);plan,ts,trans,scenes,cuts=times(root,pg);assert pg.evaluate('window.PACING')==plan
        files=[]
        for t in ts:
            f=out/f'source_{t:08.4f}.jpg';f.write_bytes(frame(pg,t));files.append((f,f'{t:.3f}s'))
        sheet(files,out/'源画面_全部检查点.jpg')
        for name,subset in [('开场逐秒',[(t,'opening') for t in range(16)]),('全部转场动作',trans)]:
            fs=[(out/f'source_{t:08.4f}.jpg',f'{t:.3f}s {lab}') for t,lab in subset];sheet(fs,out/(name+'.jpg'),cols=4 if name=='开场逐秒' else 6,w=480 if name=='开场逐秒' else 400)
        # Mobile inspection: 640x360 render, full caption + diagram pairs at exact times.
        mobile=[]
        for a,z,s in plan['subtitles']:
            t=round((a+z)/2*60)/60;f=out/f'source_{t:08.4f}.jpg';mobile.append((f,f'{t:.3f}s'))
        sheet(mobile,out/'手机阅读_640宽.jpg',cols=3,w=640)
        rnd=[ts[i*len(ts)//12] for i in range(12)];hashes={t:hashlib.sha256(frame(pg,t,True)).hexdigest() for t in rnd};det=all(hashlib.sha256(frame(pg,t,True)).hexdigest()==hashes[t] for t in reversed(rnd));assert det
        data={'timeline_matches_embedded_plan':True,'mapping_count':1,'music_sync_count':1,'version_id':pg.evaluate('window.RENDER_VERSION.id'),'duration':pg.evaluate('window.END'),'fps':pg.evaluate('window.FPS'),'canvas':pg.evaluate('[c.width,c.height]'),'all_times':ts,'opening_times':list(range(16)),'transition_action_times':trans,'scene_output_starts':scenes,'cut_output_starts':cuts,'determinism_times':rnd,'deterministic':det,'subtitles':pg.evaluate('window.SUBS'),'source_sha256':{p.name:sha(p) for p in root.glob('*.js')}}
        (out/'source_review.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8');b.close()
    print(root.name,'SOURCE REVIEW',len(ts),'points',len(trans),'transition/action frames',flush=True)
def fingerprint(root):return json.loads((root/'runtime_version.json').read_text(encoding='utf-8'))['id']
def segment(root,url,n0,n1,path):
    with sync_playwright() as p:
        br,pg=browser(p,url);initial={'version':pg.evaluate('window.RENDER_VERSION.id'),'frames':[n0,n1],'fonts_loaded':pg.evaluate('document.fonts.status'),'content_mapping_count':pg.evaluate('window.MAPPING_COUNT'),'music_sync_count':pg.evaluate('window.MUSIC_SYNC_COUNT'),'entry':'window.seek'};assert initial['version']==fingerprint(root)
        path.with_suffix('.startup.json').write_text(json.dumps(initial,ensure_ascii=False,indent=2),encoding='utf-8')
        enc=subprocess.Popen(['ffmpeg','-v','error','-y','-f','image2pipe','-vcodec','mjpeg','-framerate','60','-i','-','-an','-vf','scale=in_range=full:out_range=limited:out_color_matrix=bt709,format=yuv420p','-c:v','h264_nvenc','-preset','p6','-tune','hq','-rc','vbr','-cq','17','-b:v','0','-g','120','-bf','3','-color_range','tv','-color_primaries','bt709','-color_trc','bt709','-colorspace','bt709',str(path)],stdin=subprocess.PIPE)
        try:
            for n in range(n0,n1):
                data=frame(pg,n/60)
                if n in [n0,(n0+n1)//2,n1-1]:
                    path.with_name(path.stem+f'_input_{n:06d}.jpg').write_bytes(data)
                enc.stdin.write(data)
                if (n-n0)%600==0:print(root.name,path.name,n-n0,'/',n1-n0,flush=True)
        finally:enc.stdin.close();code=enc.wait();br.close()
        if code:raise RuntimeError('Encoder failed')
    path.with_suffix('.source').write_text(fingerprint(root),encoding='ascii')
def mux(root,raw,target,duration,foley=False,start=None):
    cmd=['ffmpeg','-v','error','-y','-i',str(raw)]
    if not foley:cmd+=(['-ss',str(start)] if start else [])+['-i',str(root/'audio/score.wav')]
    elif (root/'audio/foley_only.wav').exists():cmd+=['-i',str(root/'audio/foley_only.wav')]
    else:cmd+=['-f','lavfi','-i','anullsrc=r=48000:cl=stereo']
    cmd+=['-map','0:v:0','-map','1:a:0','-c:v','copy','-bsf:v','h264_metadata=video_full_range_flag=0:colour_primaries=1:transfer_characteristics=1:matrix_coefficients=1','-c:a','aac','-b:a','320k','-ar','48000','-ac','2','-t',str(duration),'-movie_timescale','60000','-movflags','+faststart',str(target)];subprocess.run(cmd,check=True)
def render(root,url,jobs=4,clip=None,resume=False):
    plan=json.loads((root/'timeline.json').read_text(encoding='utf-8'));duration=plan['duration'];n0,n1=(round(clip[0]*60),round(clip[1]*60)) if clip else (0,round(duration*60));out=root/'renders';out.mkdir(exist_ok=True);tag='preview' if clip else 'full';cuts=[n0+round((n1-n0)*i/jobs) for i in range(jobs+1)];parts=[out/f'{tag}_part{i}.mp4' for i in range(jobs)]
    with concurrent.futures.ThreadPoolExecutor(max_workers=jobs) as pool:
        fs=[]
        for i,path in enumerate(parts):
            valid=False
            if resume and path.exists() and path.with_suffix('.source').exists() and path.with_suffix('.source').read_text()==fingerprint(root):
                try:
                    boot=json.loads(path.with_suffix('.startup.json').read_text(encoding='utf-8'))
                    valid=int(probe(path)['streams'][0]['nb_frames'])==cuts[i+1]-cuts[i] and boot['frames']==[cuts[i],cuts[i+1]] and boot['version']==fingerprint(root)
                except Exception:pass
            if valid:print('RESUME',path.name,flush=True)
            else:fs.append(pool.submit(segment,root,url,cuts[i],cuts[i+1],path))
        for f in fs:f.result()
    ls=out/f'{tag}_concat.txt';ls.write_text(''.join("file '"+p.as_posix()+"'\nduration "+format((cuts[i+1]-cuts[i])/60,'.12f')+'\n' for i,p in enumerate(parts)),encoding='utf-8');raw=out/f'{tag}_video.mp4';subprocess.run(['ffmpeg','-v','error','-y','-f','concat','-safe','0','-i',str(ls),'-c','copy','-movie_timescale','60000',str(raw)],check=True)
    mux(root,raw,out/('代表片段_带BGM.mp4' if clip else '横屏_BGM连续修订版_带BGM.mp4'),(n1-n0)/60,start=n0/60 if clip else None)
    if not clip:mux(root,raw,out/'横屏_BGM连续修订版_无BGM.mp4',duration,foley=True)
    print('RENDERED',root.name,(n1-n0),'frames',flush=True)
def main():
    ap=argparse.ArgumentParser();ap.add_argument('root',type=Path);ap.add_argument('--review',action='store_true');ap.add_argument('--render',action='store_true');ap.add_argument('--jobs',type=int,default=4);ap.add_argument('--clip',nargs=2,type=float);ap.add_argument('--resume',action='store_true');ap.add_argument('--serve',action='store_true');a=ap.parse_args();root=a.root.resolve();seal(root);srv,url=server(root)
    try:
        if a.serve:
            print(url,flush=True)
            while True:threading.Event().wait(30)
        if a.review:review(root,url)
        if a.render:render(root,url,a.jobs,a.clip,a.resume)
    finally:srv.shutdown()
if __name__=='__main__':main()
