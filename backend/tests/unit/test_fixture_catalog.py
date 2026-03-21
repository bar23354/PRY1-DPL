from pathlib import Path

import pytest

from laboratorio.application.catalog import (
    FixtureCatalogError,
    FixtureCatalogService,
    load_fixture_catalog,
)


ROOT = Path(__file__).resolve().parents[3]


def test_load_fixture_catalog_returns_expected_cases():
    catalog = load_fixture_catalog(ROOT / "fixtures" / "catalog.json")

    assert "analysis-low" in catalog.fixture_items
    assert "generator-full-features" in catalog.fixture_items
    assert "rubric-low-valid" in catalog.test_cases
    assert "rubric-high-modified-invalid" in catalog.test_cases


def test_load_fixture_catalog_rejects_missing_required_keys(tmp_path: Path):
    catalog_path = tmp_path / "catalog.json"
    catalog_path.write_text('{"fixtures": []}', encoding="utf-8")

    with pytest.raises(FixtureCatalogError, match="Missing required top-level keys"):
        load_fixture_catalog(catalog_path)


def test_load_fixture_catalog_rejects_missing_referenced_files(tmp_path: Path):
    catalog_path = tmp_path / "catalog.json"
    catalog_path.write_text(
        """
{
  "fixtures": [
    {
      "id": "analysis-low",
      "module": "analysis",
      "complexity": "low",
      "label": "Low",
      "specPath": "cases/yalex/missing.yal",
      "inputPath": "cases/inputs/missing.txt",
      "kind": "yalex"
    }
  ],
  "testCases": []
}
""".strip(),
        encoding="utf-8",
    )

    with pytest.raises(FixtureCatalogError, match="does not exist"):
        load_fixture_catalog(catalog_path)


def test_fixture_catalog_service_filters_module_and_complexity():
    catalog = load_fixture_catalog(ROOT / "fixtures" / "catalog.json")
    service = FixtureCatalogService(catalog)

    analysis_items = service.list_fixtures(module="analysis")
    medium_cases = service.list_test_cases(complexity="medium")

    assert [item.id for item in analysis_items] == [
        "analysis-low",
        "analysis-medium",
        "analysis-high",
    ]
    assert all(item.module == "analysis" for item in analysis_items)
    assert {item.id for item in medium_cases} == {
        "rubric-medium-valid",
        "rubric-medium-invalid",
        "rubric-medium-modified-valid",
        "rubric-medium-modified-invalid",
    }


def test_fixture_catalog_service_builds_dashboard_summary():
    catalog = load_fixture_catalog(ROOT / "fixtures" / "catalog.json")
    service = FixtureCatalogService(catalog)

    summary = service.build_dashboard_summary()

    assert summary["totalFixtures"] == 7
    assert summary["totalTestCases"] == 12
    assert summary["complexities"] == {"low": 4, "medium": 4, "high": 4}
