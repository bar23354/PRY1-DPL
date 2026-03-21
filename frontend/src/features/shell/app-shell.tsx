"use client";

import { MODULES, getModuleDefinition } from "../../lib/modules";
import { useActiveView } from "../../hooks/use-active-view";
import { messages } from "../../i18n/messages";
import { ModuleCard } from "./module-card";
import { ModulePanel } from "./module-panel";

export function AppShell() {
  const { activeView, setActiveView } = useActiveView();
  const activeModule = getModuleDefinition(activeView);

  return (
    <div className="mx-auto max-w-[1500px] p-4 md:p-6">
      <header className="glass mb-4 rounded-2xl p-4 md:mb-6 md:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{messages.shell.header.eyebrow}</p>
            <h1 className="font-headline text-2xl font-bold md:text-3xl">{messages.shared.appTitle}</h1>
            <p className="text-sm text-slate-300">{messages.shell.header.subtitle}</p>
          </div>
          <div className="text-xs text-slate-300">
            <p>{messages.shell.header.availableComplexities}</p>
            <p>{messages.shell.header.stack}</p>
          </div>
        </div>
      </header>

      <section className="mb-4 grid grid-cols-1 gap-3 md:mb-6 md:grid-cols-2 md:gap-4 xl:grid-cols-4" aria-label={messages.shared.moduleSelectorAria}>
        {MODULES.map((moduleDefinition) => (
          <ModuleCard
            key={moduleDefinition.key}
            moduleDefinition={moduleDefinition}
            isActive={activeView === moduleDefinition.key}
            onSelect={setActiveView}
          />
        ))}
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-700/30 bg-[color:var(--color-panel)]/85">
        <div className="bg-slate-900/60 p-3 md:p-4">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{messages.shared.activeModuleLabel}</p>
            <h3 className="font-headline text-lg" data-testid="active-title">
              {activeModule.activeTitle}
            </h3>
          </div>
        </div>
        <ModulePanel moduleDefinition={activeModule} />
      </section>
    </div>
  );
}
