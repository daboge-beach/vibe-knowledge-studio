"""Use the portable studio entry; legacy scripts are historical reference only."""
from pathlib import Path
import subprocess, sys
root = Path(__file__).resolve().parents[3]
command = 'preview' if '--serve' in sys.argv else 'check' if '--review' in sys.argv else 'render' if '--render' in sys.argv else None
if command is None:
    raise SystemExit('Use: python tools/studio.py list (from repository root)')
raise SystemExit(subprocess.call([sys.executable, str(root/'tools/studio.py'), command, 'horizontal-03']))
