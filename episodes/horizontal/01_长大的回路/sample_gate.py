from pathlib import Path
import argparse,json,subprocess,io,shutil
import numpy as np
from PIL import Image
from playwright.sync_api import sync_playwright
from filmtools import server,browser,frame,render,probe,sha,seal
def run(root,first_exists=False):
 seal(root);srv,url=server(root);ranges=[(0,30,'前30秒'),({'04':91.4,'01':61,'02':29,'03':89}[root.name[:2]],{'04':95.4,'01':66,'02':33,'03':95.5}[root.name[:2]],'最难动作')];records=[]
 dst=root/'review/代表片段';dst.mkdir(exist_ok=True)
 try:
  for start,end,label in ranges:
   if not(first_exists and start==0):render(root,url,2,(start,end))
   f=dst/(label+'_带BGM.mp4');shutil.copy2(root/'renders/代表片段_带BGM.mp4',f)
   j=probe(f);v=next(x for x in j['streams'] if x['codec_type']=='video');assert int(v['nb_frames'])==round((end-start)*60)
   r=subprocess.run(['ffmpeg','-v','error','-i',str(f),'-f','null','-'],capture_output=True);assert r.returncode==0 and not r.stderr.strip()
   pts=[start+(end-start)*q for q in [0,.25,.5,.75]]+[end-1/60];comp=[]
   with sync_playwright() as p:
    b,pg=browser(p,url)
    for t in pts:
     t=round(t*60)/60;local=t-start;out=dst/f'{label}_{t:08.4f}.png'
     subprocess.run(['ffmpeg','-v','error','-y','-ss',str(max(0,local-.00001)),'-i',str(f),'-frames:v','1',str(out)],check=True)
     aa=np.asarray(Image.open(out).convert('RGB'),dtype=float);bb=np.asarray(Image.open(io.BytesIO(frame(pg,t,True))).convert('RGB'),dtype=float);mae=float(abs(aa-bb).mean());assert mae<8,(t,mae)
     Image.open(out).resize((640,360),Image.Resampling.LANCZOS).save(dst/f'phone_{label}_{t:08.4f}.png');comp.append({'output_time':t,'clip_time':local,'source_final_MAE':mae})
    b.close()
   records.append({'label':label,'output_start':start,'output_end':end,'file':f.name,'sha256':sha(f),'frames':int(v['nb_frames']),'full_decode':True,'comparisons':comp,'normal_speed_human_viewing':False})
 finally:srv.shutdown()
 (dst/'样片关口.json').write_text(json.dumps({'runtime_id':json.loads((root/'runtime_version.json').read_text(encoding='utf-8'))['id'],'clips':records,'status':'样片客观检查通过；单帧复看另记；不表示完整观影或试听'},ensure_ascii=False,indent=2),encoding='utf-8')
 print(root.name,'SAMPLE GATE READY',flush=True)
if __name__=='__main__':
 ap=argparse.ArgumentParser();ap.add_argument('root',type=Path);ap.add_argument('--first-exists',action='store_true');a=ap.parse_args();run(a.root.resolve(),a.first_exists)
