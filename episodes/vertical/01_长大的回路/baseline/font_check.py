from pathlib import Path
import bisect,json,struct,sys
BASE=Path(__file__).resolve().parent.parent
roots=[Path(sys.argv[1]).resolve()] if len(sys.argv)>1 else [BASE/folder for folder in ['第一集_孩子大脑发育简史_重制版','第二集_辅食规则50年反转史_重制版']]
for root in roots:
    (root/'review').mkdir(exist_ok=True)
    text=''.join((root/f).read_text(encoding='utf-8') for f in ['episode.js','scenes.js','art.js','film.js','engine.js'])
    chars={ord(c) for c in text if ord(c)>=32};result={}
    for name in ['NotoSansSC-VF.ttf','NotoSerifSC-VF.ttf']:
        raw=(root/'assets'/name).read_bytes();nt=struct.unpack_from('>H',raw,4)[0];tables={}
        for i in range(nt):
            tag,checksum,off,size=struct.unpack_from('>4sIII',raw,12+i*16);tables[tag]=(off,size)
        off=tables[b'cmap'][0];n=struct.unpack_from('>H',raw,off+2)[0];groups=[]
        for i in range(n):
            platform,enc,sub=struct.unpack_from('>HHI',raw,off+4+i*8);pos=off+sub;fmt=struct.unpack_from('>H',raw,pos)[0]
            if fmt==12:
                count=struct.unpack_from('>I',raw,pos+12)[0];groups=[struct.unpack_from('>III',raw,pos+16+j*12) for j in range(count)];break
        assert groups,'Need format12 cmap'
        starts=[r[0] for r in groups]
        def present(c):
            i=bisect.bisect_right(starts,c)-1;return i>=0 and groups[i][0]<=c<=groups[i][1] and groups[i][2]+c-groups[i][0]>0
        missing=''.join(chr(c) for c in sorted(chars) if not present(c));result[name]={'checked_codepoints':len(chars),'missing':missing};assert not missing,missing
    (root/'review/font_coverage.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8');print(root.name,result,flush=True)
