import { useDashboardSummary } from "./use-dashboard-summary";

const COMPLEXITY_LABELS = [
  { key: "low", label: "Low" },
  { key: "medium", label: "Medium" },
  { key: "high", label: "High" },
] as const;

const MODULE_LABELS = [
  { key: "analysis", label: "analysis" },
  { key: "generator", label: "generator" },
  { key: "test-manager", label: "test-manager" },
] as const;

export function Dashboard() {
  const { summary, loading, error } = useDashboardSummary();

  return (
    <div className="min-h-[75vh] bg-[linear-gradient(180deg,rgba(18,20,22,0.96)_0%,rgba(26,28,30,0.92)_100%)] p-6 md:min-h-[78vh] md:p-8">
      <div className="mx-auto flex h-full max-w-6xl flex-col gap-6 rounded-[28px] border border-white/5 bg-[rgba(12,14,16,0.58)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur md:p-8">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--color-primary)]">Live project summary</p>
          <div className="space-y-2">
            <h4 className="font-headline text-3xl font-bold text-white md:text-4xl">UVG Project 01: Dashboard</h4>
            <p className="max-w-3xl text-sm leading-7 text-slate-300 md:text-base">
              Consolidated summary of declarative fixtures, registered test cases and active modules available in the integrated platform.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-white/5 bg-[rgba(51,53,55,0.35)] p-6 text-sm text-slate-300">
            Loading dashboard summary...
          </div>
        ) : null}

        {error ? (
          <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 p-6 text-sm text-rose-100">
            <p className="text-base font-semibold">Dashboard data unavailable.</p>
            <p className="mt-2 text-sm text-rose-200">{error}</p>
          </div>
        ) : null}

        {summary ? (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-3xl border border-white/5 bg-[rgba(51,53,55,0.45)] p-5">
                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Fixtures</p>
                <p className="mt-3 text-4xl font-semibold text-white">{summary.totalFixtures}</p>
                <p className="mt-2 text-sm text-slate-300">Declarative inputs exposed through the fixture catalog.</p>
              </div>
              <div className="rounded-3xl border border-white/5 bg-[rgba(51,53,55,0.45)] p-5">
                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Test Cases</p>
                <p className="mt-3 text-4xl font-semibold text-white">{summary.totalTestCases}</p>
                <p className="mt-2 text-sm text-slate-300">Executable cases available to the test manager.</p>
              </div>
              <div className="rounded-3xl border border-white/5 bg-[rgba(51,53,55,0.45)] p-5">
                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Analysis Fixtures</p>
                <p className="mt-3 text-4xl font-semibold text-white">{summary.modules.analysis}</p>
                <p className="mt-2 text-sm text-slate-300">Inputs ready to be scanned through Lexical Analysis.</p>
              </div>
              <div className="rounded-3xl border border-white/5 bg-[rgba(51,53,55,0.45)] p-5">
                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Generator Specs</p>
                <p className="mt-3 text-4xl font-semibold text-white">{summary.modules.generator}</p>
                <p className="mt-2 text-sm text-slate-300">YALex specifications available to compile in the generator view.</p>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <section className="rounded-3xl border border-white/5 bg-[rgba(51,53,55,0.4)] p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Complexity distribution</p>
                    <h5 className="mt-2 text-xl font-semibold text-white">Low / Medium / High coverage</h5>
                  </div>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">
                    {summary.totalTestCases} total
                  </span>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  {COMPLEXITY_LABELS.map(({ key, label }) => (
                    <div key={key} className="rounded-2xl border border-white/5 bg-black/20 p-4">
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{label}</p>
                      <p className="mt-3 text-3xl font-semibold text-white">{summary.complexities[key]}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-3xl border border-white/5 bg-[rgba(51,53,55,0.4)] p-5">
                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Module inventory</p>
                <h5 className="mt-2 text-xl font-semibold text-white">Integrated frontend modules</h5>
                <div className="mt-5 space-y-3">
                  {MODULE_LABELS.map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between rounded-2xl border border-white/5 bg-black/20 px-4 py-3">
                      <span className="text-sm font-medium text-slate-200">{label}</span>
                      <span className="rounded-full bg-[color:var(--color-primary)]/15 px-3 py-1 text-sm font-semibold text-[color:var(--color-primary)]">
                        {summary.modules[key]}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
