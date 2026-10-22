from pathlib import Path
import argparse
from quality import source_audit,sync_check,final_check
from cue_frames import supplement
if __name__=="__main__":
 ap=argparse.ArgumentParser();ap.add_argument("--source",action="store_true");ap.add_argument("--final",action="store_true");a=ap.parse_args();r=Path(__file__).resolve().parent
 if a.source:source_audit(r);sync_check(r)
 if a.final:final_check(r);supplement(r)
