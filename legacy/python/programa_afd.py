# Wrapper legado para mantener compatibilidad con ejecuciones antiguas.
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
BACKEND_SRC = REPO_ROOT / 'backend' / 'src'
if str(Path(__file__).resolve().parent) not in sys.path:
    sys.path.insert(0, str(Path(__file__).resolve().parent))
if str(BACKEND_SRC) not in sys.path:
    sys.path.insert(1, str(BACKEND_SRC))
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(2, str(REPO_ROOT))

from main import main

if __name__ == '__main__':
    main()
