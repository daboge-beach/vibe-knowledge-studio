from pathlib import Path
import base64,io
from PIL import Image
from playwright.sync_api import sync_playwright
from filmtools import server,browser
def export(root,out=None):
    root=Path(root).resolve();out=Path(out).resolve() if out else root/'covers';out.mkdir(parents=True,exist_ok=True)
    srv,url=server(root)
    try:
        with sync_playwright() as p:
            b,pg=browser(p,url);pg.add_script_tag(url=url+'covers.js')
            for platform,ratio,name in [('bilibili','16:9','B站封面_16比9'),('toutiao','16:9','今日头条封面_16比9'),('bilibili','4:3','B站封面_4比3备用')]:
                pg.evaluate('([p,r])=>renderCover(p,r)',[platform,ratio]);data=base64.b64decode(pg.evaluate('c.toDataURL("image/png").split(",")[1]'));(out/(name+'.png')).write_bytes(data)
                Image.open(io.BytesIO(data)).convert('RGB').resize((1920,1080) if ratio=='16:9' else (1440,1080),Image.Resampling.LANCZOS).save(out/(name+'.jpg'),quality=94,subsampling=0)
            b.close()
    finally:srv.shutdown()
