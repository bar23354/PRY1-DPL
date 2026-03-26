from __future__ import annotations

import argparse
from pathlib import Path

from laboratorio.yalex_codegen import write_lexer_file
from laboratorio.yalex_compiler import compile_yalex
from laboratorio.yalex_parser import parse_yalex


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Compila un archivo .yal y genera un lexer Python standalone."
    )
    parser.add_argument("spec", help="Ruta al archivo de especificacion YALex (.yal).")
    parser.add_argument(
        "output",
        help="Ruta de salida del lexer generado (.py).",
    )
    args = parser.parse_args()

    spec_path = Path(args.spec)
    if not spec_path.exists():
        raise FileNotFoundError(f"No existe la especificacion: {spec_path}")

    source = spec_path.read_text(encoding="utf-8")
    compiled = compile_yalex(parse_yalex(source))
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output = write_lexer_file(compiled, output_path)
    print(f"Lexer generado en: {output}")


if __name__ == "__main__":
    main()
