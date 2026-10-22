"""Versioned candidate archives. Never promote subjective checks or user acceptance."""
from pathlib import Path
import argparse,json,hashlib,zipfile,shutil,sys
from filmtools import sha,fingerprint
TOOLS=['filmtools.py','quality.py','audio_checks.py','covers_export.py','cue_frames.py','standards_audit.py','sample_gate.py','candidate_package.py','audio_export.py','post_evidence.py']
def dump(p,x):p.write_text(json.dumps(x,ensure_ascii=False,indent=2),encoding='utf-8')
def manifest(folder,name):
 files=[p for p in sorted(folder.rglob('*')) if p.is_file() and p.name not in [name,'SHA256校验.txt'] and '__pycache__' not in p.parts]
 rows=[{'path':p.relative_to(folder).as_posix(),'bytes':p.stat().st_size,'sha256':sha(p)} for p in files]
 dump(folder/name,rows);(folder/'SHA256校验.txt').write_text(''.join(x['sha256']+'  '+x['path']+'\n' for x in rows),encoding='utf-8');return files+[folder/name,folder/'SHA256校验.txt']
def zipped(files,base,path):
 path.parent.mkdir(parents=True,exist_ok=True)
 with zipfile.ZipFile(path,'w',zipfile.ZIP_DEFLATED,compresslevel=4) as z:
  for p in sorted(files):z.write(p,p.relative_to(base).as_posix())
 with zipfile.ZipFile(path) as z:
  assert z.testzip() is None
  for p in files:assert hashlib.sha256(z.read(p.relative_to(base).as_posix())).hexdigest()==sha(p)
def make(root):
 root=Path(root).resolve();tools=Path(__file__).resolve().parent
 q=json.loads((root/'review/final_validation.json').read_text(encoding='utf-8'));assert q['passed'] and q['version_id']==fingerprint(root)
 gate=json.loads((root/'review/代表片段/样片关口.json').read_text(encoding='utf-8'));assert gate['runtime_id']==q['version_id'],'Representative clips must match current render'
 sync=json.loads((root/'review/music_sync_checks.json').read_text(encoding='utf-8'));assert sync['version_id']==q['version_id'] and sync['passed']
 for n,h in q['source_fingerprint'].items():assert sha(root/n)==h,n
 for m in q['media']:assert sha(root/'renders'/m['name'])==m['sha256']
 if tools.resolve()!=root.resolve():
  for n in TOOLS:shutil.copy2(tools/n,root/n)
 post=root/'review/补充成片证据.json'
 ev=json.loads(post.read_text(encoding='utf-8')) if post.exists() else {}
 if ev.get('version_id')!=q['version_id'] or ev.get('final_media_sha256')!=[m['sha256'] for m in q['media']]:
  from post_evidence import run as supplement_final
  supplement_final(root);q=json.loads((root/'review/final_validation.json').read_text(encoding='utf-8'))
 (root/'package.py').write_text('from pathlib import Path\nfrom candidate_package import make\nif __name__=="__main__":make(Path(__file__).resolve().parent)\n',encoding='utf-8')
 (root/'deliver.py').write_text('from candidate_package import make\nfrom pathlib import Path\nif __name__=="__main__":make(Path(__file__).resolve().parent)\n',encoding='utf-8')
 version=json.loads((root/'版本清单.json').read_text(encoding='utf-8'))
 version.update({'runtime':json.loads((root/'runtime_version.json').read_text(encoding='utf-8')),'media':q['media'],'tool_sha256':{p.name:sha(p) for p in root.glob('*.py')},'status':'待验收候选','full_human_viewing':False,'subjective_listening_seconds':0,'user_accepted':False,'publicly_published':False})
 dump(root/'版本清单.json',version)
 standalone=root.parent.name!='工程';base=root/'本地交付_v3.1' if standalone else root.parents[1]
 release=base/'发布包'/root.name;release.mkdir(parents=True,exist_ok=True);archives=base/'压缩包'
 for m,label in zip(q['media'],['带BGM','无BGM']):shutil.copy2(root/'renders'/m['name'],release/f'{root.name}_横屏_v3.1_{label}.mp4')
 for p in (root/'covers').iterdir():
  if p.is_file():shutil.copy2(p,release/p.name)
 for n in ['发布文案.md','包装承诺对照.md','定稿文案.txt','字幕.srt','内容来源.md','BGM来源说明.md','问题修复与最终验证.md','实际质检记录.md','版本清单.json','timeline.json','music_sync.json']:
  shutil.copy2(root/n,release/n)
 shutil.copytree(root/'audio',release/'定稿混音',dirs_exist_ok=True)
 rd=release/'实际检查记录';rd.mkdir(exist_ok=True)
 for p in (root/'review').iterdir():
  if p.is_file() and not p.name.startswith(('source_','final_','内部参考')) and p.suffix in ['.json','.md','.txt']:shutil.copy2(p,rd/p.name)
 for n in ['最终手机单帧','最终成片音轨与试听','代表片段']:shutil.copytree(root/'review'/n,rd/n,dirs_exist_ok=True)
 (release/'候选状态说明.md').write_text('本版为待验收候选。完整正常速度观看未做，主观完整试听0秒，真实平台UI未验证，用户未验收，未公开发布。发布包是文件用途分类，不代表已获发布许可或全部验收通过。音乐跨平台授权状态见BGM来源说明；无BGM版另附。\n',encoding='utf-8')
 rfiles=manifest(release,'文件清单.json');rzip=archives/(root.name+'_横屏规范修订_发布包_v3.1.zip');zipped(rfiles,release,rzip)
 excludes=['renders','__pycache__','本地交付_v3.1'];sfiles=[p for p in sorted(root.rglob('*')) if p.is_file() and not any(x in p.relative_to(root).parts for x in excludes) and p.name not in ['工程文件清单.json','SHA256校验.txt']]
 entries=[{'path':p.relative_to(root).as_posix(),'bytes':p.stat().st_size,'sha256':sha(p)} for p in sfiles];dump(root/'工程文件清单.json',entries);(root/'SHA256校验.txt').write_text(''.join(x['sha256']+'  '+x['path']+'\n' for x in entries),encoding='utf-8');sfiles += [root/'工程文件清单.json',root/'SHA256校验.txt']
 szip=archives/(root.name+'_横屏规范修订_可修改工程_v3.1.zip');zipped(sfiles,root,szip)
 result={'episode':root.name,'version':'v3.1','status':'待验收候选','release_zip':str(rzip),'release_sha256':sha(rzip),'source_zip':str(szip),'source_sha256':sha(szip),'crc_and_in_archive_sha_checked':True,'independent_unzip_run':'待实际执行后见独立工程解压验证记录','subjective_listening_seconds':0,'full_human_viewing':False,'user_accepted':False,'publicly_published':False}
 dump(base/(root.name+'_打包记录.json'),result);print(root.name,'CANDIDATE ARCHIVES BUILT',flush=True)
if __name__=='__main__':
 ap=argparse.ArgumentParser();ap.add_argument('root',type=Path);make(ap.parse_args().root)
