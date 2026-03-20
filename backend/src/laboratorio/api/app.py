from __future__ import annotations

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from laboratorio.api.schemas import AnalysisRunRequest, ApiErrorResponse, GeneratorCompileRequest, TestsRunRequest
from laboratorio.application.use_cases import (
    build_dashboard_summary,
    compile_generator_source,
    list_fixture_catalog,
    list_test_catalog,
    run_analysis,
    run_test_cases,
)


def _error_payload(code: str, message: str) -> dict:
    return {"error": {"code": code, "message": message}}


def create_app() -> FastAPI:
    app = FastAPI(title="laboratorio-api")

    @app.exception_handler(KeyError)
    async def handle_not_found(_: Request, error: KeyError):
        return JSONResponse(status_code=404, content=_error_payload("not_found", str(error)))

    @app.exception_handler(ValueError)
    async def handle_bad_request(_: Request, error: ValueError):
        return JSONResponse(status_code=400, content=_error_payload("bad_request", str(error)))

    @app.exception_handler(Exception)
    async def handle_internal_error(_: Request, error: Exception):  # pragma: no cover - defensive boundary
        return JSONResponse(status_code=500, content=_error_payload("internal_error", str(error)))

    @app.get("/api/health")
    async def health():
        return {"status": "ok", "service": "laboratorio-api"}

    @app.get("/api/fixtures/catalog")
    async def fixture_catalog():
        return list_fixture_catalog()

    @app.get("/api/tests/catalog")
    async def tests_catalog():
        return list_test_catalog()

    @app.get("/api/dashboard/summary")
    async def dashboard_summary():
        return build_dashboard_summary()

    @app.post("/api/analysis/run")
    async def analysis_run(payload: AnalysisRunRequest):
        return run_analysis(payload.fixtureId, payload.inputText)

    @app.post("/api/generator/compile")
    async def generator_compile(payload: GeneratorCompileRequest):
        return compile_generator_source(payload.yalexSource)

    @app.post("/api/tests/run")
    async def tests_run(payload: TestsRunRequest):
        return run_test_cases(case_id=payload.caseId, case_ids=payload.caseIds, run_all=payload.runAll)

    return app
