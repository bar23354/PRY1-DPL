from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path


DEFAULT_CATALOG_PATH = Path(__file__).resolve().parents[4] / "fixtures" / "catalog.json"


class FixtureCatalogError(ValueError):
    """Raised when the declarative fixture catalog is invalid."""


@dataclass(frozen=True)
class FixtureItem:
    id: str
    module: str
    complexity: str
    label: str
    spec_path: Path
    input_path: Path | None
    kind: str
    listed: bool


@dataclass(frozen=True)
class TestCaseItem:
    id: str
    complexity: str
    label: str
    fixture_id: str
    spec_path: Path
    input_path: Path
    expectation: str
    expected_tokens: list[str] | None
    expected_error: str | None

    @property
    def input_text(self) -> str:
        return self.input_path.read_text(encoding="utf-8")


@dataclass(frozen=True)
class FixtureCatalog:
    fixture_items: dict[str, FixtureItem]
    test_cases: dict[str, TestCaseItem]


def _require_keys(payload: dict, keys: set[str]) -> None:
    missing = sorted(keys - payload.keys())
    if missing:
        joined = ", ".join(missing)
        raise FixtureCatalogError(f"Missing required top-level keys: {joined}")


def _resolve_path(base_dir: Path, relative_path: str) -> Path:
    resolved = (base_dir / relative_path).resolve()
    if not resolved.exists():
        raise FixtureCatalogError(f"Referenced path does not exist: {relative_path}")
    return resolved


def _load_fixture_item(base_dir: Path, raw_item: dict) -> FixtureItem:
    required_keys = {"id", "module", "complexity", "label", "specPath", "kind"}
    missing = sorted(required_keys - raw_item.keys())
    if missing:
        joined = ", ".join(missing)
        raise FixtureCatalogError(f"Fixture item is missing required keys: {joined}")

    input_path = None
    if raw_item.get("inputPath"):
        input_path = _resolve_path(base_dir, raw_item["inputPath"])

    return FixtureItem(
        id=raw_item["id"],
        module=raw_item["module"],
        complexity=raw_item["complexity"],
        label=raw_item["label"],
        spec_path=_resolve_path(base_dir, raw_item["specPath"]),
        input_path=input_path,
        kind=raw_item["kind"],
        listed=raw_item.get("listed", True),
    )


def _load_test_case(base_dir: Path, raw_item: dict, fixtures: dict[str, FixtureItem]) -> TestCaseItem:
    required_keys = {"id", "complexity", "label", "fixtureId", "inputPath", "expectation"}
    missing = sorted(required_keys - raw_item.keys())
    if missing:
        joined = ", ".join(missing)
        raise FixtureCatalogError(f"Test case is missing required keys: {joined}")

    fixture_id = raw_item["fixtureId"]
    if fixture_id not in fixtures:
        raise FixtureCatalogError(f"Unknown fixtureId referenced by test case: {fixture_id}")

    fixture = fixtures[fixture_id]
    return TestCaseItem(
        id=raw_item["id"],
        complexity=raw_item["complexity"],
        label=raw_item["label"],
        fixture_id=fixture_id,
        spec_path=fixture.spec_path,
        input_path=_resolve_path(base_dir, raw_item["inputPath"]),
        expectation=raw_item["expectation"],
        expected_tokens=raw_item.get("expectedTokens"),
        expected_error=raw_item.get("expectedError"),
    )


def load_fixture_catalog(catalog_path: Path) -> FixtureCatalog:
    raw_catalog = json.loads(catalog_path.read_text(encoding="utf-8"))
    _require_keys(raw_catalog, {"fixtures", "testCases"})

    base_dir = catalog_path.parent
    fixture_items: dict[str, FixtureItem] = {}
    for raw_item in raw_catalog["fixtures"]:
        item = _load_fixture_item(base_dir, raw_item)
        fixture_items[item.id] = item

    test_cases: dict[str, TestCaseItem] = {}
    for raw_item in raw_catalog["testCases"]:
        item = _load_test_case(base_dir, raw_item, fixture_items)
        test_cases[item.id] = item

    return FixtureCatalog(fixture_items=fixture_items, test_cases=test_cases)


def load_default_fixture_catalog() -> FixtureCatalog:
    return load_fixture_catalog(DEFAULT_CATALOG_PATH)


class FixtureCatalogService:
    def __init__(self, catalog: FixtureCatalog):
        self._catalog = catalog

    def list_fixtures(
        self,
        module: str | None = None,
        complexity: str | None = None,
        include_unlisted: bool = False,
    ) -> list[FixtureItem]:
        items = list(self._catalog.fixture_items.values())
        if not include_unlisted:
            items = [item for item in items if item.listed]
        if module is not None:
            items = [item for item in items if item.module == module]
        if complexity is not None:
            items = [item for item in items if item.complexity == complexity]
        return items

    def get_fixture(self, fixture_id: str) -> FixtureItem:
        return self._catalog.fixture_items[fixture_id]

    def list_test_cases(self, complexity: str | None = None) -> list[TestCaseItem]:
        items = list(self._catalog.test_cases.values())
        if complexity is not None:
            items = [item for item in items if item.complexity == complexity]
        return items

    def get_test_case(self, case_id: str) -> TestCaseItem:
        return self._catalog.test_cases[case_id]

    def build_dashboard_summary(self) -> dict[str, object]:
        complexities = {"low": 0, "medium": 0, "high": 0}
        for case in self._catalog.test_cases.values():
            complexities[case.complexity] = complexities.get(case.complexity, 0) + 1

        return {
            "totalFixtures": len(self.list_fixtures()),
            "totalTestCases": len(self._catalog.test_cases),
            "complexities": complexities,
        }
