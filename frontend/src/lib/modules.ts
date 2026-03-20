import type { ModuleDefinition, ViewKey } from "../types/shell";
import { messages } from "../i18n/messages";

export const MODULES: ModuleDefinition[] = [
  {
    key: "dashboard",
    badge: messages.shell.modules.dashboard.badge,
    cardTitle: messages.shell.modules.dashboard.cardTitle,
    cardDescription: messages.shell.modules.dashboard.cardDescription,
    activeTitle: messages.shell.modules.dashboard.activeTitle,
    standalonePath: "dashboard_project_01/code.html",
  },
  {
    key: "analysis",
    badge: messages.shell.modules.analysis.badge,
    cardTitle: messages.shell.modules.analysis.cardTitle,
    cardDescription: messages.shell.modules.analysis.cardDescription,
    activeTitle: messages.shell.modules.analysis.activeTitle,
    standalonePath: "analysis_tool/code.html",
  },
  {
    key: "generator",
    badge: messages.shell.modules.generator.badge,
    cardTitle: messages.shell.modules.generator.cardTitle,
    cardDescription: messages.shell.modules.generator.cardDescription,
    activeTitle: messages.shell.modules.generator.activeTitle,
    standalonePath: "lexical_generator/code.html",
  },
  {
    key: "tests",
    badge: messages.shell.modules.tests.badge,
    cardTitle: messages.shell.modules.tests.cardTitle,
    cardDescription: messages.shell.modules.tests.cardDescription,
    activeTitle: messages.shell.modules.tests.activeTitle,
    standalonePath: "test_case_manager/code.html",
  },
];

export const DEFAULT_VIEW: ViewKey = "dashboard";

export function getModuleDefinition(key: ViewKey): ModuleDefinition {
  const moduleDefinition = MODULES.find((item) => item.key === key);
  if (!moduleDefinition) {
    throw new Error(`${messages.shared.errors.unsupportedModule}: ${key}`);
  }
  return moduleDefinition;
}
