"""Use the exact GitHub reference audio, with very quiet original block foley.
The source music is not claimed to be original or commercially licensed.
"""
from pathlib import Path
import hashlib,json,subprocess
import numpy as np
from scipy.io.wavfile import write
from scipy.signal import butter,sosfilt
ROOT=Path(__file__).resolve().parent
SR=48000
CFG=json.loads((ROOT/'music_timing.json').read_text(encoding='utf-8'))
DUR=CFG['duration']
source=ROOT/'audio/github_reference_bgm.mp4'
data=source.read_bytes()
blob=hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()
assert blob==CFG['blob_sha1']
raw=subprocess.check_output(['ffmpeg','-v','error','-i',str(source),'-vn','-ar',str(SR),'-ac','2','-f','f32le','-'])
audio=np.frombuffer(raw,dtype='<f4').reshape(-1,2)[:round(DUR*SR)].copy()
audio*=.68
foley=np.zeros_like(audio)
rng=np.random.default_rng(20261019)
events=[]
for t,m in [(1.25,62),(1.62,65),(1.93,59),(2.28,57),(2.58,53),(105.2,60),(106.7,64),(108.2,67),(109.6,72),(111.2,76)]:
    tm=float(np.interp(t,CFG['source_times'],CFG['music_times']))
    x=np.arange(int(.18*SR),dtype=np.float32)/SR
    noise=sosfilt(butter(2,3800,fs=SR,output='sos'),rng.standard_normal(len(x))).astype(np.float32)
    f=440*2**((m-69)/12)
    w=(noise*.24+np.sin(2*np.pi*f*x)*.6+np.sin(2*np.pi*f*2.73*x)*.24)*np.exp(-x*34)*np.minimum(x/.001,1)
    n=round(tm*SR);p=np.array([.78,.62],np.float32)
    sound=w[:,None]*p*.035
    audio[n:n+len(w)]+=sound
    foley[n:n+len(w)]+=sound
    events.append({'time':round(tm,3),'type':'original quiet wood foley'})
timeline=np.arange(len(audio),dtype=np.float32)/SR
fade=np.minimum(timeline/.035,1)*np.minimum((DUR-timeline)/1.2,1)
audio*=fade[:,None]
write(ROOT/'audio/foley_only.wav',SR,(np.clip(foley*fade[:,None],-1,1)*32767).astype(np.int16))
premix=ROOT/'audio/reference_premix.wav'
write(premix,SR,(np.clip(audio,-1,1)*32767).astype(np.int16))
# Two-pass loudness normalization keeps the actual musical dynamics, instead of
# flattening the track under a synthetic pad.
analysis=subprocess.run(['ffmpeg','-hide_banner','-i',str(premix),'-af','loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json','-f','null','-'],capture_output=True,text=True,encoding='utf-8',errors='replace',check=True)
stats=json.JSONDecoder().raw_decode(analysis.stderr[analysis.stderr.rfind('{'):])[0]
af=f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={stats['input_i']}:measured_TP={stats['input_tp']}:measured_LRA={stats['input_lra']}:measured_thresh={stats['input_thresh']}:offset={stats['target_offset']}:linear=true"
subprocess.run(['ffmpeg','-v','error','-y','-i',str(premix),'-af',af,'-ar',str(SR),'-ac','2',str(ROOT/'audio/score.wav')],check=True)
(ROOT/'audio/mix_report.json').write_text(json.dumps({'source_sha256':hashlib.sha256(data).hexdigest(),'git_blob_sha1':blob,'duration':DUR,'music_stretched':False,'music_looped':False,'first_pass_loudness':stats,'foley':events},ensure_ascii=False,indent=2),encoding='utf-8')
print('Reference score ready; exact source git blob:',blob,flush=True)
