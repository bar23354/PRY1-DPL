from __future__ import annotations

from pydantic import BaseModel, ConfigDict


class AnalysisRunRequest(BaseModel):
    fixtureId: str | None = None
    inputText: str | None = None


class GeneratorCompileRequest(BaseModel):
    yalexSource: str


class TestsRunRequest(BaseModel):
    caseId: str | None = None
    caseIds: list[str] | None = None
    runAll: bool = False


class ApiErrorDetail(BaseModel):
    code: str
    message: str


class ApiErrorResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    error: ApiErrorDetail
