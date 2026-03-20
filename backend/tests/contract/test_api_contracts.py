from pathlib import Path

from fastapi.testclient import TestClient
from laboratorio.api.app import create_app


ROOT = Path(__file__).resolve().parents[3]


def test_health_contract():
    client = TestClient(create_app())

    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.headers["content-type"].startswith("application/json")
    assert response.json() == {"status": "ok", "service": "laboratorio-api"}


def test_fixture_catalog_contract():
    client = TestClient(create_app())

    response = client.get("/api/fixtures/catalog")
    body = response.json()

    assert response.status_code == 200
    assert list(body.keys()) == ["fixtures"]
    assert [item["id"] for item in body["fixtures"]] == [
        "analysis-low",
        "analysis-medium",
        "analysis-high",
        "generator-low",
        "generator-medium",
        "generator-high",
        "generator-full-features",
    ]
    assert body["fixtures"][0] == {
        "id": "analysis-low",
        "module": "analysis",
        "complexity": "low",
        "label": "Lexical Analysis Low",
        "kind": "yalex",
        "specPath": "fixtures/legacy/yalex/yalex_baja.yal",
        "inputPath": "fixtures/legacy/inputs/yalex_baja_input.txt",
        "hasInput": True,
    }


def test_tests_catalog_contract():
    client = TestClient(create_app())

    response = client.get("/api/tests/catalog")
    body = response.json()

    assert response.status_code == 200
    assert list(body.keys()) == ["testCases"]
    assert len(body["testCases"]) == 12
    assert body["testCases"][0]["id"] == "rubric-low-valid"
    assert body["testCases"][-1]["id"] == "rubric-high-modified-invalid"


def test_analysis_run_contract_for_valid_case():
    client = TestClient(create_app())

    response = client.post("/api/analysis/run", json={"fixtureId": "analysis-low"})
    body = response.json()

    assert response.status_code == 200
    assert body["fixtureId"] == "analysis-low"
    assert body["accepted"] is True
    assert body["errors"] == []
    assert body["stats"] == {"tokenCount": 7, "errorCount": 0, "inputLength": 34}
    assert body["tokens"][0] == {
        "type": "IDENT",
        "lexeme": "variable",
        "start": 0,
        "end": 8,
        "line": 1,
        "column": 1,
        "ruleIndex": 1,
    }


def test_analysis_run_contract_for_lexical_error():
    client = TestClient(create_app())

    response = client.post("/api/analysis/run", json={"fixtureId": "analysis-low", "inputText": "var @ -4"})
    body = response.json()

    assert response.status_code == 200
    assert body["accepted"] is False
    assert body["tokens"] == []
    assert body["stats"]["errorCount"] == 1
    assert body["errors"][0] == {
        "message": "No se pudo tokenizar desde la posicion 4: '@ -4'",
        "start": 4,
        "end": 5,
        "line": 1,
        "column": 5,
        "preview": "@ -4",
    }


def test_generator_compile_contract():
    client = TestClient(create_app())
    source = (ROOT / "fixtures" / "legacy" / "yalex" / "yalex_baja.yal").read_text(encoding="utf-8")

    response = client.post("/api/generator/compile", json={"yalexSource": source})
    body = response.json()

    assert response.status_code == 200
    assert body["entrypoint"] == "tokens"
    assert body["errors"] == []
    assert body["stats"]["ruleCount"] == 6
    assert body["recognizedTokens"] == ["IDENT", "NUM", "PLUS", "TIMES", "ASSIGN"]
    assert "def tokens(text, *args, **kwargs):" in body["lexerSource"]
    assert "laboratorio.yalex_runtime" not in body["lexerSource"]
    first_rule = body["rules"][0]
    assert list(first_rule.keys()) == [
        "index",
        "sourcePattern",
        "normalizedPattern",
        "tokenName",
        "skip",
        "isEof",
        "graph",
        "transitionMatrix",
    ]
    assert list(first_rule["graph"].keys()) == [
        "states",
        "alphabet",
        "transitions",
        "initialState",
        "acceptingStates",
        "stateSets",
    ]


def test_tests_run_contract_for_single_case_and_run_all():
    client = TestClient(create_app())

    single_response = client.post("/api/tests/run", json={"caseId": "rubric-medium-valid"})
    all_response = client.post("/api/tests/run", json={"runAll": True})
    single_body = single_response.json()
    all_body = all_response.json()

    assert single_response.status_code == 200
    assert single_body["summary"]["requested"] == 1
    assert single_body["summary"]["passed"] == 1
    assert single_body["results"][0]["caseId"] == "rubric-medium-valid"
    assert single_body["results"][0]["passed"] is True

    assert all_response.status_code == 200
    assert all_body["summary"]["requested"] == 12
    assert all_body["summary"]["passed"] == 12
    assert len(all_body["results"]) == 12


def test_dashboard_summary_contract():
    client = TestClient(create_app())

    response = client.get("/api/dashboard/summary")
    body = response.json()

    assert response.status_code == 200
    assert body == {
        "totalFixtures": 7,
        "totalTestCases": 12,
        "complexities": {"low": 4, "medium": 4, "high": 4},
        "modules": {
            "analysis": 3,
            "generator": 4,
            "test-manager": 12,
        },
    }
