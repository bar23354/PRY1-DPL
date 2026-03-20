import es from "./es.json";

import type { AnalysisComplexity, FixtureCatalogItem } from "../types/analysis";
import type { TestCaseItem } from "../types/test-manager";

export const messages = es;

type MessageShape = typeof es;

export function getComplexityLabel(complexity: AnalysisComplexity): string {
  return messages.shared.complexityLabels[complexity];
}

export function getAnalysisFixtureLabel(fixture: FixtureCatalogItem | null): string {
  if (!fixture) {
    return messages.analysis.cards.loadingFixture;
  }
  return messages.analysis.fixtures[fixture.id as keyof MessageShape["analysis"]["fixtures"]] ?? fixture.label;
}

export function getGeneratorFixtureLabel(fixture: FixtureCatalogItem): string {
  return messages.generator.fixtures[fixture.id as keyof MessageShape["generator"]["fixtures"]] ?? fixture.label;
}

export function getTestCaseLabel(testCase: TestCaseItem): string {
  return messages.testManager.cases[testCase.id as keyof MessageShape["testManager"]["cases"]] ?? testCase.label;
}

export function getExpectationLabel(expectation: TestCaseItem["expectation"]): string {
  return messages.testManager.expectation[expectation];
}

export function formatTestSummary(passed: number, failed: number): string {
  return messages.testManager.metrics.summary.replace("{{passed}}", String(passed)).replace("{{failed}}", String(failed));
}
