import type { ModuleDefinition, ViewKey } from "../../types/shell";

interface ModuleCardProps {
  moduleDefinition: ModuleDefinition;
  isActive: boolean;
  onSelect: (view: ViewKey) => void;
}

export function ModuleCard({ moduleDefinition, isActive, onSelect }: ModuleCardProps) {
  return (
    <button
      type="button"
      data-active={isActive}
      className="module-card rounded-2xl bg-[color:var(--color-surface)] p-4 text-left transition hover:-translate-y-0.5 data-[active=true]:ring-1 data-[active=true]:ring-[color:rgba(188,194,255,0.45)] data-[active=true]:shadow-[0_12px_28px_rgba(0,0,0,0.35)]"
      onClick={() => onSelect(moduleDefinition.key)}
    >
      <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--color-primary)]">{moduleDefinition.badge}</p>
      <h2 className="mt-1 font-headline text-lg font-semibold">{moduleDefinition.cardTitle}</h2>
      <p className="mt-1 text-sm text-slate-400">{moduleDefinition.cardDescription}</p>
    </button>
  );
}
