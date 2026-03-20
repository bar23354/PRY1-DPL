import { messages } from "../../i18n/messages";
import { useDashboardSummary } from "./use-dashboard-summary";

const COMPLEXITY_LABELS = [
  { key: "low", label: messages.shared.complexityLabels.low },
  { key: "medium", label: messages.shared.complexityLabels.medium },
  { key: "high", label: messages.shared.complexityLabels.high },
] as const;

const MODULE_LABELS = [
  { key: "analysis", label: messages.dashboard.modules.analysis },
  { key: "generator", label: messages.dashboard.modules.generator },
  { key: "test-manager", label: messages.dashboard.modules["test-manager"] },
] as const;

export function Dashboard() {
  const { summary, loading, error } = useDashboardSummary();

  return (
    <div className="min-h-[75vh] bg-[linear-gradient(180deg,rgba(18,20,22,0.96)_0%,rgba(26,28,30,0.92)_100%)] p-6 md:min-h-[78vh] md:p-8">
      <div className="mx-auto flex h-full max-w-6xl flex-col gap-6 rounded-[28px] border border-white/5 bg-[rgba(12,14,16,0.58)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur md:p-8">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--color-primary)]">{messages.dashboard.eyebrow}</p>
          <div className="space-y-2">
            <h4 className="font-headline text-3xl font-bold text-white md:text-4xl">{messages.dashboard.title}</h4>
            <p className="max-w-3xl text-sm leading-7 text-slate-300 md:text-base">{messages.dashboard.description}</p>
          </div>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-white/5 bg-[rgba(51,53,55,0.35)] p-6 text-sm text-slate-300">
            {messages.dashboard.loading}
          </div>
        ) : null}

        {error ? (
          <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 p-6 text-sm text-rose-100">
            <p className="text-base font-semibold">{messages.dashboard.unavailable}</p>
            <p className="mt-2 text-sm text-rose-200">{error}</p>
          </div>
        ) : null}

        {summary ? (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-3xl border border-white/5 bg-[rgba(51,53,55,0.45)] p-5">
                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">{messages.dashboard.cards.fixtures.label}</p>
                <p className="mt-3 text-4xl font-semibold text-white">{summary.totalFixtures}</p>
                <p className="mt-2 text-sm text-slate-300">{messages.dashboard.cards.fixtures.description}</p>
              </div>
              <div className="rounded-3xl border border-white/5 bg-[rgba(51,53,55,0.45)] p-5">
                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">{messages.dashboard.cards.testCases.label}</p>
                <p className="mt-3 text-4xl font-semibold text-white">{summary.totalTestCases}</p>
                <p className="mt-2 text-sm text-slate-300">{messages.dashboard.cards.testCases.description}</p>
              </div>
              <div className="rounded-3xl border border-white/5 bg-[rgba(51,53,55,0.45)] p-5">
                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">{messages.dashboard.cards.analysis.label}</p>
                <p className="mt-3 text-4xl font-semibold text-white">{summary.modules.analysis}</p>
                <p className="mt-2 text-sm text-slate-300">{messages.dashboard.cards.analysis.description}</p>
              </div>
              <div className="rounded-3xl border border-white/5 bg-[rgba(51,53,55,0.45)] p-5">
                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">{messages.dashboard.cards.generator.label}</p>
                <p className="mt-3 text-4xl font-semibold text-white">{summary.modules.generator}</p>
                <p className="mt-2 text-sm text-slate-300">{messages.dashboard.cards.generator.description}</p>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <section className="rounded-3xl border border-white/5 bg-[rgba(51,53,55,0.4)] p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">{messages.dashboard.complexity.label}</p>
                    <h5 className="mt-2 text-xl font-semibold text-white">{messages.dashboard.complexity.title}</h5>
                  </div>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">
                    {summary.totalTestCases} {messages.dashboard.complexity.totalSuffix}
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
                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">{messages.dashboard.modules.label}</p>
                <h5 className="mt-2 text-xl font-semibold text-white">{messages.dashboard.modules.title}</h5>
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
