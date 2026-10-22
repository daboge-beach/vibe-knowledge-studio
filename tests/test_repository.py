"""Public archive checks: asset integrity, timelines, entry paths and license boundaries."""
from pathlib import Path
import ast
import gzip
import hashlib
import json
import re
import unittest

ROOT=Path(__file__).resolve().parents[1]
PROJECT=json.loads((ROOT/'project.json').read_text('utf-8'))

class RepositoryTests(unittest.TestCase):
    def test_eight_current_projects(self):
        self.assertEqual({e['id'] for e in PROJECT['episodes']}, {f'{m}-{n:02d}' for m in ('vertical','horizontal') for n in range(1,5)})
        for e in PROJECT['episodes']:
            root=ROOT/e['path']
            plan=json.loads((root/'timeline.json').read_text('utf-8'))
            self.assertAlmostEqual(plan['duration'],e['duration'])
            self.assertFalse(e['user_accepted'])
            self.assertFalse(e['full_subjective_review_done'])
            self.assertTrue((root/'index.html').is_file())
            self.assertTrue((root/'字幕.srt').is_file())
            last=0
            for seg in plan['segments']:
                self.assertAlmostEqual(seg['output_start'],last)
                self.assertGreater(seg['source_end'],seg['source_start'])
                last=seg['output_end']
            self.assertAlmostEqual(last,e['duration'])
            for a,b,_ in plan['subtitles']:
                self.assertGreater(b,a);self.assertGreaterEqual(a,0);self.assertLessEqual(b,e['duration'])

    def test_script_references_are_local_and_present(self):
        for e in PROJECT['episodes']:
            root=ROOT/e['path']
            html=(root/'index.html').read_text('utf-8')
            for src in re.findall(r'<script src="([^"]+)"',html):
                path=src.split('?')[0]
                self.assertNotIn('://',path)
                self.assertTrue((root/path).is_file(),path)
            self.assertNotIn('runtime_version.js',html)

    def test_foley_is_original_lossless_archive(self):
        for e in PROJECT['episodes']:
            if e['foley_asset']:
                data=gzip.decompress((ROOT/e['foley_asset']).read_bytes())
                self.assertEqual(hashlib.sha256(data).hexdigest(),e['foley_sha256'])
                self.assertEqual(data[:4],b'RIFF')
                self.assertEqual(data[8:12],b'WAVE')

    def test_font_sources_are_pinned_with_license(self):
        lock=json.loads((ROOT/'assets/fonts.lock.json').read_text('utf-8'))
        self.assertRegex(lock['google_fonts_commit'],r'^[a-f0-9]{40}$')
        for f in lock['fonts']:
            self.assertIn(lock['google_fonts_commit'],f['url'])
            self.assertTrue(f['url'].startswith('https://raw.githubusercontent.com/google/fonts/'))
            self.assertRegex(f['sha256'],r'^[a-f0-9]{64}$')
        self.assertTrue((ROOT/'licenses/OFL-NotoSansSC.txt').is_file())
        self.assertTrue((ROOT/'licenses/OFL-NotoSerifSC.txt').is_file())
        self.assertTrue((ROOT/'licenses/upstream-vibe-LICENSE.txt').is_file())

    def test_portable_python_parses(self):
        for p in list((ROOT/'tools').glob('*.py'))+list((ROOT/'episodes').glob('*/*/render.py')):
            ast.parse(p.read_text('utf-8'),filename=str(p))

if __name__=='__main__':unittest.main()
