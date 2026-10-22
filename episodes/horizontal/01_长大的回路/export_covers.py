from pathlib import Path
import argparse
from covers_export import export
if __name__=="__main__":
 ap=argparse.ArgumentParser();ap.add_argument("--out",type=Path);a=ap.parse_args();export(Path(__file__).resolve().parent,a.out)
