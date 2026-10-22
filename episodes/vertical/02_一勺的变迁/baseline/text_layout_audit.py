"""Record actual glyph ink bounds through Canvas transforms; detect overlapping text."""
from pathlib import Path
import argparse,json,sys
from playwright.sync_api import sync_playwright

def run(root):
    sys.path.insert(0,str(root));import render
    srv,url=render.server();results={}
    try:
        with sync_playwright() as p:
            for mode in ['vertical','horizontal']:
                b,pg=render.browser(p,url,mode)
                pg.evaluate('''()=>{window.textBounds=[];const original=text;window.text=function(str,x,y,...rest){original(str,x,y,...rest);if(g.globalAlpha<.08||!str)return;const m=g.measureText(str),z=g.getTransform();const points=[[x-m.actualBoundingBoxLeft,y-m.actualBoundingBoxAscent],[x+m.actualBoundingBoxRight,y-m.actualBoundingBoxAscent],[x+m.actualBoundingBoxRight,y+m.actualBoundingBoxDescent],[x-m.actualBoundingBoxLeft,y+m.actualBoundingBoxDescent]].map(([a,b])=>({x:z.a*a+z.c*b+z.e,y:z.b*a+z.d*b+z.f}));window.textBounds.push({text:str,x0:Math.min(...points.map(p=>p.x)),x1:Math.max(...points.map(p=>p.x)),y0:Math.min(...points.map(p=>p.y)),y1:Math.max(...points.map(p=>p.y))})}}''')
                times=[1.5,5.8,9.3,14,19.5,23.5,27.5,31,35.5,39.2,43.5,46.7,51,55,62,66.5,70.5,74.8,80.5,84.5,91,96.5,101,105.5,109.5,114,118,122.3,126.5,128.5]
                overlaps=[]
                for t in times:
                    boxes=pg.evaluate('t=>{window.textBounds=[];seek(t);return window.textBounds}',t)
                    for i,a in enumerate(boxes):
                        for z in boxes[i+1:]:
                            if a['text']==z['text']:continue
                            overlap=max(0,min(a['x1'],z['x1'])-max(a['x0'],z['x0']))*max(0,min(a['y1'],z['y1'])-max(a['y0'],z['y0']))
                            area=min((a['x1']-a['x0'])*(a['y1']-a['y0']),(z['x1']-z['x0'])*(z['y1']-z['y0']))
                            if area>0 and overlap/area>.04:overlaps.append({'time':t,'first':a['text'],'second':z['text'],'overlap_fraction':round(overlap/area,3)})
                results[mode]={'sampled_times':len(times),'overlaps':overlaps};b.close()
    finally:srv.shutdown()
    (root/'review/text_layout_audit.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf-8');print(json.dumps(results,ensure_ascii=False),flush=True)
    if any(r['overlaps'] for r in results.values()):raise SystemExit('Text overlaps detected')

if __name__=='__main__':
    ap=argparse.ArgumentParser();ap.add_argument('root');args=ap.parse_args();run(Path(args.root).resolve())
