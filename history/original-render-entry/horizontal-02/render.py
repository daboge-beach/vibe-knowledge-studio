from pathlib import Path
import sys
from filmtools import main
if __name__=="__main__":
 sys.argv.insert(1,str(Path(__file__).resolve().parent));main()
