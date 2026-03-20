import type { ModuleDefinition } from "../../types/shell";

interface ModulePanelProps {
  moduleDefinition: ModuleDefinition;
}

const PANEL_CONTENT: Record<ModuleDefinition["key"], { eyebrow: string; headline: string; body: string }> = {
  dashboard: {
    eyebrow: "Vista integrada",
    headline: "Dashboard General",
    body: "Resumen base del proyecto, rubrica y modulos. En las siguientes fases este panel se conectara con datos reales del backend.",
  },
  analysis: {
    eyebrow: "Modulo listo para integrar",
    headline: "Lexical Analysis",
    body: "La estructura visual ya esta integrada sin iframe. En la siguiente fase se conectara el analisis de tokens, errores y exportacion.",
  },
  generator: {
    eyebrow: "Modulo listo para integrar",
    headline: "Lexical Generator",
    body: "El shell ya reemplaza la vista legacy. Luego se conectaran editor YALex, compilacion, diagrama y descargas reales.",
  },
  tests: {
    eyebrow: "Modulo listo para integrar",
    headline: "Test Case Manager",
    body: "La navegacion ya es nativa en React. En fases posteriores se llenara con el catalogo declarativo y ejecucion real de casos.",
  },
};

export function ModulePanel({ moduleDefinition }: ModulePanelProps) {
  const content = PANEL_CONTENT[moduleDefinition.key];

  return (
    <div className="min-h-[75vh] bg-[linear-gradient(180deg,rgba(18,20,22,0.96)_0%,rgba(26,28,30,0.92)_100%)] p-6 md:min-h-[78vh] md:p-8">
      <div className="mx-auto flex h-full max-w-6xl flex-col justify-between rounded-[28px] border border-white/5 bg-[rgba(12,14,16,0.58)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur md:p-8">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--color-primary)]">{content.eyebrow}</p>
          <div className="space-y-2">
            <h4 className="font-headline text-3xl font-bold text-white md:text-4xl">{content.headline}</h4>
            <p className="max-w-3xl text-sm leading-7 text-slate-300 md:text-base">{content.body}</p>
          </div>
        </div>

        <div className="grid gap-4 pt-10 md:grid-cols-3">
          <div className="rounded-2xl border border-white/5 bg-[rgba(51,53,55,0.45)] p-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Estado</p>
            <p className="mt-2 text-lg font-semibold text-white">Shell integrado</p>
            <p className="mt-2 text-sm text-slate-400">La vista ahora forma parte del app shell sin depender de contenido incrustado.</p>
          </div>
          <div className="rounded-2xl border border-white/5 bg-[rgba(51,53,55,0.45)] p-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Compatibilidad</p>
            <p className="mt-2 text-lg font-semibold text-white">Baseline preservado</p>
            <p className="mt-2 text-sm text-slate-400">El enlace independiente sigue apuntando al HTML legacy para comparacion durante la migracion.</p>
          </div>
          <div className="rounded-2xl border border-white/5 bg-[rgba(51,53,55,0.45)] p-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Siguiente paso</p>
            <p className="mt-2 text-lg font-semibold text-white">Integracion funcional</p>
            <p className="mt-2 text-sm text-slate-400">Las siguientes fases conectaran API, datos reales y componentes interactivos por modulo.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
