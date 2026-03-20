from pathlib import Path

from laboratorio.application.catalog import FixtureCatalogService, load_fixture_catalog
from laboratorio.yalex_compiler import compile_yalex
from laboratorio.yalex_parser import parse_yalex
from laboratorio.yalex_runtime import YalexLexError, scan


ROOT = Path(__file__).resolve().parents[3]


def _compile(case):
    return compile_yalex(parse_yalex(case.spec_path.read_text(encoding="utf-8")))


def test_catalog_contains_expected_canonical_rubric_cases():
    catalog = load_fixture_catalog(ROOT / "fixtures" / "catalog.json")
    service = FixtureCatalogService(catalog)

    case_ids = [case.id for case in service.list_test_cases()]

    assert case_ids == [
        "rubric-low-valid",
        "rubric-low-invalid",
        "rubric-low-modified-valid",
        "rubric-low-modified-invalid",
        "rubric-medium-valid",
        "rubric-medium-invalid",
        "rubric-medium-modified-valid",
        "rubric-medium-modified-invalid",
        "rubric-high-valid",
        "rubric-high-invalid",
        "rubric-high-modified-valid",
        "rubric-high-modified-invalid",
    ]


def test_modified_variant_cases_compile_and_scan_as_expected():
    catalog = load_fixture_catalog(ROOT / "fixtures" / "catalog.json")
    service = FixtureCatalogService(catalog)

    low_case = service.get_test_case("rubric-low-modified-valid")
    medium_case = service.get_test_case("rubric-medium-modified-valid")
    high_case = service.get_test_case("rubric-high-modified-valid")

    assert [token.type for token in scan(_compile(low_case), low_case.input_text)] == ["IDENT", "MINUS", "NUM"]
    assert [token.type for token in scan(_compile(medium_case), medium_case.input_text)] == ["FOR", "ID"]
    assert [token.type for token in scan(_compile(high_case), high_case.input_text)] == ["BANG", "ID"]


def test_modified_invalid_cases_raise_lexical_errors():
    catalog = load_fixture_catalog(ROOT / "fixtures" / "catalog.json")
    service = FixtureCatalogService(catalog)

    for case_id in [
        "rubric-low-modified-invalid",
        "rubric-medium-modified-invalid",
        "rubric-high-modified-invalid",
    ]:
        case = service.get_test_case(case_id)
        compiled = _compile(case)
        try:
            scan(compiled, case.input_text)
        except YalexLexError:
            continue
        raise AssertionError(f"Expected lexical error for {case_id}")
