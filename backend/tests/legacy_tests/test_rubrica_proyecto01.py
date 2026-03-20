from pathlib import Path

import pytest

from laboratorio.yalex_compiler import compile_yalex
from laboratorio.yalex_parser import parse_yalex
from laboratorio.yalex_runtime import YalexLexError, scan


ROOT = Path(__file__).resolve().parents[3]
FIXTURES_ROOT = ROOT / "fixtures" / "legacy"


def _compile_from_file(rel_path: str):
    text = (FIXTURES_ROOT / rel_path).read_text(encoding="utf-8")
    return compile_yalex(parse_yalex(text))


def test_diagrama_transicion_se_puede_generar_desde_reglas_compiladas():
    compiled = _compile_from_file("yalex/yalex_alta.yal")
    transiciones_totales = 0
    for rule in compiled.rules:
        if rule.is_eof:
            continue
        afd = rule.afd
        assert "transiciones" in afd
        assert "estadoInicial" in afd
        assert "estadosAceptacion" in afd
        transiciones_totales += sum(len(mapa) for mapa in afd["transiciones"].values())
    assert transiciones_totales > 0


def test_baja_identifica_tokens_en_entrada_plana():
    compiled = _compile_from_file("yalex/yalex_baja.yal")
    text = (FIXTURES_ROOT / "inputs/yalex_baja_input.txt").read_text(encoding="utf-8")
    tokens = scan(compiled, text)
    assert [token.type for token in tokens] == ["IDENT", "PLUS", "NUM", "TIMES", "NUM", "ASSIGN", "IDENT"]


def test_baja_detecta_error_lexico_en_entrada_invalida():
    compiled = _compile_from_file("yalex/yalex_baja.yal")
    with pytest.raises(YalexLexError):
        scan(compiled, "var @ -4")


def test_baja_modificada_identifica_tokens_nuevos():
    source = (FIXTURES_ROOT / "yalex/yalex_baja.yal").read_text(encoding="utf-8")
    source += "\n| '-' { return MINUS }\n"
    compiled = compile_yalex(parse_yalex(source))
    tokens = scan(compiled, "abc - 12")
    assert [token.type for token in tokens] == ["IDENT", "MINUS", "NUM"]


def test_baja_modificada_detecta_error_lexico():
    source = (FIXTURES_ROOT / "yalex/yalex_baja.yal").read_text(encoding="utf-8")
    source += "\n| '-' { return MINUS }\n"
    compiled = compile_yalex(parse_yalex(source))
    with pytest.raises(YalexLexError):
        scan(compiled, "abc % 12")


def test_media_identifica_tokens_en_entrada_plana():
    compiled = _compile_from_file("yalex/yalex_media.yal")
    text = (FIXTURES_ROOT / "inputs/yalex_media_input.txt").read_text(encoding="utf-8")
    tokens = scan(compiled, text)
    assert [token.type for token in tokens] == ["IF", "ID", "RELOP", "INT", "ELSE", "WHILE", "ID", "RELOP", "STRING"]


def test_media_detecta_error_lexico_en_entrada_invalida():
    compiled = _compile_from_file("yalex/yalex_media.yal")
    with pytest.raises(YalexLexError):
        scan(compiled, "if nombre $ 10")


def test_media_modificada_identifica_tokens_nuevos():
    source = (FIXTURES_ROOT / "yalex/yalex_media.yal").read_text(encoding="utf-8")
    source = source.replace('| "if" { return IF }', '| "for" { return FOR }\n| "if" { return IF }')
    compiled = compile_yalex(parse_yalex(source))
    tokens = scan(compiled, "for i")
    assert [token.type for token in tokens] == ["FOR", "ID"]


def test_media_modificada_detecta_error_lexico():
    source = (FIXTURES_ROOT / "yalex/yalex_media.yal").read_text(encoding="utf-8")
    source = source.replace('| "if" { return IF }', '| "for" { return FOR }\n| "if" { return IF }')
    compiled = compile_yalex(parse_yalex(source))
    with pytest.raises(YalexLexError):
        scan(compiled, "for ?")


def test_alta_identifica_tokens_en_entrada_plana():
    compiled = _compile_from_file("yalex/yalex_alta.yal")
    text = (FIXTURES_ROOT / "inputs/yalex_alta_input.txt").read_text(encoding="utf-8")
    tokens = scan(compiled, text)
    assert [token.type for token in tokens] == [
        "KW_INT",
        "ID",
        "ASSIGN",
        "NUMBER",
        "SEMI",
        "KW_FLOAT",
        "ID",
        "ASSIGN",
        "NUMBER",
        "SEMI",
        "IF",
        "LPAREN",
        "ID",
        "RELOP",
        "ID",
        "LOGICOP",
        "ID",
        "RELOP",
        "NUMBER",
        "RPAREN",
        "LBRACE",
        "RETURN",
        "ID",
        "SEMI",
        "RBRACE",
    ]


def test_alta_detecta_error_lexico_en_entrada_invalida():
    compiled = _compile_from_file("yalex/yalex_alta.yal")
    with pytest.raises(YalexLexError):
        scan(compiled, "int x = 1 @")


def test_alta_modificada_identifica_tokens_nuevos():
    source = (FIXTURES_ROOT / "yalex/yalex_alta.yal").read_text(encoding="utf-8")
    source += "\n| '!' { return BANG }\n"
    compiled = compile_yalex(parse_yalex(source))
    tokens = scan(compiled, "! x")
    assert [token.type for token in tokens] == ["BANG", "ID"]


def test_alta_modificada_detecta_error_lexico():
    source = (FIXTURES_ROOT / "yalex/yalex_alta.yal").read_text(encoding="utf-8")
    source += "\n| '!' { return BANG }\n"
    compiled = compile_yalex(parse_yalex(source))
    with pytest.raises(YalexLexError):
        scan(compiled, "int x = 1 @")
