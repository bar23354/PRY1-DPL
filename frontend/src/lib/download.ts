import type { AnalysisToken } from "../types/analysis";
import { messages } from "../i18n/messages";

export function buildTokensExportContent(tokens: AnalysisToken[]): string {
  const header = messages.downloads.analysisTokensHeader;
  const rows = tokens.map((token) =>
    [token.type, token.lexeme, token.line, token.column, token.start, token.end, token.ruleIndex].join("\t"),
  );
  return [header, ...rows].join("\n");
}

export function downloadTextFile(filename: string, content: string, mimeType = "text/plain;charset=utf-8"): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
