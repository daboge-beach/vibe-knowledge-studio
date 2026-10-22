from pathlib import Path
import json,subprocess
def audition(root):
 d=root/'review/最终成片音轨与试听';d.mkdir(exist_ok=True);src=root/'renders/横屏_BGM连续修订版_带BGM.mp4';plan=json.loads((root/'timeline.json').read_text(encoding='utf-8'));cfg=json.loads((root/'music_sync.json').read_text(encoding='utf-8'))
 subprocess.run(['ffmpeg','-v','error','-y','-i',str(src),'-vn','-c:a','pcm_s16le',str(d/'最终MP4实际解码音轨.wav')],check=True)
 checks=[('旧断点',s['output_start'],3) for s in plan['segments'][1:]]+[('踩点',c['new_output_time'],.75) for c in cfg['cues']]+[('最后10秒',plan['duration']-5,5)]
 for label,t,span in checks:
  a=max(0,t-span);b=min(plan['duration'],t+span)
  subprocess.run(['ffmpeg','-v','error','-y','-ss',str(a),'-i',str(src),'-t',str(b-a),'-vn','-c:a','pcm_s16le',str(d/f'{label}_{t:08.3f}s.wav')],check=True)
 (d/'试听范围说明.json').write_text(json.dumps({'actual_subjective_listening_seconds':0,'whole_final_audio_exported':True,'clips':[{'label':l,'start':max(0,t-s),'end':min(plan['duration'],t+s)} for l,t,s in checks],'note':'从最终MP4实际解码的待试听文件；生成或客观比较不表示主观听过。'},ensure_ascii=False,indent=2),encoding='utf-8')
