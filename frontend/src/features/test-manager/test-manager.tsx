"use client";

import { useMemo } from "react";

import { formatTestSummary, getComplexityLabel, getExpectationLabel, getTestCaseLabel, messages } from "../../i18n/messages";
import type { TestCaseItem } from "../../types/test-manager";
import { useTestManager } from "./use-test-manager";

const COMPLEXITY_STYLES: Record<TestCaseItem["complexity"], string> = {
  low: "bg-[rgba(51,77,88,0.9)] text-[color:var(--color-secondary)]",
  medium: "bg-[rgba(20,34,131,0.85)] text-[color:var(--color-primary)]",
  high: "bg-[rgba(92,24,0,0.85)] text-[color:var(--color-tertiary)]",
};

function statusView(result?: { passed: boolean; error: string | null }) {
  if (!result) {
    return {
      label: messages.shared.states.pending,
      tone: "text-slate-300",
      dot: "bg-slate-500 animate-pulse",
    };
  }

  if (result.passed) {
    return {
      label: messages.shared.states.passed,
      tone: "text-emerald-300",
      dot: "bg-emerald-400",
    };
  }

  return {
    label: messages.shared.states.failed,
    tone: "text-red-300",
    dot: "bg-red-400",
  };
}

export function TestManager() {
  const { testCases, resultsByCaseId, metrics, lastSummary, isCatalogLoading, isRunningAll, runningCaseId, requestError, runCase, runAll } =
    useTestManager();

  const summaryText = useMemo(() => {
    if (!lastSummary) {
      return messages.testManager.metrics.noExecutions;
    }
    return formatTestSummary(lastSummary.passed, lastSummary.failed);
  }, [lastSummary]);

  return (
    <div className="min-h-[78vh] bg-[linear-gradient(180deg,#121416_0%,#17191c_100%)] p-6 md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-headline text-3xl font-bold tracking-tight text-white">{messages.testManager.title}</h2>
            <p className="mt-2 max-w-xl text-sm text-slate-300">{messages.testManager.description}</p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              disabled
              aria-label={messages.testManager.controls.addUnavailableAria}
              className="rounded-lg bg-[rgba(40,42,44,0.9)] px-5 py-2.5 text-sm font-medium text-slate-400"
            >
              {messages.testManager.controls.addUnavailable}
            </button>
            <button
              type="button"
              className="rounded-lg bg-[linear-gradient(135deg,var(--color-primary),#8390f2)] px-5 py-2.5 text-sm font-bold text-[#152383] shadow-xl shadow-[color:var(--color-primary)]/10 transition hover:brightness-110 disabled:opacity-60"
              disabled={isCatalogLoading || isRunningAll}
              onClick={() => {
                void runAll();
              }}
            >
              {isRunningAll ? messages.testManager.controls.runningAll : messages.testManager.controls.runAll}
            </button>
          </div>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border-l-4 border-indigo-400 bg-[rgba(30,32,34,0.9)] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{messages.testManager.metrics.successRate}</p>
            <div className="mt-2 flex items-end gap-2">
              <span className="font-headline text-2xl font-bold text-white">{metrics.successRate}</span>
              <span className="mb-1 text-xs font-mono text-indigo-300">{summaryText}</span>
            </div>
          </div>
          <div className="rounded-xl border-l-4 border-[color:var(--color-primary)] bg-[rgba(30,32,34,0.9)] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{messages.testManager.metrics.totalExecutions}</p>
            <div className="mt-2 flex items-end gap-2">
              <span className="font-headline text-2xl font-bold text-white">{metrics.totalExecutions}</span>
              <span className="mb-1 text-xs font-mono text-[color:var(--color-primary)]">{messages.testManager.metrics.session}</span>
            </div>
          </div>
          <div className="rounded-xl border-l-4 border-[color:var(--color-tertiary)] bg-[rgba(30,32,34,0.9)] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{messages.testManager.metrics.pendingValidation}</p>
            <div className="mt-2 flex items-end gap-2">
              <span className="font-headline text-2xl font-bold text-white">{metrics.pendingValidation}</span>
              <span className="mb-1 text-xs font-mono text-[color:var(--color-tertiary)]">{messages.testManager.metrics.notRunYet}</span>
            </div>
          </div>
        </div>

        {requestError ? (
          <div className="mb-6 rounded-xl border border-red-400/20 bg-[rgba(147,0,10,0.18)] px-4 py-3 text-sm text-red-200">{requestError}</div>
        ) : null}

        <div className="overflow-hidden rounded-2xl bg-[rgba(30,32,34,0.92)] shadow-2xl shadow-black/40">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-white/5 bg-[rgba(40,42,44,0.75)]">
                  <th className="px-6 py-4 text-xs uppercase tracking-[0.18em] text-slate-400">{messages.testManager.table.complexity}</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-[0.18em] text-slate-400">{messages.testManager.table.specSource}</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-[0.18em] text-slate-400">{messages.testManager.table.inputStream}</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-[0.18em] text-slate-400">{messages.testManager.table.status}</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-[0.18em] text-slate-400 text-right">{messages.testManager.table.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {testCases.map((testCase) => {
                  const result = resultsByCaseId[testCase.id];
                  const status = statusView(result);

                  return (
                    <tr key={testCase.id} className="group hover:bg-[rgba(40,42,44,0.72)]">
                      <td className="px-6 py-5">
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${COMPLEXITY_STYLES[testCase.complexity]}`}>
                          {getComplexityLabel(testCase.complexity)}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-white">{getTestCaseLabel(testCase)}</p>
                          <p className="font-mono text-xs text-indigo-200">{testCase.specPath}</p>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="space-y-1">
                          <p className="font-mono text-xs text-slate-300">{testCase.inputPath}</p>
                          <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">{getExpectationLabel(testCase.expectation)}</p>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full ${status.dot}`}></span>
                          <span className={`text-sm font-medium ${status.tone}`}>{status.label}</span>
                        </div>
                        {result?.error ? <p className="mt-2 max-w-sm text-xs text-red-200">{result.error}</p> : null}
                        {result?.actualTokens.length ? <p className="mt-2 text-xs text-slate-300">{result.actualTokens.join(", ")}</p> : null}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            aria-label={`${messages.testManager.controls.runCasePrefix} ${getTestCaseLabel(testCase)}`}
                            className="rounded-md bg-[rgba(51,53,55,0.85)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-100 transition hover:bg-[rgba(56,57,60,0.95)] disabled:opacity-50"
                            disabled={isCatalogLoading || isRunningAll || runningCaseId === testCase.id}
                            onClick={() => {
                              void runCase(testCase.id);
                            }}
                          >
                            {runningCaseId === testCase.id ? messages.testManager.controls.runningCase : messages.testManager.controls.runCase}
                          </button>
                          <button
                            type="button"
                            aria-label={messages.testManager.controls.editUnavailableAria}
                            disabled
                            className="rounded-md p-2 text-slate-500 opacity-60"
                          >
                            {messages.testManager.controls.editUnavailable}
                          </button>
                          <button
                            type="button"
                            aria-label={messages.testManager.controls.deleteUnavailableAria}
                            disabled
                            className="rounded-md p-2 text-slate-500 opacity-60"
                          >
                            {messages.testManager.controls.deleteUnavailable}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
