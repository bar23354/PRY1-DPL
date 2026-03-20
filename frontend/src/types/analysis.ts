export type AnalysisComplexity = "low" | "medium" | "high";

export interface FixtureCatalogItem {
  id: string;
  module: string;
  complexity: string;
  label: string;
  kind: string;
  specPath: string;
  inputPath: string | null;
  hasInput: boolean;
}

export interface AnalysisToken {
  type: string;
  lexeme: string;
  start: number;
  end: number;
  line: number;
  column: number;
  ruleIndex: number;
}

export interface AnalysisError {
  message: string;
  start: number;
  end: number;
  line: number;
  column: number;
  preview: string;
}

export interface AnalysisStats {
  tokenCount: number;
  errorCount: number;
  inputLength: number;
}

export interface AnalysisResult {
  fixtureId: string | null;
  accepted: boolean;
  tokens: AnalysisToken[];
  errors: AnalysisError[];
  stats: AnalysisStats;
}
