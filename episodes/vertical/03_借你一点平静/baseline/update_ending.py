"""Refresh just the final render segment and preserve the accepted BGM bitstream."""
from pathlib import Path
import base64,concurrent.futures,hashlib,shutil,subprocess
from playwright.sync_api import sync_playwright
import render

ROOT=Path(__file__).resolve().parent
BACKUP=ROOT/'review/before_follow_cta'
BACKUP.mkdir(parents=True,exist_ok=True)

def audio_hash(path):
    return subprocess.check_output(['ffmpeg','-v','error','-i',str(path),'-map','0:a:0','-c','copy','-f','hash','-hash','sha256','-']).strip()

def update(url,mode):
    folder=ROOT/'renders'
    old=folder/f'final_{mode}.mp4'
    previous=BACKUP/old.name
    if not previous.exists():shutil.copy2(old,previous)
    original_audio=audio_hash(previous)
    parts=[folder/f'{mode}_part{i:02d}.mp4' for i in range(4)]
    assert all(p.exists() for p in parts)
    render.segment(url,mode,97.5,130,parts[3])
    listing=folder/f'{mode}_parts.txt'
    listing.write_text(''.join(f"file '{p.as_posix()}'\n" for p in parts),encoding='utf-8')
    raw=folder/f'{mode}_raw.mp4'
    subprocess.run(['ffmpeg','-v','error','-y','-f','concat','-safe','0','-i',str(listing),'-c','copy',str(raw)],check=True)
    subprocess.run(['ffmpeg','-v','error','-y','-i',str(raw),'-i',str(previous),'-map','0:v:0','-map','1:a:0','-c','copy','-t','130','-movflags','+faststart',str(old)],check=True)
    assert audio_hash(old)==original_audio,'BGM changed unexpectedly'
    print(mode,'updated; accepted BGM is byte-for-byte unchanged',flush=True)

def ending_stills(url):
    with sync_playwright() as p:
        for mode in ['vertical','horizontal']:
            b,pg=render.browser(p,url,mode)
            for t in [123,124.4,125.4,126.8,128.8]:
                (ROOT/f'review/follow_{mode}_{t:.1f}.png').write_bytes(render.frame(pg,t,True))
            hashes={t:hashlib.sha256(render.frame(pg,t,True)).hexdigest() for t in [124.4,125.4,126.8,128.8]}
            assert all(hashlib.sha256(render.frame(pg,t,True)).hexdigest()==hashes[t] for t in reversed(hashes))
            b.close()

if __name__=='__main__':
    server,url=render.server()
    try:
        ending_stills(url)
        with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
            futures=[pool.submit(update,url,mode) for mode in ['vertical','horizontal']]
            for f in futures:f.result()
    finally:server.shutdown()
