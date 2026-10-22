from pathlib import Path
import argparse,bisect,hashlib,io,json,math,re,struct,subprocess
import numpy as np
from PIL import Image
from playwright.sync_api import sync_playwright
from filmtools import server,browser,frame,sheet,probe,run,sha,seal,fingerprint
from audio_checks import compare as compare_continuous,reconstruct
from scipy.interpolate import PchipInterpolator
def srt(p):
    def sec(x):
        h,m,s=x.replace(',','.').split(':');return round(int(h)*3600+int(m)*60+float(s),3)
    r=[]
    for block in re.split(r'\n\s*\n',p.read_text(encoding='utf-8-sig').strip()):
        lines=block.splitlines();a,b=lines[1].split(' --> ');r.append([sec(a),sec(b),''.join(lines[2:])])
    return r
def fonts(root):
    chars={ord(c) for c in ''.join(p.read_text(encoding='utf-8') for p in root.glob('*.js')) if ord(c)>=32};res={}
    for p in (root/'assets').glob('*.ttf'):
        raw=p.read_bytes();n=struct.unpack_from('>H',raw,4)[0];tabs={}
        for i in range(n):
            tag,ch,off,size=struct.unpack_from('>4sIII',raw,12+i*16);tabs[tag]=off
        off=tabs[b'cmap'];groups=[]
        for i in range(struct.unpack_from('>H',raw,off+2)[0]):
            _,_,sub=struct.unpack_from('>HHI',raw,off+4+i*8);pos=off+sub
            if struct.unpack_from('>H',raw,pos)[0]==12:
                groups=[struct.unpack_from('>III',raw,pos+16+j*12) for j in range(struct.unpack_from('>I',raw,pos+12)[0])];break
        starts=[x[0] for x in groups]
        def has(c):
            i=bisect.bisect_right(starts,c)-1;return i>=0 and groups[i][0]<=c<=groups[i][1] and groups[i][2]+c-groups[i][0]>0
        res[p.name]={'checked':len(chars),'missing':''.join(chr(c) for c in sorted(chars) if not has(c))}
    return res
def source_audit(root):
    plan=json.loads((root/'timeline.json').read_text(encoding='utf-8'));review=json.loads((root/'review/source_review.json').read_text(encoding='utf-8'));ss=srt(root/'字幕.srt');assert ss==plan['subtitles']
    srv,url=server(root);overlaps=[];outside=[];read=[];static=[]
    try:
        with sync_playwright() as p:
            b,pg=browser(p,url)
            pg.evaluate('''()=>{window.textBoxes=[];const org=CanvasRenderingContext2D.prototype.fillText;CanvasRenderingContext2D.prototype.fillText=function(str,x,y,...args){org.call(this,str,x,y,...args);if(this!==g||g.globalAlpha<.2||!str)return;const m=this.measureText(str),z=this.getTransform();let pts=[[x-m.actualBoundingBoxLeft,y-m.actualBoundingBoxAscent],[x+m.actualBoundingBoxRight,y-m.actualBoundingBoxAscent],[x+m.actualBoundingBoxRight,y+m.actualBoundingBoxDescent],[x-m.actualBoundingBoxLeft,y+m.actualBoundingBoxDescent]].map(([a,b])=>[z.a*a+z.c*b+z.e,z.b*a+z.d*b+z.f]);textBoxes.push({s:str,x0:Math.min(...pts.map(p=>p[0]))/SCALE,x1:Math.max(...pts.map(p=>p[0]))/SCALE,y0:Math.min(...pts.map(p=>p[1]))/SCALE,y1:Math.max(...pts.map(p=>p[1]))/SCALE})}}''')
            exclude=review['scene_output_starts']+review['cut_output_starts']
            sampled=[]
            for t in np.arange(0,plan['duration'],.5):
                if any(0<=t-x<.8 for x in exclude):continue
                # Internal full-scene shot blends are reviewed in transition sheets.
                src=pg.evaluate('window.sourceAt(window.VISUAL_TIME('+str(float(t))+')).source')
                if any(abs(src-x)<1.2 for x in ([3.8,112.2] if root.name.startswith('04') else [25.5] if root.name.startswith('01') else [])):continue
                sampled.append(float(t));boxes=pg.evaluate('t=>{textBoxes=[];window.seek(t);return textBoxes}',float(t))
                for i,a in enumerate(boxes):
                    if a['x0']<0 or a['y0']<0 or a['x1']>1920 or a['y1']>1080:outside.append({'t':float(t),'text':a['s']})
                    for z in boxes[i+1:]:
                        if a['s']==z['s']:continue
                        inter=max(0,min(a['x1'],z['x1'])-max(a['x0'],z['x0']))*max(0,min(a['y1'],z['y1'])-max(a['y0'],z['y0']))
                        area=min((a['x1']-a['x0'])*(a['y1']-a['y0']),(z['x1']-z['x0'])*(z['y1']-z['y0']))
                        if area>0 and inter/area>.12:overlaps.append({'t':float(t),'a':a['s'],'b':z['s'],'fraction':round(inter/area,3)})
            for a,z,text in ss:
                count=len(re.findall(r'[\u4e00-\u9fffA-Za-z0-9]',text));clear_a=a+.09;clear_z=z-.09;effective=clear_z-clear_a
                read.append({'start':a,'end':z,'text':text,'character_count':count,'effective_start_alpha50':round(clear_a,3),'effective_end_alpha50':round(clear_z,3),'effective_seconds':round(effective,3),'characters_per_effective_second':round(count/effective,2),'review_reason':('有效阅读低于2秒' if effective<2 else '正文停留超过5秒，结合动作/标注检查' if z-a>5 else '正常阅读区间')})
            # Low subject change is a candidate, not a pass/fail or information metric.
            prev=None;low=[]
            for t in np.arange(0,plan['duration'],.5):
                im=Image.open(io.BytesIO(frame(pg,float(t)))).convert('L').crop((180,310,2380,1170)).resize((220,86));ar=np.asarray(im,dtype=float)
                if prev is not None:
                    diff=float(np.mean(abs(ar-prev)));low.append({'t':float(t),'subject_mean_change_255':round(diff,4)})
                prev=ar
            start=None
            for i,x in enumerate(low+[{'t':plan['duration'],'subject_mean_change_255':999}]):
                if x['subject_mean_change_255']<.15 and start is None:start=max(0,x['t']-.5)
                if x['subject_mean_change_255']>=.15 and start is not None:
                    if x['t']-start>=3:static.append({'start':round(start,3),'end':round(x['t'],3),'duration':round(x['t']-start,3)})
                    start=None
            b.close()
    finally:srv.shutdown()
    result={'plan_srt_window_subtitles_match':ss==review['subtitles'],'glyph_ink_sample_times':sampled,'text_overlaps':overlaps,'outside_canvas':outside,'font_coverage':fonts(root),'reading':read,'subject_change_threshold':.15,'subject_change_samples':low,'low_change_candidates_over_3s':static,'note':'低变化候选需结合字幕与动作人工判断；颗粒、呼吸与循环不作为新增信息。字幕0.18秒淡入淡出，50%可见度为有效阅读统计起点。'}
    (root/'review/source_audit.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8');print(root.name,'AUDIT',len(overlaps),'overlaps',len(outside),'outside',len(static),'static candidates',flush=True)
def loud(p):
    x=run(['ffmpeg','-hide_banner','-i',str(p),'-vn','-af','loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json','-f','null','-']).stderr.decode('utf-8',errors='replace');return json.JSONDecoder().raw_decode(x[x.rfind('{'):])[0]
def pcm(p):return np.frombuffer(run(['ffmpeg','-v','error','-i',str(p),'-vn','-ar','48000','-ac','2','-f','f32le','-']).stdout,dtype='<f4').reshape(-1,2)
def audio_compare(x,y,plan):
    n=min(len(x),len(y));x=x[:n];y=y[:n];res={'correlation':float(np.corrcoef(x.ravel(),y.ravel())[0,1]),'rmse':float(np.sqrt(np.mean((x-y)**2))),'sample_frames':n,'alignment_windows':[]}
    checkpoints=[0]+[s['output_start'] for s in plan['segments'][1:]]+[plan['duration']-.4]
    for t in checkpoints:
        i=max(0,round((t-.12)*48000));j=min(n,round((t+.28)*48000));a=x[i:j].mean(axis=1);b=y[i:j].mean(axis=1)
        res['alignment_windows'].append({'output_time':round(t,6),'start':i/48000,'end':j/48000,'correlation':float(np.corrcoef(a,b)[0,1]) if a.std()>.000001 and b.std()>.000001 else None,'rms_reference':float(np.sqrt(np.mean(a*a))),'peak_encoded':float(abs(b).max())})
    # A sample-aligned comparison; no arbitrary file-start offset is assumed.
    return res
def final_check(root):
    plan=json.loads((root/'timeline.json').read_text(encoding='utf-8'));dur=plan['duration'];expected=round(dur*60);review=json.loads((root/'review/source_review.json').read_text(encoding='utf-8'));config=json.loads((root/'baseline_manifest.json').read_text(encoding='utf-8'));info=[]
    assert review['version_id']==fingerprint(root),'Source review is stale'
    assert all(sha(root/n)==h for n,h in review['source_sha256'].items())
    for name in ['横屏_BGM连续修订版_带BGM.mp4','横屏_BGM连续修订版_无BGM.mp4']:
        p=root/'renders'/name;j=probe(p);v=next(x for x in j['streams'] if x['codec_type']=='video');a=next(x for x in j['streams'] if x['codec_type']=='audio');dec=run(['ffmpeg','-v','error','-i',str(p),'-f','null','-']);checks={'size':(v['width'],v['height'])==(2560,1440),'fps':v['avg_frame_rate']=='60/1','frames':int(v['nb_frames'])==expected,'duration':abs(float(v['duration'])-dur)<1/60000,'av_duration':abs(float(a['duration'])-dur)<.025,'h264_yuv420p':v['codec_name']=='h264' and v['pix_fmt']=='yuv420p','bt709_limited':all(v.get(k)==x for k,x in [('color_space','bt709'),('color_primaries','bt709'),('color_transfer','bt709'),('color_range','tv')]),'aac48k_stereo':a['codec_name']=='aac' and a['sample_rate']=='48000' and a['channels']==2,'full_decode':not dec.stderr.strip()};info.append({'name':name,'sha256':sha(p),'probe':j,'checks':checks,'loudness':loud(p),'passed':all(checks.values())})
    sync=json.loads((root/'music_sync.json').read_text(encoding='utf-8'));wav=pcm(root/'audio/score.wav');main=pcm(root/'renders'/info[0]['name']);compare=compare_continuous(wav,main,plan,sync);assert sha(root/'audio/score.wav')==config['source_audio_sha256']==sync['audio_sha256']
    foley=None
    if root.name.startswith('03'):foley=compare_continuous(pcm(root/'audio/foley_only.wav'),pcm(root/'renders'/info[1]['name']),plan,sync)
    comparisons=[];files=[];srv,url=server(root)
    try:
        with sync_playwright() as p:
            b,pg=browser(p,url)
            # Every source review point includes all edit/scene/action boundaries + opening seconds.
            for t in review['all_times']:
                name=root/'review'/f'final_{t:08.4f}.jpg';run(['ffmpeg','-v','error','-y','-ss',f'{max(0,t-.00001):.9f}','-i',str(root/'renders'/info[0]['name']),'-frames:v','1','-q:v','2',str(name)])
                src=np.asarray(Image.open(io.BytesIO(frame(pg,t,True))).convert('RGB'),dtype=float);encoded=np.asarray(Image.open(name).convert('RGB'),dtype=float);mae=float(np.mean(abs(src-encoded)));comparisons.append({'time':t,'mean_rgb_difference':round(mae,4)});files.append((name,f'{t:.3f}s'))
            b.close()
    finally:srv.shutdown()
    sheet(files,root/'review/最终MP4_全部检查点.jpg')
    for name,subset in [('最终MP4_开场逐秒',list(range(16))),('最终MP4_剪接前中后',sorted(set(t for t,k in review['transition_action_times'] if k=='cut')))]:sheet([(root/'review'/f'final_{t:08.4f}.jpg',f'{t:.3f}s') for t in subset],root/'review'/(name+'.jpg'),cols=4,w=480)
    boots=[json.loads(p.read_text(encoding='utf-8')) for p in sorted((root/'renders').glob('full_part*.startup.json'))];assert len(boots)==4 and all(x['version']==fingerprint(root) and x['fonts_loaded']=='loaded' and x['content_mapping_count']==x['music_sync_count']==1 for x in boots)
    segment_samples=[]
    for boot in boots:
        a,z=boot['frames'];ts=[a/60,(a+z)//2/60,(z-1)/60];segment_samples.append({'frames':[a,z],'startup':boot,'final_frame_comparisons':[min(comparisons,key=lambda x:abs(x['time']-t)) for t in ts]})
    reconstruction=reconstruct(root);align=json.loads((root/'review/music_sync_checks.json').read_text(encoding='utf-8'))
    result={'episode':config['episode'],'version':'horizontal-bgm-continuous-v3.0-20261022','version_id':fingerprint(root),'duration':dur,'frames':expected,'media':info,'input_wav_absolute_path':str((root/'audio/score.wav').resolve()),'baseline_wav_absolute_path':str(Path(config['latest_project'])/'audio/score.wav'),'new_mix_wav_sha256':sha(root/'audio/score.wav'),'wav_matches_latest_vertical':True,'continuous_source_reconstruction':reconstruction,'decoded_music_against_new_wav':compare,'decoded_foley_against_new_wav':foley,'final_source_comparisons':comparisons,'render_segment_checks':segment_samples,'source_fingerprint':review['source_sha256'],'subjective_audio_listening':{'full_listened':False,'actual_listened_seconds':0,'note':'没有执行主观试听；提供从最终MP4解码的整段音轨及旧断点前后各3秒、踩点与最后10秒试听文件。客观重建和采样比对不表述为已听感验收。'},'passed':all(i['passed'] for i in info) and compare['passed'] and reconstruction['passed'] and align['passed'] and max(x['mean_rgb_difference'] for x in comparisons)<8 and (foley is None or foley['passed'])}
    (root/'review/final_validation.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8');print(root.name,'FINAL',result['passed'],'maxMAE',max(x['mean_rgb_difference'] for x in comparisons),'audio correlation',compare['whole']['correlation_at_zero_lag'],flush=True)
    assert result['passed']

def sync_check(root):
    plan=json.loads((root/'timeline.json').read_text(encoding='utf-8'));cfg=json.loads((root/'music_sync.json').read_text(encoding='utf-8'));curve=PchipInterpolator(cfg['visual_warp']['new_times'],cfg['visual_warp']['old_times']);srv,url=server(root)
    try:
        with sync_playwright() as p:
            br,pg=browser(p,url);assert pg.evaluate('window.MUSIC_SYNC')==cfg and pg.evaluate('window.PACING')==plan
            dense=np.linspace(0,plan['duration'],501);got=np.array(pg.evaluate('ts=>ts.map(t=>window.VISUAL_TIME(t))',dense.tolist()));err=float(abs(got-curve(dense)).max());assert err<1e-8 and np.all(np.diff(got)>0)
            pg.evaluate('''()=>{window.drawnText=[];window.progressEnds=[];const ft=CanvasRenderingContext2D.prototype.fillText;CanvasRenderingContext2D.prototype.fillText=function(s,...a){if(this===g&&this.globalAlpha>.05)window.drawnText.push(s);return ft.call(this,s,...a)};const ln=line;line=function(pts,c,...a){if(pts.length===2&&pts[0][0]===144&&pts[0][1]===1064&&pts[1][1]===1064&&c.endsWith('80'))window.progressEnds.push(pts[1][0]);return ln(pts,c,...a)}}''')
            caption_rows=[]
            for a,b,s in plan['subtitles']:
                for t in [a+.1,(a+b)/2,b-.1]:
                    r=pg.evaluate('t=>{drawnText=[];progressEnds=[];window.seek(t);return {caption:window.CAPTION_TIME,output:window.OUTPUT_TIME,text:drawnText,ends:progressEnds}}',t)
                    assert r['caption']==t and r['output']==t and r['text'].count(s)==1,(t,s,r)
                    assert all(abs(x-(144+1632*t/plan['duration']))<1e-7 for x in r['ends']),r
                caption_rows.append({'start':a,'end':b,'text':s,'actual_text_once_at_three_points':True,'caption_and_progress_clock_unchanged':True})
            cues=[]
            for cue in cfg['cues']:
                t=cue['new_output_time'];frame_no=round(t*60);actual=frame_no/60;v=pg.evaluate('t=>window.VISUAL_TIME(t)',actual)
                cues.append({**cue,'render_frame':frame_no,'actual_frame_time':actual,'visual_content_time_at_frame':v,'visual_time_target_error_ms':abs(v-cue['old_output_time'])*1000,'frame_to_music_attack_ms':abs(actual-cue['source_music_attack'])*1000,'kind':'动作/音效落点' if '木块' in cue['label'] else '原场景叠化中心'})
            foley=[]
            if root.name.startswith('03'):
                for i,e in enumerate(cfg['foley']):
                    t=round(e['new_output_time']*60)/60;r=pg.evaluate('t=>{window.seek(t);return window.ACTION_DIAGNOSTICS?window.ACTION_DIAGNOSTICS(t):null}',t);foley.append({'index':i+1,'sound_sample_start':e['sample_start'],'sound_start_seconds':e['sample_start']/48000,'render_frame':round(t*60),'frame_time':t,'frame_to_sound_ms':abs(t-e['sample_start']/48000)*1000,'geometry':r})
            result={'version_id':fingerprint(root),'visual_pchip_max_error':err,'visual_pchip_monotone':True,'content_mapping_count':1,'music_visual_mapping_count':1,'captions':caption_rows,'cues':cues,'foley':foley,'passed':err<1e-8 and all(x['visual_time_target_error_ms']<1e-3 for x in cues)}
            if root.name.startswith('03'):result['passed']=result['passed'] and all(x['geometry'] and x['geometry']['maximum_contact_error_px']<.5 for x in foley)
            (root/'review/music_sync_checks.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8');assert result['passed'],result
            br.close();print(root.name,'SYNC PASS',len(cues),'cues',len(caption_rows),'locked captions',flush=True)
    finally:srv.shutdown()
def main():
    ap=argparse.ArgumentParser();ap.add_argument('root',type=Path);ap.add_argument('--source',action='store_true');ap.add_argument('--final',action='store_true');a=ap.parse_args();root=a.root.resolve()
    if a.source:source_audit(root);sync_check(root)
    if a.final:final_check(root)
if __name__=='__main__':main()
