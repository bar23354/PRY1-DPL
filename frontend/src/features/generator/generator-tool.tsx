"use client";

import { useRef } from "react";

import { getGeneratorFixtureLabel, messages } from "../../i18n/messages";
import { downloadTextFile } from "../../lib/download";
import { GeneratorGraphView } from "./generator-graph";
import { useGeneratorTool } from "./use-generator-tool";

export function GeneratorTool() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const {
    fixtures,
    activeFixtureId,
    setActiveFixtureId,
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
  } = useGeneratorTool();

  function handleDownloadLexer() {
    if (!result) {
      return;
    }
    downloadTextFile(messages.downloads.generatorLexerFilename, result.lexerSource, messages.downloads.generatorLexerMime);
  }

  function handleDownloadAutomaton() {
    if (svgRef.current) {
      downloadTextFile(
        messages.downloads.generatorAutomatonFilename,
        svgRef.current.outerHTML,
        messages.downloads.generatorAutomatonMime,
      );
      return;
    }

    if (activeRule) {
      downloadTextFile(
        messages.downloads.generatorAutomatonJsonFilename,
        JSON.stringify(activeRule.graph, null, 2),
        messages.downloads.generatorAutomatonJsonMime,
      );
    }
  }

  return (
    <div className="flex min-h-[78vh] flex-col overflow-hidden bg-[linear-gradient(180deg,#121416_0%,#17191c_100%)]">
      <div className="flex items-center justify-between bg-[rgba(30,32,34,0.9)] px-6 py-4">
        <div className="flex items-center gap-4">
          <h4 className="font-headline text-xl font-bold text-white">{messages.generator.title}</h4>
          <span className="rounded-full bg-[rgba(51,77,88,0.75)] px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-slate-100">{messages.generator.mode}</span>
        </div>
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            aria-label={messages.generator.controls.uploadFile}
            className="hidden"
            type="file"
            accept=".yal,text/plain"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                void loadFile(file);
              }
            }}
          />
          <button
            type="button"
            className="rounded-md bg-[rgba(51,53,55,0.85)] px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-[rgba(56,57,60,0.95)]"
            onClick={() => fileInputRef.current?.click()}
          >
            {messages.generator.controls.uploadFile}
          </button>
          <button
            type="button"
            className="rounded-md bg-[linear-gradient(135deg,var(--color-primary),#8390f2)] px-4 py-2 text-sm font-bold text-[#152383] transition hover:brightness-110 disabled:opacity-60"
            disabled={isCatalogLoading || isCompiling}
            onClick={() => {
              void compileSource();
            }}
          >
            {isCompiling ? messages.generator.controls.compiling : messages.generator.controls.generateDiagram}
          </button>
          <button
            type="button"
            className="rounded-md bg-[rgba(51,53,55,0.85)] px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-[rgba(56,57,60,0.95)] disabled:opacity-50"
            disabled={!result}
            onClick={handleDownloadAutomaton}
          >
            {messages.generator.controls.downloadAutomaton}
          </button>
          <button
            type="button"
            className="rounded-md bg-[rgba(51,53,55,0.85)] px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-[rgba(56,57,60,0.95)] disabled:opacity-50"
            disabled={!result}
            onClick={handleDownloadLexer}
          >
            {messages.generator.controls.downloadLexer}
          </button>
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-2">
        <section className="border-r border-white/5 bg-[rgba(26,28,30,0.94)]">
          <div className="flex items-center justify-between border-b border-white/5 bg-[rgba(12,14,16,0.7)] px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase tracking-[0.18em] text-slate-400">{messages.generator.labels.source}</span>
              <select
                aria-label={messages.generator.labels.fixtureSelector}
                className="rounded-md border border-white/5 bg-[rgba(51,53,55,0.9)] px-3 py-1 text-xs text-slate-100 outline-none"
                value={activeFixtureId}
                onChange={(event) => setActiveFixtureId(event.target.value)}
              >
                {fixtures.map((fixture) => (
                  <option key={fixture.id} value={fixture.id}>
                    {getGeneratorFixtureLabel(fixture)}
                  </option>
                ))}
              </select>
            </div>
            <span className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
              {result ? `${result.stats.ruleCount} ${messages.generator.labels.rulesSuffix}` : messages.generator.labels.noCompilation}
            </span>
          </div>

          <textarea
            aria-label={messages.generator.labels.sourceEditor}
            className="min-h-[420px] w-full resize-none bg-[rgba(12,14,16,0.92)] p-5 font-mono text-sm leading-7 text-indigo-100 outline-none"
            value={sourceText}
            onChange={(event) => setSourceText(event.target.value)}
          />
        </section>

        <section className="flex flex-col bg-[rgba(30,32,34,0.92)]">
          <div className="flex items-center justify-between border-b border-white/5 bg-[rgba(12,14,16,0.7)] px-4 py-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{messages.generator.labels.activeRule}</p>
              <p className="mt-1 text-sm font-semibold text-white" data-testid="active-rule-token">
                {activeRule?.tokenName ?? messages.generator.labels.noActiveRule}
              </p>
            </div>
            <div className="text-right text-xs text-slate-400">
              <p>{messages.generator.labels.entrypoint}: {result?.entrypoint ?? "-"}</p>
              <p>{messages.generator.labels.entryArgs}: {result?.stats.entryArgsCount ?? 0}</p>
            </div>
          </div>

          {requestError ? (
            <div className="m-4 rounded-xl border border-red-400/20 bg-[rgba(147,0,10,0.18)] px-4 py-3 text-sm text-red-200">{requestError}</div>
          ) : null}

          <div className="flex flex-wrap gap-2 border-b border-white/5 px-4 py-3">
            {(result?.rules ?? []).map((rule) => (
              <button
                key={rule.index}
                type="button"
                className="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] transition"
                data-active={activeRuleIndex === rule.index}
                onClick={() => setActiveRuleIndex(rule.index)}
              >
                <span
                  className={
                    activeRuleIndex === rule.index
                      ? "rounded-full bg-[color:var(--color-primary)] px-3 py-1 text-[#152383]"
                      : "rounded-full bg-[rgba(51,53,55,0.9)] px-3 py-1 text-slate-200"
                  }
                >
                  {rule.sourcePattern}
                </span>
              </button>
            ))}
          </div>

          <div className="grid flex-1 gap-0 xl:grid-cols-[1.4fr_1fr]">
            <div className="border-r border-white/5 p-5">
              <div className="rounded-2xl border border-white/5 bg-[rgba(12,14,16,0.45)] p-4">
                {activeRule ? <GeneratorGraphView graph={activeRule.graph} svgRef={svgRef} /> : <div className="h-[340px]" />}
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-white/5 bg-[rgba(51,53,55,0.45)] p-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">{messages.generator.labels.states}</p>
                  <p className="mt-2 text-lg font-semibold text-white">{activeRule?.graph.states.length ?? 0}</p>
                </div>
                <div className="rounded-2xl border border-white/5 bg-[rgba(51,53,55,0.45)] p-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">{messages.generator.labels.alphabet}</p>
                  <p className="mt-2 text-lg font-semibold text-white">{activeRule?.graph.alphabet.length ?? 0}</p>
                </div>
                <div className="rounded-2xl border border-white/5 bg-[rgba(51,53,55,0.45)] p-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">{messages.generator.labels.recognizedTokens}</p>
                  <p className="mt-2 text-lg font-semibold text-white">{result?.recognizedTokens.length ?? 0}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col">
              <div className="border-b border-white/5 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{messages.generator.labels.recognizedTokens}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(result?.recognizedTokens ?? []).map((token) => (
                    <span key={token} className="rounded-full bg-[rgba(51,53,55,0.9)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-100">
                      {token}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-auto p-4">
                <p className="mb-3 text-xs uppercase tracking-[0.18em] text-slate-400">{messages.generator.labels.transitionMatrix}</p>
                <table className="w-full text-left text-xs">
                  <thead className="text-[10px] uppercase tracking-[0.16em] text-slate-400">
                    <tr>
                      <th className="px-2 py-2">{messages.generator.labels.columns.state}</th>
                      <th className="px-2 py-2">{messages.generator.labels.columns.accepting}</th>
                      <th className="px-2 py-2">{messages.generator.labels.columns.transitions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono">
                    {(activeRule?.transitionMatrix ?? []).map((row) => (
                      <tr key={row.state}>
                        <td className="px-2 py-2 text-slate-100">{row.state}</td>
                        <td className="px-2 py-2 text-slate-400">{row.accepting ? messages.shared.states.yes : messages.shared.states.no}</td>
                        <td className="px-2 py-2 text-slate-400">
                          {Object.entries(row.transitions)
                            .map(([symbol, target]) => `${symbol}:${target ?? "-"}`)
                            .join(" | ")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
