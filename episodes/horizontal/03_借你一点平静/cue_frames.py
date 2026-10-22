from pathlib import Path
import argparse,io,json
import numpy as np
from PIL import Image
from playwright.sync_api import sync_playwright
from filmtools import server,browser,frame,run,fingerprint,sheet
def supplement(root):
    root=Path(root);q=json.loads((root/'review/final_validation.json').read_text(encoding='utf-8'));assert q['passed'] and q['version_id']==fingerprint(root)
    sync=json.loads((root/'music_sync.json').read_text(encoding='utf-8'));r=json.loads((root/'review/source_review.json').read_text(encoding='utf-8'));times=sorted(set(round(e['new_output_time']*60)/60 for e in sync['cues']+sync.get('foley',[])))
    srv,url=server(root);rows=[]
    try:
        with sync_playwright() as p:
            b,pg=browser(p,url)
            for t in times:
                sp=root/'review'/f'source_{t:08.4f}.jpg';sp.write_bytes(frame(pg,t))
                fp=root/'review'/f'final_{t:08.4f}.jpg';run(['ffmpeg','-v','error','-y','-ss',f'{max(0,t-.00001):.9f}','-i',str(root/'renders/横屏_BGM连续修订版_带BGM.mp4'),'-frames:v','1','-q:v','2',str(fp)])
                a=np.asarray(Image.open(io.BytesIO(frame(pg,t,True))).convert('RGB'),dtype=float);v=np.asarray(Image.open(fp).convert('RGB'),dtype=float);mae=float(abs(a-v).mean());assert mae<8,(t,mae);rows.append({'time':t,'mean_rgb_difference':round(mae,4)})
            b.close()
    finally:srv.shutdown()
    q['exact_cue_frame_comparisons']=rows
    existing={x['time']:x for x in q['final_source_comparisons']};existing.update({x['time']:x for x in rows});q['final_source_comparisons']=[existing[t] for t in sorted(existing)]
    r['all_times']=sorted(set(r['all_times']+times));r['exact_cue_times']=times
    (root/'review/source_review.json').write_text(json.dumps(r,ensure_ascii=False,indent=2),encoding='utf-8');(root/'review/final_validation.json').write_text(json.dumps(q,ensure_ascii=False,indent=2),encoding='utf-8')
    for prefix in ['source','final']:sheet([(root/'review'/f'{prefix}_{t:08.4f}.jpg',f'{t:.3f}s') for t in times],root/'review'/f'精准踩点中心_{prefix}.jpg',cols=3,w=640)
    print(root.name,'EXACT CUES',len(rows),'PASS',flush=True)
if __name__=='__main__':
    ap=argparse.ArgumentParser();ap.add_argument('root',type=Path);supplement(ap.parse_args().root)
