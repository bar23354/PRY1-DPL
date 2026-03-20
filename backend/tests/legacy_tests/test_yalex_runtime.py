from laboratorio.yalex_compiler import compile_yalex
from laboratorio.yalex_parser import parse_yalex
from laboratorio.yalex_runtime import scan


def _compile(src: str):
    return compile_yalex(parse_yalex(src))


def test_longest_match_y_prioridad_por_orden():
    source = """
rule tokens =
  "==" { return EQEQ }
| "=" { return EQ }
| [' ''\\t''\\n']+ {}
"""
    compiled = _compile(source)
    tokens = scan(compiled, "== =")
    assert [token.type for token in tokens] == ["EQEQ", "EQ"]
    assert [token.lexeme for token in tokens] == ["==", "="]


def test_identificador_y_numero_en_estilo_basico():
    source = """
let delimitador = [' ''\\t''\\n']
let espacioEnBlanco = delimitador+
let digito = ['0'-'9']
let numero = '-'?digito+
let letra = ['a'-'z''A'-'Z']
let identificador = letra(letra|digito)*

rule tokens =
  espacioEnBlanco {}
| identificador { return IDENT }
| numero { return NUM }
| '+' { return PLUS }
"""
    compiled = _compile(source)
    tokens = scan(compiled, "abc + -12")
    assert [(token.type, token.lexeme) for token in tokens] == [
        ("IDENT", "abc"),
        ("PLUS", "+"),
        ("NUM", "-12"),
    ]
