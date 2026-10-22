"""Portable entry point; caches and outputs stay inside this checkout."""
from __future__ import annotations
import argparse
import base64
from contextlib import contextmanager
import gzip
import hashlib
import http.server
import json
import math
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import threading
import urllib.parse
import urllib.request
import wave

ROOT = Path(__file__).resolve().parents[1]
for _directory in ('.tmp', '.cache', '.outputs'):
    (ROOT / _directory).mkdir(exist_ok=True)
for _var in ('TEMP', 'TMP', 'TMPDIR'):
    os.environ[_var] = str(ROOT / '.tmp')
os.environ['PLAYWRIGHT_BROWSERS_PATH'] = str(ROOT / '.cache/ms-playwright')
os.environ['PIP_CACHE_DIR'] = str(ROOT / '.cache/pip')
os.environ['PYTHONDONTWRITEBYTECODE'] = '1'
sys.dont_write_bytecode = True
tempfile.tempdir = str(ROOT / '.tmp')
PROJECT = json.loads((ROOT / 'project.json').read_text('utf-8'))

def sha(path):
    with open(path, 'rb') as stream:
        return hashlib.file_digest(stream, 'sha256').hexdigest()

def dump(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

def episode(key):
    return next(e for e in PROJECT['episodes'] if e['id'] == key)

def run(args, **kwargs):
    return subprocess.run([str(x) for x in args], check=True, **kwargs)

def probe(path):
    return json.loads(run(['ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', path], capture_output=True).stdout)

def safe_copy(src, dst):
    dst.parent.mkdir(parents=True, exist_ok=True)
    if dst.exists():
        if sha(src) != sha(dst):
            raise RuntimeError(f'Existing asset differs, will not overwrite: {dst}')
        return
    try:
        os.link(src, dst)
    except OSError:
        shutil.copyfile(src, dst)

def prepare_fonts():
    lock = json.loads((ROOT / 'assets/fonts.lock.json').read_text('utf-8'))
    cache = ROOT / '.cache/fonts'
    cache.mkdir(parents=True, exist_ok=True)
    for item in lock['fonts']:
        target = cache / item['name']
        if not target.exists():
            print('Downloading', item['name'], flush=True)
            req = urllib.request.Request(item['url'], headers={'User-Agent': 'vibe-knowledge-studio'})
            partial = target.with_suffix('.download')
            with urllib.request.urlopen(req, timeout=180) as response, partial.open('wb') as out:
                shutil.copyfileobj(response, out)
            if sha(partial) != item['sha256']:
                raise RuntimeError(f'Font hash mismatch: {item["name"]}; download not installed')
            partial.replace(target)
        if sha(target) != item['sha256']:
            raise RuntimeError(f'Font hash mismatch: {target}')
        for e in PROJECT['episodes']:
            for rel in e['fonts']:
                if Path(rel).name == item['name']:
                    safe_copy(target, ROOT / e['path'] / rel)

def no_bgm(e):
    target = ROOT / '.cache/audio' / (e['id'] + '-no-bgm.wav')
    target.parent.mkdir(parents=True, exist_ok=True)
    if e['foley_asset']:
        data = gzip.decompress((ROOT / e['foley_asset']).read_bytes())
        if hashlib.sha256(data).hexdigest() != e['foley_sha256']:
            raise RuntimeError('Foley checksum mismatch')
        if not target.exists() or sha(target) != e['foley_sha256']:
            target.write_bytes(data)
    elif not target.exists():
        with wave.open(str(target), 'wb') as out:
            out.setnchannels(2); out.setsampwidth(2); out.setframerate(48000)
            remaining = round(e['duration'] * 48000)
            while remaining:
                n = min(remaining, 48000); out.writeframes(b'\0' * n * 4); remaining -= n
    return target

def prepare_audio(e):
    root = ROOT / e['path']
    dry = no_bgm(e)
    (root / 'audio').mkdir(exist_ok=True)
    if e['foley_asset']:
        safe_copy(dry, root / 'audio/foley_only.wav')
    score = root / 'audio/score.wav'
    if not score.exists():
        # Use a copy: replacing the score later must not mutate the dry cache.
        shutil.copyfile(dry, score)
        dump(root / '.audio-state.json', {'mode': 'no-bgm', 'sha256': sha(score), 'full_subjective_listening_done': False})

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)
    def log_message(self, *args):
        pass
    def do_GET(self):
        parts = Path(urllib.parse.unquote(urllib.parse.urlsplit(self.path).path)).parts
        if any(p.startswith('.') and p not in ('.', '..', '.audio-state.json') for p in parts):
            self.send_error(403); return
        super().do_GET()
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store'); super().end_headers()
    def copyfile(self, source, outputfile):
        try:
            super().copyfile(source, outputfile)
        except (ConnectionResetError, ConnectionAbortedError, BrokenPipeError):
            pass

@contextmanager
def server(e):
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), Handler)
    thread = threading.Thread(target=srv.serve_forever, daemon=True); thread.start()
    url = f'http://127.0.0.1:{srv.server_port}/' + urllib.parse.quote(e['path']) + '/?mode=' + e['format']
    try:
        yield url
    finally:
        srv.shutdown(); srv.server_close(); thread.join()

@contextmanager
def browser(e, channel=None):
    from playwright.sync_api import sync_playwright
    with server(e) as url, sync_playwright() as pw:
        args = {'headless': True, 'args': ['--disable-lcd-text', '--force-color-profile=srgb', '--disable-background-timer-throttling']}
        if channel:
            args['channel'] = channel
        br = pw.chromium.launch(**args)
        errors = []
        page = br.new_page(viewport={'width': 1080 if e['format'] == 'vertical' else 1920, 'height': 1920 if e['format'] == 'vertical' else 1080}, device_scale_factor=1)
        page.on('pageerror', lambda error: errors.append(str(error)))
        try:
            page.goto(url + '&offline=1', wait_until='domcontentloaded')
            page.wait_for_function('window.READY && window.PACING && window.MUSIC_SYNC && document.fonts.status === "loaded"', timeout=45000)
            page.evaluate('document.fonts.ready')
            if not page.evaluate('Array.from(document.fonts).every(f => f.status === "loaded")'):
                raise RuntimeError('Fonts not loaded')
            if abs(page.evaluate('window.END') - e['duration']) > 1e-7:
                raise RuntimeError('Duration differs from project.json')
            plan = json.loads((ROOT / e['path'] / 'timeline.json').read_text('utf-8'))
            if page.evaluate('window.PACING') != plan:
                raise RuntimeError('Embedded timeline differs from timeline.json')
            if e['format'] == 'horizontal':
                if page.evaluate('[window.MAPPING_COUNT,window.MUSIC_SYNC_COUNT]') != [1, 1]:
                    raise RuntimeError('Time mapping count is not exactly one')
            if (ROOT / e['path'] / 'portrait_repair.js').exists():
                page.wait_for_function('window.PORTRAIT_REPAIR && window.PORTRAIT_REPAIR.ready')
            if errors:
                raise RuntimeError('; '.join(errors))
            yield page, errors
            if errors:
                raise RuntimeError('; '.join(errors))
        finally:
            br.close()

def frame(page, time, lossless=True):
    return base64.b64decode(page.evaluate('([t,png])=>{window.seek(t); const canvas=document.getElementById("c"); return canvas.toDataURL(png?"image/png":"image/jpeg",.97).split(",")[1]}', [time, lossless]))

def source_identity(e):
    root = ROOT / e['path']
    paths = [p for p in root.rglob('*') if p.is_file() and p.suffix in {'.js', '.json', '.html', '.ttf', '.wav'} and not any(x in {'review','renders','__pycache__'} for x in p.relative_to(root).parts)]
    hashes = {p.relative_to(root).as_posix(): sha(p) for p in sorted(paths)}
    hashes['@tools/studio.py'] = sha(Path(__file__))
    hashes['@project.json'] = sha(ROOT / 'project.json')
    return {'id': hashlib.sha256(json.dumps(hashes, sort_keys=True).encode()).hexdigest(), 'files': hashes}

def check(e, channel):
    out = ROOT / '.outputs' / e['id']; out.mkdir(parents=True, exist_ok=True)
    with browser(e, channel) as (page, errors):
        times = [0.5, min(30, e['duration']/3), e['duration']/2, e['duration']-0.5]
        hashes = {}
        for t in times:
            data = frame(page, t); hashes[t] = hashlib.sha256(data).hexdigest()
            (out / f'check-{t:.3f}.png').write_bytes(data)
        deterministic = all(hashlib.sha256(frame(page, t)).hexdigest() == hashes[t] for t in reversed(times))
        if not deterministic:
            raise RuntimeError('Random seek is not deterministic')
        size = page.evaluate('[c.width,c.height]')
        if (size[0] < size[1]) != (e['format'] == 'vertical'):
            raise RuntimeError('Canvas aspect ratio mismatch')
    result = {'episode':e['id'], 'canvas':size, 'times':times, 'deterministic':deterministic, 'page_errors':errors, 'source':source_identity(e), 'scope':'source smoke test only', 'full_viewing_done':False, 'full_listening_done':False, 'platform_UI_verified':False, 'user_accepted':False}
    dump(out / 'check.json', result)
    print(e['id'], size, 'source smoke test passed')

def render(e, args):
    start, end = args.start, args.end if args.end is not None else e['duration']
    fps = e['fps']; n0, n1 = round(start*fps), round(end*fps)
    if not 0 <= n0 < n1 <= round(e['duration']*fps):
        raise ValueError('Clip must stay within the episode timeline')
    out = ROOT / '.outputs' / e['id']; out.mkdir(parents=True, exist_ok=True)
    target = out / f'{args.audio}-{n0}-{n1}.mp4'
    if target.exists():
        raise FileExistsError(f'Output already exists; rename it before rendering again: {target}')
    soundtrack = no_bgm(e) if args.audio == 'no-bgm' else ROOT/e['path']/'audio/score.wav'
    state_file = ROOT/e['path']/'.audio-state.json'
    state = json.loads(state_file.read_text('utf-8')) if state_file.exists() else {}
    if args.audio == 'score' and (state.get('mode') != 'custom' or state.get('sha256') != sha(soundtrack)):
        raise RuntimeError('Use the audio command to register your licensed mixed track first')
    duration = (n1-n0)/fps
    identity = source_identity(e)
    with tempfile.TemporaryDirectory(prefix='render-', dir=ROOT/'.tmp') as td:
        raw = Path(td)/'video.mp4'; log = Path(td)/'ffmpeg.log'
        with browser(e, args.browser_channel) as (page, errors), log.open('wb') as err:
            cmd = ['ffmpeg','-v','error','-y','-f','image2pipe','-vcodec','mjpeg','-framerate',str(fps),'-i','-','-an','-vf','scale=in_range=full:out_range=limited:out_color_matrix=bt709,format=yuv420p','-c:v','libx264','-threads','2','-preset','fast','-crf','18','-color_range','tv','-color_primaries','bt709','-color_trc','bt709','-colorspace','bt709',str(raw)]
            enc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stderr=err)
            try:
                for n in range(n0,n1):
                    data = frame(page,n/fps,False)
                    if n in {n0,(n0+n1)//2,n1-1}:
                        (out/f'input-{n}.jpg').write_bytes(data)
                    enc.stdin.write(data)
                    if (n-n0)%300 == 0: print(e['id'],n-n0,'/',n1-n0,flush=True)
            finally:
                enc.stdin.close(); code = enc.wait()
            if code: raise RuntimeError(log.read_text('utf-8',errors='replace'))
        if source_identity(e)['id'] != identity['id']:
            raise RuntimeError('Source changed during rendering; output not published')
        run(['ffmpeg','-v','error','-n','-i',raw,'-ss',n0/fps,'-i',soundtrack,'-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-b:a','192k','-ar','48000','-ac','2','-t',duration,'-movflags','+faststart',target])
    run(['ffmpeg','-v','error','-i',target,'-f','null','-'],capture_output=True)
    info = probe(target); video=next(s for s in info['streams'] if s['codec_type']=='video')
    if int(video['nb_frames']) != n1-n0: raise RuntimeError('Encoded frame count mismatch')
    run(['ffmpeg','-v','error','-y','-i',target,'-vn','-c:a','pcm_s16le',target.with_suffix('.actual-audio.wav')],capture_output=True)
    dump(target.with_suffix('.json'), {'episode':e['id'],'frames':[n0,n1],'fps':fps,'audio':args.audio,'soundtrack_sha256':sha(soundtrack),'source':identity,'sha256':sha(target),'ffprobe':info,'complete_decode_passed':True,'status':'待验收候选','full_viewing_done':False,'full_listening_done':False,'platform_UI_verified':False,'user_accepted':False})
    print(target)

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    sub=parser.add_subparsers(dest='command',required=True)
    for name in ('list','doctor','prepare'): sub.add_parser(name)
    for name in ('preview','frame','check','render','audio'):
        cmd=sub.add_parser(name);cmd.add_argument('episode',choices=[e['id'] for e in PROJECT['episodes']]+(['all'] if name=='check' else []))
        cmd.add_argument('--browser-channel',choices=['chrome','msedge'],default=None)
        if name=='frame':cmd.add_argument('--time',type=float,default=1)
        if name=='render':
            cmd.add_argument('--start',type=float,default=0);cmd.add_argument('--end',type=float)
            cmd.add_argument('--audio',choices=['no-bgm','score'],default='no-bgm')
        if name=='audio':
            cmd.add_argument('file',type=Path);cmd.add_argument('--license-note',required=True)
    a=parser.parse_args()
    if a.command=='list':
        for e in PROJECT['episodes']: print(e['id'],e['title'],e['duration'],e['fps'])
        return
    if a.command=='doctor':
        from playwright.sync_api import sync_playwright
        report={'python':sys.version.split()[0],'ffmpeg':shutil.which('ffmpeg'),'ffprobe':shutil.which('ffprobe'),'temp_inside_repo':str(tempfile.gettempdir())==str(ROOT/'.tmp')}
        with sync_playwright() as pw:report['managed_chromium_installed']=Path(pw.chromium.executable_path).exists()
        print(json.dumps(report,ensure_ascii=False,indent=2))
        if not all(report.values()):raise SystemExit(1)
        return
    if a.command=='prepare':
        prepare_fonts()
        for e in PROJECT['episodes']:prepare_audio(e)
        print('Assets ready. Default audio contains no background music.');return
    es=PROJECT['episodes'] if a.episode=='all' else [episode(a.episode)]
    for e in es:
        prepare_audio(e)
        if a.command=='check':check(e,a.browser_channel)
        elif a.command=='preview':
            with server(e) as url:
                print(url,flush=True)
                try:threading.Event().wait()
                except KeyboardInterrupt:pass
        elif a.command=='frame':
            if not 0<=a.time<e['duration']:raise ValueError('Time outside episode')
            with browser(e,a.browser_channel) as (page,_):data=frame(page,a.time)
            dst=ROOT/'.outputs'/e['id']/f'frame-{a.time:.3f}.png';dst.parent.mkdir(parents=True,exist_ok=True);dst.write_bytes(data);print(dst)
        elif a.command=='render':render(e,a)
        elif a.command=='audio':
            source=a.file.resolve()
            info=probe(source);stream=next(s for s in info['streams'] if s['codec_type']=='audio')
            length=float(stream.get('duration') or info['format']['duration'])
            if length+0.01<e['duration']:raise ValueError('Track is shorter than episode; will not loop or splice it')
            target=ROOT/e['path']/'audio/score.wav'
            if target.resolve()==source:raise ValueError('Choose a separate input file')
            # User provides a final mix, including episode 3 foley if needed. No hidden cut/fade/normalization.
            tmp=ROOT/'.tmp'/(e['id']+'-score.wav')
            run(['ffmpeg','-v','error','-y','-i',source,'-vn','-t',e['duration'],'-ar','48000','-ac','2','-c:a','pcm_s16le',tmp])
            if target.exists():
                backup=ROOT/'.cache/audio'/('previous-'+sha(target)+'.wav')
                if not backup.exists():shutil.copyfile(target,backup)
            os.replace(tmp,target)
            dump(ROOT/e['path']/'.audio-state.json',{'mode':'custom','license_note':a.license_note,'input_sha256':sha(source),'sha256':sha(target),'full_subjective_listening_done':False})
            print('Registered final mix. Recheck both formats, synchronization and final MP4 audio.')

if __name__=='__main__':
    try:main()
    except (RuntimeError,ValueError,FileNotFoundError,FileExistsError,StopIteration) as error:
        print(str(error),file=sys.stderr);sys.exit(1)
