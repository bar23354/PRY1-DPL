from __future__ import annotations

from io import StringIO

from laboratorio.application.catalog import FixtureCatalogService, load_default_fixture_catalog
from laboratorio.application.positions import offset_to_line_column
from laboratorio.application.serialization import serialize_afd
from laboratorio.yalex_codegen import generate_lexer_source
from laboratorio.yalex_compiler import CompiledLexer, compile_yalex
from laboratorio.yalex_parser import parse_yalex
from laboratorio.yalex_runtime import LexToken, YalexLexError, scan


def _build_catalog_service() -> FixtureCatalogService:
    return FixtureCatalogService(load_default_fixture_catalog())


def _relative_fixture_path(path) -> str:
    value = path.as_posix().replace("\\", "/")
    marker = "/fixtures/"
    if marker in value:
        return "fixtures/" + value.split(marker, 1)[1]
    if value.startswith("fixtures/"):
        return value
    return value


def serialize_fixture_item(item) -> dict:
    return {
        "id": item.id,
        "module": item.module,
        "complexity": item.complexity,
        "label": item.label,
        "kind": item.kind,
        "specPath": _relative_fixture_path(item.spec_path),
        "inputPath": _relative_fixture_path(item.input_path) if item.input_path is not None else None,
        "hasInput": item.input_path is not None,
    }


def serialize_test_case_item(item) -> dict:
    return {
        "id": item.id,
        "complexity": item.complexity,
        "label": item.label,
        "fixtureId": item.fixture_id,
        "specPath": _relative_fixture_path(item.spec_path),
        "inputPath": _relative_fixture_path(item.input_path),
        "expectation": item.expectation,
        "expectedTokens": item.expected_tokens,
        "expectedError": item.expected_error,
    }


def _extract_lex_error_details(message: str) -> tuple[int, str]:
    prefix = "No se pudo tokenizar desde la posicion "
    if not message.startswith(prefix):
        return 0, ""

    remainder = message[len(prefix) :]
    position_text, _, preview_text = remainder.partition(": ")
    try:
        start = int(position_text)
    except ValueError:
        return 0, ""
    preview = preview_text.strip()
    if preview.startswith("'") and preview.endswith("'") and len(preview) >= 2:
        preview = preview[1:-1]
    return start, preview


def serialize_lex_token(token: LexToken, text: str) -> dict:
    line, column = offset_to_line_column(text, token.start)
    return {
        "type": token.type,
        "lexeme": token.lexeme,
        "start": token.start,
        "end": token.end,
        "line": line,
        "column": column,
        "ruleIndex": token.rule_index,
    }


def serialize_lex_error(error: YalexLexError, text: str) -> dict:
    start, preview = _extract_lex_error_details(str(error))
    line, column = offset_to_line_column(text, start)
    return {
        "message": str(error),
        "start": start,
        "end": min(len(text), start + 1),
        "line": line,
        "column": column,
        "preview": preview,
    }


def _resolve_analysis_source(fixture_id: str | None, input_text: str | None) -> tuple[str | None, str, str]:
    service = _build_catalog_service()
    if fixture_id is None:
        if input_text is None:
            raise ValueError("inputText is required when fixtureId is not provided.")
        raise ValueError("fixtureId is required for analysis in this phase.")

    fixture = service.get_fixture(fixture_id)
    if fixture.input_path is not None and input_text is None:
        text = fixture.input_path.read_text(encoding="utf-8")
    else:
        text = input_text or ""
    source = fixture.spec_path.read_text(encoding="utf-8")
    return fixture.id, source, text


def run_analysis(fixture_id: str | None, input_text: str | None) -> dict:
    resolved_fixture_id, source, text = _resolve_analysis_source(fixture_id, input_text)
    compiled = compile_yalex(parse_yalex(source))
    try:
        tokens = scan(compiled, text)
    except YalexLexError as error:
        return {
            "fixtureId": resolved_fixture_id,
            "accepted": False,
            "tokens": [],
            "errors": [serialize_lex_error(error, text)],
            "stats": {
                "tokenCount": 0,
                "errorCount": 1,
                "inputLength": len(text),
            },
        }

    serialized_tokens = [serialize_lex_token(token, text) for token in tokens]
    return {
        "fixtureId": resolved_fixture_id,
        "accepted": True,
        "tokens": serialized_tokens,
        "errors": [],
        "stats": {
            "tokenCount": len(serialized_tokens),
            "errorCount": 0,
            "inputLength": len(text),
        },
    }


def _serialize_transition_matrix(afd: dict) -> list[dict]:
    graph = serialize_afd(afd)
    alphabet = graph["alphabet"]
    rows = []
    for state in graph["states"]:
        transitions = graph["transitions"].get(state, {})
        rows.append(
            {
                "state": state,
                "accepting": state in graph["acceptingStates"],
                "transitions": {symbol: transitions.get(symbol) for symbol in alphabet},
            }
        )
    return rows


def compile_generator_source(yalex_source: str) -> dict:
    compiled = compile_yalex(parse_yalex(yalex_source))
    visible_rules = []
    recognized_tokens: list[str] = []
    for rule in compiled.rules:
        if rule.token_name and rule.token_name not in {"SKIP"} and rule.token_name not in recognized_tokens:
            recognized_tokens.append(rule.token_name)
        graph = serialize_afd(rule.afd) if not rule.is_eof else {
            "states": [],
            "alphabet": [],
            "transitions": {},
            "initialState": None,
            "acceptingStates": [],
            "stateSets": {},
        }
        visible_rules.append(
            {
                "index": rule.index,
                "sourcePattern": rule.source_pattern,
                "normalizedPattern": rule.normalized_pattern,
                "tokenName": rule.token_name,
                "skip": rule.skip,
                "isEof": rule.is_eof,
                "graph": graph,
                "transitionMatrix": _serialize_transition_matrix(rule.afd) if not rule.is_eof else [],
            }
        )
    return {
        "entrypoint": compiled.entrypoint,
        "rules": visible_rules,
        "lexerSource": generate_lexer_source(compiled),
        "recognizedTokens": [token for token in recognized_tokens if token and token != "SKIP"],
        "stats": {
            "ruleCount": len(compiled.rules),
            "entryArgsCount": len(compiled.args),
        },
        "errors": [],
    }


def run_test_cases(case_id: str | None = None, case_ids: list[str] | None = None, run_all: bool = False) -> dict:
    service = _build_catalog_service()
    requested_ids: list[str]
    if run_all:
        requested_ids = [case.id for case in service.list_test_cases()]
    elif case_ids:
        requested_ids = case_ids
    elif case_id:
        requested_ids = [case_id]
    else:
        raise ValueError("At least one test case selection is required.")

    results = []
    passed = 0
    for requested_id in requested_ids:
        case = service.get_test_case(requested_id)
        compiled = compile_yalex(parse_yalex(case.spec_path.read_text(encoding="utf-8")))
        error_message = None
        actual_tokens: list[str] = []
        try:
            scanned = scan(compiled, case.input_text)
            actual_tokens = [token.type for token in scanned]
            if case.expectation == "accept":
                case_passed = actual_tokens == (case.expected_tokens or [])
            else:
                case_passed = False
                error_message = "Expected lexical error but scan succeeded."
        except YalexLexError as error:
            error_message = str(error)
            case_passed = case.expectation == "lexical_error"

        if case_passed:
            passed += 1

        results.append(
            {
                "caseId": case.id,
                "passed": case_passed,
                "actualTokens": actual_tokens,
                "expectedTokens": case.expected_tokens,
                "error": error_message,
                "durationMs": 0,
            }
        )

    return {
        "results": results,
        "summary": {
            "requested": len(requested_ids),
            "passed": passed,
            "failed": len(requested_ids) - passed,
        },
    }


def build_dashboard_summary() -> dict:
    service = _build_catalog_service()
    base = service.build_dashboard_summary()
    base["modules"] = {
        "analysis": len(service.list_fixtures(module="analysis")),
        "generator": len(service.list_fixtures(module="generator")),
        "test-manager": len(service.list_test_cases()),
    }
    return base


def list_fixture_catalog() -> dict:
    service = _build_catalog_service()
    return {"fixtures": [serialize_fixture_item(item) for item in service.list_fixtures()]}


def list_test_catalog() -> dict:
    service = _build_catalog_service()
    return {"testCases": [serialize_test_case_item(item) for item in service.list_test_cases()]}
