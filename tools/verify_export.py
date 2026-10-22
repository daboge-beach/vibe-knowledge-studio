"""Compare a studio export's actual frames/audio with the recorded current inputs."""
import argparse
import io
import json
from pathlib import Path
import sys
import numpy as np
from PIL import Image
from scipy.signal import correlate, correlation_lags
from studio import ROOT, browser, dump, episode, frame, no_bgm, run, sha, source_identity

def verify(path, channel=None):
    path=path.resolve()
    manifest=json.loads(path.with_suffix('.json').read_text('utf-8'))
    e=episode(manifest['episode'])
    if sha(path)!=manifest['sha256']:raise RuntimeError('MP4 differs from recorded export')
    if source_identity(e)['id']!=manifest['source']['id']:raise RuntimeError('Inputs changed since export; re-render first')
    n0,n1=manifest['frames'];fps=manifest['fps'];duration=(n1-n0)/fps
    comparisons=[]
    with browser(e,channel) as (page,_):
        for n in sorted({0,(n1-n0)//2,n1-n0-1}):
            original=np.asarray(Image.open(io.BytesIO(frame(page,(n+n0)/fps))).convert('RGB'),dtype=float)
            data=run(['ffmpeg','-v','error','-i',path,'-vf',f'select=eq(n\\,{n})','-frames:v','1','-f','image2pipe','-vcodec','png','-'],capture_output=True).stdout
            actual=np.asarray(Image.open(io.BytesIO(data)).convert('RGB'),dtype=float)
            mae=float(np.mean(np.abs(original-actual)))
            comparisons.append({'frame':n,'source_time':(n+n0)/fps,'mean_absolute_rgb_error':mae,'threshold':6.0,'passed':mae<6.0})
    soundtrack=no_bgm(e) if manifest['audio']=='no-bgm' else ROOT/e['path']/'audio/score.wav'
    if sha(soundtrack)!=manifest['soundtrack_sha256']:raise RuntimeError('Soundtrack changed')
    def pcm(args):
        return np.frombuffer(run(['ffmpeg','-v','error']+args+['-vn','-ar','48000','-ac','1','-f','f32le','-'],capture_output=True).stdout,dtype='<f4').astype(float)
    expected=pcm(['-ss',str(n0/fps),'-i',str(soundtrack),'-t',str(duration)])
    actual=pcm(['-i',str(path),'-t',str(duration)])
    count=min(len(expected),len(actual));expected=expected[:count];actual=actual[:count]
    if np.max(np.abs(expected))<1e-8:
        peak=float(np.max(np.abs(actual)))
        audio={'kind':'silence','peak':peak,'passed':peak<1e-5}
    else:
        corr=correlate(actual,expected,mode='full',method='fft')
        lags=correlation_lags(len(actual),len(expected),mode='full')
        indices=np.where(np.abs(lags)<=1024)[0];best=indices[np.argmax(corr[indices])];lag=int(lags[best])
        left=actual[max(0,lag):count+min(0,lag)];right=expected[max(0,-lag):count-min(max(0,lag),count)]
        similarity=float(np.dot(left,right)/max(1e-20,np.linalg.norm(left)*np.linalg.norm(right)))
        audio={'kind':'sample-aligned decoded AAC','sample_lag':lag,'normalized_correlation':similarity,'samples_compared':len(left),'passed':similarity>.98 and abs(lag)<=128}
    result={'file':path.name,'sha256':sha(path),'frame_comparisons':comparisons,'actual_MP4_audio':audio,'passed':all(x['passed'] for x in comparisons) and audio['passed'],'scope':'First/middle/last frames and full clip audio; no claim of full human viewing or listening','full_subjective_viewing_done':False,'full_subjective_listening_done':False,'user_accepted':False}
    dump(path.with_suffix('.verification.json'),result)
    print(json.dumps(result,ensure_ascii=False,indent=2))
    if not result['passed']:raise RuntimeError('Export comparison failed')

if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('file',type=Path);p.add_argument('--browser-channel',default=None);a=p.parse_args()
    try:verify(a.file,a.browser_channel)
    except (RuntimeError,ValueError) as error:print(error,file=sys.stderr);sys.exit(1)
