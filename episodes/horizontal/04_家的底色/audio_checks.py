from pathlib import Path
import hashlib,json,subprocess
import numpy as np
from scipy.io import wavfile
from scipy.signal import correlate
SR=48000
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def pcm(p):
    raw=subprocess.check_output(['ffmpeg','-v','error','-i',str(p),'-vn','-ar',str(SR),'-ac','2','-f','f32le','-'])
    return np.frombuffer(raw,dtype='<f4').reshape(-1,2)
def corr(x,y):
    if min(float(np.std(x)),float(np.std(y)))<1e-8:return None
    return float(np.corrcoef(x.ravel(),y.ravel())[0,1])
def window_check(x,y,a,b):
    i=max(0,round(a*SR));j=min(len(x),len(y),round(b*SR));xx=x[i:j];yy=y[i:j]
    mono_x=xx.mean(axis=1).astype(np.float64);mono_y=yy.mean(axis=1).astype(np.float64)
    lag=None
    if mono_x.std()>1e-7 and mono_y.std()>1e-7:
        z=correlate(mono_y-mono_y.mean(),mono_x-mono_x.mean(),method='fft');m=len(mono_x)-1;span=min(1024,m);lag=int(np.argmax(z[m-span:m+span+1])-span)
    return {'start':i/SR,'end':j/SR,'samples':j-i,'lag_samples':lag,'correlation_at_zero_lag':corr(xx,yy),'rmse':float(np.sqrt(np.mean((xx-yy)**2)))}
def compare(x,y,plan,sync):
    n=round(plan['duration']*SR);assert len(x)==n and n<=len(y)<=n+2048,(len(x),len(y),n)
    whole={'reference_samples':n,'decoded_samples':len(y),'decoder_trailing_padding_samples':len(y)-n,'correlation_at_zero_lag':corr(x,y[:n]),'rmse':float(np.sqrt(np.mean((x-y[:n])**2)))}
    windows=[]
    for s in plan['segments'][1:]:
        t=s['output_start'];w=window_check(x,y,t-3,t+3);w.update({'kind':'旧断点前后各3秒','point':t});windows.append(w)
    for c in sync['cues']:
        t=c['new_output_time'];w=window_check(x,y,t-.5,t+.5);w.update({'kind':c['label'],'point':t});windows.append(w)
    for a,b,label in [(0,3,'开头'),(plan['duration']-10,plan['duration'],'最后10秒')]:
        w=window_check(x,y,a,b);w.update({'kind':label,'point':a});windows.append(w)
    blocks=[]
    for i in range(int(np.ceil(plan['duration']))):
        a=i*SR;b=min(n,(i+1)*SR);blocks.append({'start':i,'samples':b-a,'correlation':corr(x[a:b],y[a:b]),'rmse':float(np.sqrt(np.mean((x[a:b]-y[a:b])**2)))})
    passed=whole['correlation_at_zero_lag'] is not None and whole['correlation_at_zero_lag']>.99 and all(w['lag_samples'] in [None,0] and (w['correlation_at_zero_lag'] is None or w['correlation_at_zero_lag']>.98) for w in windows) and all(v['correlation'] is None or v['correlation']>.97 for v in blocks)
    return {'whole':whole,'long_windows':windows,'every_second':blocks,'passed':passed}
def reconstruct(root):
    root=Path(root);sync=json.loads((root/'music_sync.json').read_text(encoding='utf-8'));source=root/sync['music_source']['file'];assert sha(source)==sync['music_source']['source_sha256']
    raw=pcm(source).astype(np.float64);rate,score=wavfile.read(root/'audio/score.wav');assert rate==SR and score.dtype==np.int16
    n=len(score);t=np.arange(n)/SR;env=np.minimum(t/sync['music_fade_in'],1)*np.sin(np.minimum((sync['duration']-t)/sync['music_fade_out'],1)*np.pi/2)**2
    exact=raw[:n]*env[:,None]*10**(sync['static_gain_db']/20)*32767
    foley=np.zeros_like(score)
    if (root/'audio/foley_only.wav').exists():r,foley=wavfile.read(root/'audio/foley_only.wav');assert r==SR and len(foley)==n
    expected=np.clip(exact,-32767,32767).astype(np.int16).astype(np.int32);actual=score.astype(np.int32)-foley.astype(np.int32);diff=abs(expected-actual)
    result={'source':str(source.resolve()),'source_sha256':sha(source),'source_start_sample':0,'source_end_sample':n,'source_rate':1,'looped':False,'internal_splices':0,'method':'整条原曲同一采样时钟×固定增益×35ms淡入及末尾2.8秒sin²淡出；第三集扣除同版foley；直接重建所有样本','maximum_residual_int16_lsb':int(diff.max()),'rms_residual_lsb':float(np.sqrt(np.mean(diff.astype(float)**2))),'one_second_max_residual_lsb':[int(diff[i:i+SR].max()) for i in range(0,n,SR)],'passed':int(diff.max())<=2}
    assert result['passed'],result
    return result
