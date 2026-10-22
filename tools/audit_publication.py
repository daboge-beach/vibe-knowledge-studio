"""Scan Git-tracked files before publishing; report file names, never secret values."""
from pathlib import Path
import json
import re
import subprocess
import sys

ROOT=Path(__file__).resolve().parents[1]
PATTERNS={
    'credential':r'gh[pousr]_[A-Za-z0-9_]{30,}|github_pat_[A-Za-z0-9_]{30,}|sk-[A-Za-z0-9]{30,}',
    'private-key':r'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY',
    'personal-home-path':r'[A-Z]:[\\/]Users[\\/]',
}
def main():
    names=subprocess.check_output(['git','ls-files','-z'],cwd=ROOT).decode('utf-8').split('\0')
    findings=[];count=0;size=0
    for name in filter(None,names):
        p=ROOT/name;data=p.read_bytes();count+=1;size+=len(data)
        if p.suffix.lower() in {'.mp4','.mov','.wav','.mp3','.m4a','.aac','.ttf','.zip','.pem','.key','.p12','.pfx'} or p.name=='.env' or p.name.startswith('.env.'):
            findings.append({'file':name,'kind':'excluded-file'})
        if len(data)>50*1024*1024:findings.append({'file':name,'kind':'large-file'})
        if p.suffix.lower() in {'.gz','.png','.jpg','.jpeg'}:continue
        text=data.decode('utf-8')
        for label,pattern in PATTERNS.items():
            if re.search(pattern,text):findings.append({'file':name,'kind':label})
    result={'tracked_files':count,'bytes':size,'findings':findings,'scope':'heuristic scan of tracked files, not a guarantee of absence of all sensitive content'}
    print(json.dumps(result,ensure_ascii=False,indent=2))
    return 1 if findings else 0
if __name__=='__main__':sys.exit(main())
