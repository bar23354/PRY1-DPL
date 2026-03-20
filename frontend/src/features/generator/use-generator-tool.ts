"use client";

import { useEffect, useMemo, useState } from "react";

import { messages } from "../../i18n/messages";
import { fetchJson } from "../../lib/api";
import type { FixtureCatalogItem } from "../../types/analysis";
import type { GeneratorResult, GeneratorRule } from "../../types/generator";
import { GENERATOR_TEMPLATES } from "./generator-templates";

interface FixturesResponse {
  fixtures: FixtureCatalogItem[];
}

function firstVisibleRule(rules: GeneratorRule[]): GeneratorRule | null {
  return rules.find((rule) => !rule.isEof && !rule.skip) ?? rules.find((rule) => !rule.isEof) ?? rules[0] ?? null;
}

export function useGeneratorTool() {
  const [fixtures, setFixtures] = useState<FixtureCatalogItem[]>([]);
  const [activeFixtureId, setActiveFixtureId] = useState<string>("generator-low");
  const [sourceText, setSourceText] = useState<string>(GENERATOR_TEMPLATES["generator-low"]);
  const [result, setResult] = useState<GeneratorResult | null>(null);
  const [activeRuleIndex, setActiveRuleIndex] = useState<number | null>(null);
  const [isCatalogLoading, setIsCatalogLoading] = useState(true);
  const [isCompiling, setIsCompiling] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadCatalog() {
      try {
        const response = await fetchJson<FixturesResponse>("/api/fixtures/catalog");
        if (!mounted) {
          return;
        }

        const generatorFixtures = response.fixtures.filter((fixture) => fixture.module === "generator");
        setFixtures(generatorFixtures);
      } catch (error) {
        if (!mounted) {
          return;
        }
        setRequestError(error instanceof Error ? error.message : messages.errors.generator.loadCatalog);
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

  const activeFixture = useMemo(
    () => fixtures.find((fixture) => fixture.id === activeFixtureId) ?? null,
    [activeFixtureId, fixtures],
  );

  const activeRule = useMemo(
    () => result?.rules.find((rule) => rule.index === activeRuleIndex) ?? firstVisibleRule(result?.rules ?? []),
    [activeRuleIndex, result],
  );

  function applyTemplate(templateId: string) {
    const template = GENERATOR_TEMPLATES[templateId as keyof typeof GENERATOR_TEMPLATES];
    if (!template) {
      return;
    }
    setActiveFixtureId(templateId);
    setSourceText(template);
    setResult(null);
    setActiveRuleIndex(null);
    setRequestError(null);
  }

  async function compileSource() {
    setIsCompiling(true);
    setRequestError(null);
    try {
      const response = await fetchJson<GeneratorResult>("/api/generator/compile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ yalexSource: sourceText }),
      });
      setResult(response);
      setActiveRuleIndex(firstVisibleRule(response.rules)?.index ?? null);
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : messages.errors.generator.compile);
      setResult(null);
      setActiveRuleIndex(null);
    } finally {
      setIsCompiling(false);
    }
  }

  async function loadFile(file: File) {
    const textMethod = file.text;
    if (typeof textMethod === "function") {
      setSourceText(await textMethod.call(file));
      return;
    }

    const text = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
      reader.onerror = () => reject(new Error(messages.errors.generator.readFile));
      reader.readAsText(file);
    });
    setSourceText(text);
  }

  return {
    fixtures,
    activeFixture,
    activeFixtureId,
    setActiveFixtureId: applyTemplate,
    sourceText,
    setSourceText,
    result,
    activeRule,
    activeRuleIndex,
    setActiveRuleIndex,
    isCatalogLoading,
    isCompiling,
    requestError,
    compileSource,
    loadFile,
  };
}
