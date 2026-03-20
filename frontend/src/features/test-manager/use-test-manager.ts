"use client";

import { useEffect, useMemo, useState } from "react";

import { messages } from "../../i18n/messages";
import { fetchJson } from "../../lib/api";
import type {
  TestCaseItem,
  TestCatalogResponse,
  TestManagerMetrics,
  TestRunResponse,
  TestRunResultItem,
  TestRunSummary,
} from "../../types/test-manager";

function buildMetrics(
  testCases: TestCaseItem[],
  resultsByCaseId: Record<string, TestRunResultItem>,
  totalRequested: number,
  totalPassed: number,
): TestManagerMetrics {
  const pendingValidation = testCases.filter((testCase) => !resultsByCaseId[testCase.id]).length;
  const successRate = totalRequested === 0 ? "0.0%" : `${((totalPassed / totalRequested) * 100).toFixed(1)}%`;

  return {
    successRate,
    totalExecutions: totalRequested,
    pendingValidation,
  };
}

function sortTestCases(testCases: TestCaseItem[]): TestCaseItem[] {
  const complexityRank: Record<TestCaseItem["complexity"], number> = {
    low: 0,
    medium: 1,
    high: 2,
  };

  return [...testCases].sort((left, right) => {
    const complexityDifference = complexityRank[left.complexity] - complexityRank[right.complexity];
    if (complexityDifference !== 0) {
      return complexityDifference;
    }
    return left.label.localeCompare(right.label);
  });
}

export function useTestManager() {
  const [testCases, setTestCases] = useState<TestCaseItem[]>([]);
  const [resultsByCaseId, setResultsByCaseId] = useState<Record<string, TestRunResultItem>>({});
  const [lastSummary, setLastSummary] = useState<TestRunSummary | null>(null);
  const [isCatalogLoading, setIsCatalogLoading] = useState(true);
  const [isRunningAll, setIsRunningAll] = useState(false);
  const [runningCaseId, setRunningCaseId] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [totalRequested, setTotalRequested] = useState(0);
  const [totalPassed, setTotalPassed] = useState(0);

  useEffect(() => {
    let mounted = true;

    async function loadCatalog() {
      try {
        const response = await fetchJson<TestCatalogResponse>("/api/tests/catalog");
        if (!mounted) {
          return;
        }

        setTestCases(sortTestCases(response.testCases));
        setRequestError(null);
      } catch (error) {
        if (!mounted) {
          return;
        }
        setRequestError(error instanceof Error ? error.message : messages.errors.testManager.loadCatalog);
      } finally {
        if (mounted) {
          setIsCatalogLoading(false);
        }
      }
    }

    void loadCatalog();
    return () => {
      mounted = false;
    };
  }, []);

  const metrics = useMemo(
    () => buildMetrics(testCases, resultsByCaseId, totalRequested, totalPassed),
    [resultsByCaseId, testCases, totalPassed, totalRequested],
  );

  function applyRunResponse(response: TestRunResponse) {
    setResultsByCaseId((current) => {
      const next = { ...current };
      for (const item of response.results) {
        next[item.caseId] = item;
      }
      return next;
    });
    setLastSummary(response.summary);
    setTotalRequested((current) => current + response.summary.requested);
    setTotalPassed((current) => current + response.summary.passed);
  }

  async function runCase(caseId: string) {
    setRunningCaseId(caseId);
    setRequestError(null);
    try {
      const response = await fetchJson<TestRunResponse>("/api/tests/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ caseId }),
      });
      applyRunResponse(response);
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : messages.errors.testManager.runCase);
    } finally {
      setRunningCaseId(null);
    }
  }

  async function runAll() {
    setIsRunningAll(true);
    setRequestError(null);
    try {
      const response = await fetchJson<TestRunResponse>("/api/tests/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ runAll: true }),
      });
      applyRunResponse(response);
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : messages.errors.testManager.runAll);
    } finally {
      setIsRunningAll(false);
    }
  }

  return {
    testCases,
    resultsByCaseId,
    lastSummary,
    metrics,
    isCatalogLoading,
    isRunningAll,
    runningCaseId,
    requestError,
    runCase,
    runAll,
  };
}
