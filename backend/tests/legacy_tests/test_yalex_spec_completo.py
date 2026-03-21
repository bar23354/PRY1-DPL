from generador_lexico.yalex.compiler import compile_yalex
from generador_lexico.yalex.parser import parse_yalex
from generador_lexico.yalex.runtime import scan


def _compile(src: str):
    return compile_yalex(parse_yalex(src))


def test_set_negado_y_diferencia():
    source = r"""
let vocal = [aeiou]
let minus = [a-z]
let consonante = minus # vocal
rule main =
  consonante+ { return "CONS" }
| [^a-z]+ { return "NOLOWER" }
"""
    compiled = _compile(source)
    tokens = scan(compiled, "bcdf 123")
    assert [token.type for token in tokens] == ["CONS", "NOLOWER"]
    assert [token.lexeme for token in tokens] == ["bcdf", " 123"]


def test_wildcard_y_eof():
    source = r"""
rule main =
  _ { return "ANY" }
| eof { return "EOF" }
"""
    compiled = _compile(source)
    tokens = scan(compiled, "ab")
    assert [token.type for token in tokens] == ["ANY", "ANY", "EOF"]


def test_accion_completa_y_skip():
    source = r"""
{
TOKEN_INT = "TOKEN_INT"
}
let dig = ['0'-'9']
rule main [mode] =
  [' ''\t''\n']+ {
    skip
  }
| dig+ {
    val = int(lexeme)
    if mode == "strict" and val < 0:
        return "ERR"
    print("Encontrado:", lexeme)
    return TOKEN_INT
  }
| eof { return "EOF" }
"""
    compiled = _compile(source)
    tokens = scan(compiled, "10 20", "strict", globals_ctx={"TOKEN_INT": "TOKEN_INT"})
    assert [token.type for token in tokens] == ["TOKEN_INT", "TOKEN_INT", "EOF"]
