from pathlib import Path

import pytest

from generador_lexico.application.catalog import FixtureCatalogService, load_default_fixture_catalog
from generador_lexico.yalex.compiler import compile_yalex
from generador_lexico.yalex.parser import parse_yalex
from generador_lexico.yalex.runtime import YalexLexError, scan


ROOT = Path(__file__).resolve().parents[3]
CATALOG = load_default_fixture_catalog()
CATALOG_SERVICE = FixtureCatalogService(CATALOG)


def _compile_spec(spec_path: Path):
    return compile_yalex(parse_yalex(spec_path.read_text(encoding="utf-8")))


def _compile_fixture(fixture_id: str):
    return _compile_spec(CATALOG_SERVICE.get_fixture(fixture_id).spec_path)


def _get_case(case_id: str):
    return CATALOG_SERVICE.get_test_case(case_id)


def test_diagrama_transicion_se_puede_generar_desde_reglas_compiladas():
    compiled = _compile_fixture("generator-high")
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
    case = _get_case("rubric-low-valid")
    tokens = scan(_compile_spec(case.spec_path), case.input_text)
    assert [token.type for token in tokens] == ["IDENT", "PLUS", "NUM", "TIMES", "NUM", "ASSIGN", "IDENT"]


def test_baja_detecta_error_lexico_en_entrada_invalida():
    case = _get_case("rubric-low-invalid")
    with pytest.raises(YalexLexError):
        scan(_compile_spec(case.spec_path), case.input_text)


def test_baja_modificada_identifica_tokens_nuevos():
    case = _get_case("rubric-low-modified-valid")
    tokens = scan(_compile_spec(case.spec_path), case.input_text)
    assert [token.type for token in tokens] == ["IDENT", "MINUS", "NUM"]


def test_baja_modificada_detecta_error_lexico():
    case = _get_case("rubric-low-modified-invalid")
    with pytest.raises(YalexLexError):
        scan(_compile_spec(case.spec_path), case.input_text)


def test_media_identifica_tokens_en_entrada_plana():
    case = _get_case("rubric-medium-valid")
    tokens = scan(_compile_spec(case.spec_path), case.input_text)
    assert [token.type for token in tokens] == ["IF", "ID", "RELOP", "INT", "ELSE", "WHILE", "ID", "RELOP", "STRING"]


def test_media_detecta_error_lexico_en_entrada_invalida():
    case = _get_case("rubric-medium-invalid")
    with pytest.raises(YalexLexError):
        scan(_compile_spec(case.spec_path), case.input_text)


def test_media_modificada_identifica_tokens_nuevos():
    case = _get_case("rubric-medium-modified-valid")
    tokens = scan(_compile_spec(case.spec_path), case.input_text)
    assert [token.type for token in tokens] == ["FOR", "ID"]


def test_media_modificada_detecta_error_lexico():
    case = _get_case("rubric-medium-modified-invalid")
    with pytest.raises(YalexLexError):
        scan(_compile_spec(case.spec_path), case.input_text)


def test_alta_identifica_tokens_en_entrada_plana():
    case = _get_case("rubric-high-valid")
    tokens = scan(_compile_spec(case.spec_path), case.input_text)
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
    case = _get_case("rubric-high-invalid")
    with pytest.raises(YalexLexError):
        scan(_compile_spec(case.spec_path), case.input_text)


def test_alta_modificada_identifica_tokens_nuevos():
    case = _get_case("rubric-high-modified-valid")
    tokens = scan(_compile_spec(case.spec_path), case.input_text)
    assert [token.type for token in tokens] == ["BANG", "ID"]


def test_alta_modificada_detecta_error_lexico():
    case = _get_case("rubric-high-modified-invalid")
    with pytest.raises(YalexLexError):
        scan(_compile_spec(case.spec_path), case.input_text)
