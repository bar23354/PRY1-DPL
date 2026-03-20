"use client";

import { useRef } from "react";

import { buildTokensExportContent, downloadTextFile } from "../../lib/download";
import type { AnalysisComplexity } from "../../types/analysis";
import { useAnalysisTool } from "./use-analysis-tool";

const COMPLEXITY_OPTIONS: AnalysisComplexity[] = ["low", "medium", "high"];

function complexityLabel(complexity: AnalysisComplexity): string {
  return complexity.charAt(0).toUpperCase() + complexity.slice(1);
}

export function AnalysisTool() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const {
    activeComplexity,
    setActiveComplexity,
    activeFixture,
    inputText,
    setInputText,
    result,
    isCatalogLoading,
    isRunning,
    requestError,
    runAnalysis,
    loadFile,
  } = useAnalysisTool();

  const tokens = result?.tokens ?? [];
  const errors = result?.errors ?? [];
  const stats = result?.stats ?? { tokenCount: 0, errorCount: 0, inputLength: inputText.length };

  function handleExportTokens() {
    if (tokens.length === 0) {
      return;
    }

    downloadTextFile("analysis-tokens.tsv", buildTokensExportContent(tokens), "text/tab-separated-values;charset=utf-8");
  }

  return (
    <div className="bg-[linear-gradient(180deg,#121416_0%,#17191c_100%)] p-6 md:p-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h4 className="font-headline text-3xl font-bold tracking-tight text-white">Lexical Analysis</h4>
            <p className="mt-1 text-sm text-slate-400">
              Tokeniza, valida y reporta errores usando el backend Python real a traves de rutas relativas.
            </p>
          </div>
          <div className="flex items-center gap-4 rounded-xl border border-white/5 bg-[rgba(30,32,34,0.88)] p-1.5">
            <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Complexity</span>
            <div className="flex gap-1">
              {COMPLEXITY_OPTIONS.map((complexity) => (
                <button
                  key={complexity}
                  type="button"
                  className="rounded-md px-4 py-1.5 text-xs font-bold transition-all"
                  data-active={activeComplexity === complexity}
                  onClick={() => setActiveComplexity(complexity)}
                >
                  <span
                    className={
                      activeComplexity === complexity
                        ? "rounded-md bg-[color:var(--color-primary)] px-4 py-1.5 text-[#152383] shadow-lg shadow-[rgba(188,194,255,0.18)]"
                        : "rounded-md bg-slate-800 px-4 py-1.5 text-slate-300"
                    }
                  >
                    {complexityLabel(complexity)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/5 bg-[rgba(30,32,34,0.88)] p-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Fixture activo</p>
            <p className="mt-2 text-lg font-semibold text-white">{activeFixture?.label ?? "Cargando catalogo..."}</p>
            <p className="mt-2 text-sm text-slate-400">
              {inputText.trim() === "" ? "Si el editor esta vacio, se usara el sample del fixture." : "Se analizara el contenido actual del editor."}
            </p>
          </div>
          <div className="rounded-2xl border border-white/5 bg-[rgba(30,32,34,0.88)] p-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Metricas</p>
            <p className="mt-2 text-lg font-semibold text-white">{stats.tokenCount} Tokens</p>
            <p className="mt-2 text-sm text-slate-400">{stats.errorCount} Errors</p>
          </div>
          <div className="rounded-2xl border border-white/5 bg-[rgba(30,32,34,0.88)] p-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Entrada</p>
            <p className="mt-2 text-lg font-semibold text-white">{stats.inputLength} Chars</p>
            <p className="mt-2 text-sm text-slate-400">{result?.accepted ? "Analisis aceptado" : "Pendiente o con errores"}</p>
          </div>
        </div>

        {requestError ? (
          <div className="rounded-2xl border border-red-400/20 bg-[rgba(147,0,10,0.18)] px-4 py-3 text-sm text-red-200">{requestError}</div>
        ) : null}

        <div className="grid flex-1 grid-cols-12 gap-6">
          <div className="col-span-12 flex flex-col overflow-hidden rounded-xl border border-white/5 bg-[rgba(26,28,30,0.92)] lg:col-span-7">
            <div className="flex items-center justify-between border-b border-white/5 bg-[rgba(30,32,34,0.96)] px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-300">Source Input</span>
                <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-slate-400">
                  {activeFixture?.id ?? "loading"}
                </span>
              </div>
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  aria-label="Load file"
                  className="hidden"
                  type="file"
                  accept=".txt,text/plain"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      void loadFile(file);
                    }
                  }}
                />
                <button
                  type="button"
                  className="rounded-md px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-300 transition hover:bg-slate-800"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Load File
                </button>
                <button
                  type="button"
                  className="rounded-md px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
                  disabled={tokens.length === 0}
                  onClick={handleExportTokens}
                >
                  Export Tokens
                </button>
              </div>
            </div>

            <div className="relative min-h-[420px] flex-1 bg-[rgba(12,14,16,0.92)]">
              <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-12 border-r border-white/5 bg-[rgba(26,28,30,0.95)] text-center text-xs text-slate-600 md:block">
                {Array.from({ length: 12 }, (_, index) => (
                  <div key={index} className="pt-4 first:pt-4">
                    {index + 1}
                  </div>
                ))}
              </div>
              <textarea
                aria-label="Source input"
                className="h-full min-h-[420px] w-full resize-none bg-transparent p-4 font-mono text-sm leading-7 text-indigo-100 outline-none md:pl-16"
                placeholder="// Leave empty to use the fixture sample input."
                value={inputText}
                onChange={(event) => setInputText(event.target.value)}
              />
            </div>

            <div className="flex items-center justify-between border-t border-white/5 bg-[rgba(30,32,34,0.96)] p-4">
              <span className="text-[10px] uppercase tracking-[0.18em] text-slate-400">ASCII / UTF-8 Encoded</span>
              <button
                type="button"
                className="rounded-md bg-[linear-gradient(135deg,var(--color-primary),#8390f2)] px-8 py-2 text-xs font-black uppercase tracking-[0.15em] text-[#152383] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isCatalogLoading || isRunning || !activeFixture}
                onClick={() => {
                  void runAnalysis();
                }}
              >
                {isRunning ? "Running..." : "Run Analysis"}
              </button>
            </div>
          </div>

          <div className="col-span-12 flex flex-col gap-6 lg:col-span-5">
            <div className="flex min-h-[320px] flex-col overflow-hidden rounded-xl border border-white/5 bg-[rgba(30,32,34,0.92)]">
              <div className="flex items-center justify-between border-b border-white/5 bg-[rgba(40,42,44,0.92)] px-4 py-3">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-300">Identified Tokens</span>
                <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-slate-400">
                  {tokens.length} Found
                </span>
              </div>
              <div className="flex-1 overflow-auto">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-[rgba(40,42,44,0.98)] text-[10px] uppercase tracking-widest text-slate-400">
                    <tr>
                      <th className="px-4 py-2">Lexeme</th>
                      <th className="px-4 py-2">Token</th>
                      <th className="px-4 py-2 text-right">Ln</th>
                      <th className="px-4 py-2 text-right">Col</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono">
                    {tokens.length === 0 ? (
                      <tr>
                        <td className="px-4 py-4 text-slate-500" colSpan={4}>
                          Run analysis to populate the token table.
                        </td>
                      </tr>
                    ) : (
                      tokens.map((token, index) => (
                        <tr key={`${token.type}-${token.start}-${index}`} className="hover:bg-white/5">
                          <td className="px-4 py-2.5 text-indigo-200">{token.lexeme}</td>
                          <td className="px-4 py-2.5">
                            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-200">{token.type}</span>
                          </td>
                          <td className="px-4 py-2.5 text-right text-slate-400">{token.line}</td>
                          <td className="px-4 py-2.5 text-right text-slate-400">{token.column}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex min-h-[220px] flex-col overflow-hidden rounded-xl border border-red-400/10 bg-[rgba(30,32,34,0.92)]">
              <div className="flex items-center justify-between border-b border-red-400/10 bg-[rgba(147,0,10,0.12)] px-4 py-3">
                <span className="text-xs font-bold uppercase tracking-widest text-red-200">Lexical Errors</span>
                <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-red-100">
                  {errors.length} Errors
                </span>
              </div>
              <div className="flex-1 space-y-3 p-4">
                {errors.length === 0 ? (
                  <p className="text-sm text-slate-400">No lexical errors reported for the latest analysis run.</p>
                ) : (
                  errors.map((error, index) => (
                    <div key={`${error.start}-${index}`} className="rounded-xl border border-red-400/10 bg-[rgba(12,14,16,0.45)] p-3">
                      <p className="font-mono text-[11px] font-bold text-red-200">
                        {error.message} [Ln {error.line}, Col {error.column}]
                      </p>
                      <p className="mt-1 text-[11px] text-slate-400">Preview: {error.preview || "n/a"}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
