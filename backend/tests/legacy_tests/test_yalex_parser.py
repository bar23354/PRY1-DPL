from generador_lexico.yalex.parser import parse_yalex


def test_parsea_yalex_basico():
    source = """
(* comentario *)
let digito = ['0'-'9']
let numero = digito+

rule tokens =
  numero { return NUM }
| '+' { return PLUS }
"""
    spec = parse_yalex(source)
    assert spec.entrypoint == "tokens"
    assert set(spec.lets.keys()) == {"digito", "numero"}
    assert len(spec.rules) == 2
    assert spec.rules[0].pattern == "numero"
    assert spec.rules[1].action == "return PLUS"
