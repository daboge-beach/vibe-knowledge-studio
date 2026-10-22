"""Inspect encoded files, compare them to final source stills, refresh samples."""
from pathlib import Path
import argparse,hashlib,io,json,math,subprocess
from PIL import Image,ImageChops,ImageDraw,ImageStat

def run(root):
    out=root/'review/exports';out.mkdir(exist_ok=True)
    times=[1.5,14,27.5,35.5,51,62,74.8,80.5,96.5,101.0,105.5,118,128.5];report={}
    for mode in ['vertical','horizontal']:
        path=root/f'renders/final_{mode}.mp4';shots=[];rows=[]
        tw,th=(270,480) if mode=='vertical' else (480,270)
        for t in times:
            data=subprocess.check_output(['ffmpeg','-v','error','-threads','2','-ss',str(t),'-i',str(path),'-frames:v','1','-f','image2pipe','-c:v','png','-'])
            im=Image.open(io.BytesIO(data)).convert('RGB');im.save(out/f'{mode}_{t:05.1f}.jpg',quality=95)
            ref=Image.open(root/f'review/{mode}_{t:05.1f}.png').convert('RGB');a=im.copy();b=ref.copy();a.thumbnail((270,480) if mode=='vertical' else (480,270));b.thumbnail(a.size)
            delta=sum(ImageStat.Stat(ImageChops.difference(a,b)).mean)/3
            assert delta<9,(mode,t,delta)
            rows.append({'time':t,'mean_RGB_difference_0_255':round(delta,4)});im.thumbnail((tw,th));shots.append(im)
        sheet=Image.new('RGB',(tw*4,(th+25)*math.ceil(len(times)/4)),'#0d1b20');d=ImageDraw.Draw(sheet)
        for i,im in enumerate(shots):
            x,y=(i%4)*tw,(i//4)*(th+25);sheet.paste(im,(x,y));d.text((x+8,y+th+4),f'{times[i]:05.1f}s',fill='#e9c485')
        sheet.save(out/f'{mode}_sheet.jpg',quality=95)
        report[mode]={'file':path.name,'source_matches_encoded_stills':True,'compared_frames':len(times),'frames':rows}
    preview=root/'renders/vertical_preview_30s.mp4'
    subprocess.run(['ffmpeg','-v','error','-y','-i',str(root/'renders/final_vertical.mp4'),'-t','30','-map','0:v','-map','0:a','-c','copy','-movflags','+faststart',str(preview)],check=True)
    (root/'review/export_check.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8');print(json.dumps({m:{k:v for k,v in r.items() if k!='frames'} for m,r in report.items()},ensure_ascii=False),flush=True)

if __name__=='__main__':
    ap=argparse.ArgumentParser();ap.add_argument('root');args=ap.parse_args();run(Path(args.root).resolve())
