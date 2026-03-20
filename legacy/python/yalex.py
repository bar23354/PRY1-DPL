import argparse
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
BACKEND_SRC = REPO_ROOT / 'backend' / 'src'
if str(BACKEND_SRC) not in sys.path:
    sys.path.insert(0, str(BACKEND_SRC))
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(1, str(REPO_ROOT))

from laboratorio.yalex_codegen import write_lexer_file
from laboratorio.yalex_compiler import compile_yalex
from laboratorio.yalex_parser import parse_yalex

def main() -> None:
    parser = argparse.ArgumentParser(description="Generador YALex MVP")
    parser.add_argument("yal_file", help="Archivo fuente .yal")
    parser.add_argument("-o", "--output", required=True, help="Nombre base del lexer de salida")
    args = parser.parse_args()

    yal_path = Path(args.yal_file)
    text = yal_path.read_text(encoding="utf-8")
    spec = parse_yalex(text)
    compiled = compile_yalex(spec)
    out_path = write_lexer_file(compiled, args.output)

    print(f"Archivo generado: {out_path}")
    print(f"Entrypoint: {compiled.entrypoint}")
    print(f"Reglas compiladas: {len(compiled.rules)}")
    print(f"Header: {'si' if bool(compiled.header.strip()) else 'no'}")
    print(f"Trailer: {'si' if bool(compiled.trailer.strip()) else 'no'}")

if __name__ == "__main__":
    main()
