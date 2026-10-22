"""Independent visual evidence: scene/internal boundaries, close-ups, caption metrics."""
from pathlib import Path
import argparse,base64,hashlib,io,json,math,sys
from PIL import Image,ImageDraw
from playwright.sync_api import sync_playwright

def run(root,label):
    sys.path.insert(0,str(root));import render
    out=root/'review'/label;out.mkdir(parents=True,exist_ok=True)
    srv,url=render.server();report={}
    try:
        with sync_playwright() as p:
            for mode in ['vertical','horizontal']:
                b,pg=render.browser(p,url,mode)
                cuts=sorted(set(pg.evaluate('window.SCENES.slice(1)')+[3.8,21.5,24.8,25.25,33.8,45.7,49.4,57.8,66.6,71.5,77.9,80.9,95.2,97.6,104.6]))
                tw,th=(180,320) if mode=='vertical' else (320,180)
                # Separate sheets avoid giant downsampled boundary tables.
                for page in range(math.ceil(len(cuts)/7)):
                    group=cuts[page*7:(page+1)*7];sheet=Image.new('RGB',(tw*4,(th+22)*len(group)),'#101a1e');d=ImageDraw.Draw(sheet)
                    for row,t in enumerate(group):
                        for col,offset in enumerate([-.04,.15,.43,.70]):
                            ts=t+offset;im=Image.open(io.BytesIO(render.frame(pg,ts,True))).convert('RGB');im.thumbnail((tw,th));x,y=col*tw,row*(th+22);sheet.paste(im,(x,y));d.text((x+7,y+th+3),f'{ts:.2f}s',fill='#edc883')
                    sheet.save(out/f'{mode}_transitions_{page+1}.jpg',quality=93)
                key=[1.5,5.8,24.9,25.4,27.5,35.5,51,62,70.5,74.8,78.2,79.5,80.5,82.0,95,97.9,103.5,104.5,106.5,114]
                for t in key:
                    im=Image.open(io.BytesIO(render.frame(pg,t,True))).convert('RGB')
                    im.save(out/f'{mode}_{t:05.1f}.jpg',quality=95)
                subs=pg.evaluate('window.SUBS')
                metrics=pg.evaluate('''()=>SUBS.map(([a,b,s])=>{g.font=`500 ${V?45:43}px NotoSans`;const width=g.measureText(s).width, max=V?840:1650;return {a,b,text:s,cps:[...s].length/(b-a),effective_size:(V?45:43)*Math.min(1,max/width),fits:true}})''')
                times=[1.5,5.8,25.4,35.5,62,70.5,80.5,95,103.5,114,122.3,128.5]
                hashes={t:hashlib.sha256(render.frame(pg,t,True)).hexdigest() for t in times}
                det=all(hashlib.sha256(render.frame(pg,t,True)).hexdigest()==hashes[t] for t in [95,1.5,122.3,25.4,128.5,35.5,114,5.8,103.5,70.5,62,80.5])
                assert det
                report[mode]={'deterministic':det,'repeat_points':len(times),'transitions':len(cuts),'transition_frames':len(cuts)*4,'extra_stills':len(key),'captions':metrics,'max_caption_cps':max(m['cps'] for m in metrics),'min_caption_font':min(m['effective_size'] for m in metrics)}
                b.close()
    finally:srv.shutdown()
    (out/'evidence.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({mode:{k:v for k,v in r.items() if k!='captions'} for mode,r in report.items()},ensure_ascii=False),flush=True)

if __name__=='__main__':
    ap=argparse.ArgumentParser();ap.add_argument('root');ap.add_argument('--label',default='final');args=ap.parse_args();run(Path(args.root).resolve(),args.label)
