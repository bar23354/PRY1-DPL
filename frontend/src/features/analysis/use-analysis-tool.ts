"use client";

import { useEffect, useMemo, useState } from "react";

import { messages } from "../../i18n/messages";
import { fetchJson } from "../../lib/api";
import type { AnalysisComplexity, AnalysisResult, FixtureCatalogItem } from "../../types/analysis";

interface FixturesResponse {
  fixtures: FixtureCatalogItem[];
}

const COMPLEXITY_ORDER: AnalysisComplexity[] = ["low", "medium", "high"];

async function readFileAsText(file: File): Promise<string> {
  const textMethod = file.text;
  if (typeof textMethod === "function") {
    return textMethod.call(file);
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error(messages.errors.analysis.readFile));
    reader.readAsText(file);
  });
}

export function useAnalysisTool() {
  const [fixtures, setFixtures] = useState<FixtureCatalogItem[]>([]);
  const [activeComplexity, setActiveComplexity] = useState<AnalysisComplexity>("medium");
  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isCatalogLoading, setIsCatalogLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadCatalog() {
      try {
        const response = await fetchJson<FixturesResponse>("/api/fixtures/catalog");
        if (!isMounted) {
          return;
        }

        const analysisFixtures = response.fixtures
          .filter((fixture) => fixture.module === "analysis")
          .sort(
            (left, right) =>
              COMPLEXITY_ORDER.indexOf(left.complexity as AnalysisComplexity) -
              COMPLEXITY_ORDER.indexOf(right.complexity as AnalysisComplexity),
          );

        setFixtures(analysisFixtures);
        setRequestError(null);
      } catch (error) {
        if (!isMounted) {
          return;
        }
        setRequestError(error instanceof Error ? error.message : messages.errors.analysis.loadCatalog);
      } finally {
        if (isMounted) {
          setIsCatalogLoading(false);
        }
      }
    }

    void loadCatalog();

    return () => {
      isMounted = false;
    };
  }, []);

  const activeFixture = useMemo(
    () => fixtures.find((fixture) => fixture.complexity === activeComplexity) ?? null,
    [activeComplexity, fixtures],
  );

  async function runAnalysis() {
    if (!activeFixture) {
      return;
    }

    setIsRunning(true);
    setRequestError(null);

    try {
      const payload =
        inputText.trim() === ""
          ? { fixtureId: activeFixture.id }
          : { fixtureId: activeFixture.id, inputText };

      const response = await fetchJson<AnalysisResult>("/api/analysis/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      setResult(response);
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : messages.errors.analysis.run);
      setResult(null);
    } finally {
      setIsRunning(false);
    }
  }

  async function loadFile(file: File) {
    setInputText(await readFileAsText(file));
  }

  return {
    fixtures,
    activeFixture,
    activeComplexity,
    setActiveComplexity,
    inputText,
    setInputText,
    result,
    isCatalogLoading,
    isRunning,
    requestError,
    runAnalysis,
    loadFile,
  };
}
