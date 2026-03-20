export type TestComplexity = "low" | "medium" | "high";

export interface TestCaseItem {
  id: string;
  complexity: TestComplexity;
  label: string;
  fixtureId: string;
  specPath: string;
  inputPath: string;
  expectation: "accept" | "lexical_error";
  expectedTokens: string[] | null;
  expectedError: string | null;
}

export interface TestCatalogResponse {
  testCases: TestCaseItem[];
}

export interface TestRunResultItem {
  caseId: string;
  passed: boolean;
  actualTokens: string[];
  expectedTokens: string[] | null;
  error: string | null;
  durationMs: number;
}

export interface TestRunSummary {
  requested: number;
  passed: number;
  failed: number;
}

export interface TestRunResponse {
  results: TestRunResultItem[];
  summary: TestRunSummary;
}

export interface TestManagerMetrics {
  successRate: string;
  totalExecutions: number;
  pendingValidation: number;
}
