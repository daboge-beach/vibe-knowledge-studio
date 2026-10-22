"""Keep the same edited picture and local foley; add platform-cleared music on upload."""
from pathlib import Path
import json,subprocess
ROOT=Path(__file__).resolve().parent
out=ROOT/'renders/vertical_platform_music.mp4'
subprocess.run(['ffmpeg','-v','error','-y','-i',str(ROOT/'renders/vertical_raw.mp4'),'-i',str(ROOT/'audio/foley_only.wav'),'-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-b:a','192k','-ar','48000','-t','130','-movflags','+faststart',str(out)],check=True)
info=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(out)]))
audio=next(s for s in info['streams'] if s['codec_type']=='audio');video=next(s for s in info['streams'] if s['codec_type']=='video')
assert audio['channels']==2 and audio['codec_name']=='aac'
assert abs(float(audio['duration'])-130)<.05 and int(video['nb_frames'])==3900
checked=subprocess.run(['ffmpeg','-v','error','-i',str(out),'-f','null','-'],capture_output=True)
assert checked.returncode==0 and not checked.stderr
print(out,flush=True)
