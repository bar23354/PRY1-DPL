import type { ModuleDefinition } from "../../types/shell";
import { messages } from "../../i18n/messages";
import { AnalysisTool } from "../analysis/analysis-tool";
import { Dashboard } from "../dashboard/dashboard";
import { GeneratorTool } from "../generator/generator-tool";
import { TestManager } from "../test-manager/test-manager";

interface ModulePanelProps {
  moduleDefinition: ModuleDefinition;
}

export function ModulePanel({ moduleDefinition }: ModulePanelProps) {
  if (moduleDefinition.key === "dashboard") {
    return <Dashboard />;
  }

  if (moduleDefinition.key === "analysis") {
    return <AnalysisTool />;
  }

  if (moduleDefinition.key === "generator") {
    return <GeneratorTool />;
  }

  if (moduleDefinition.key === "tests") {
    return <TestManager />;
  }

  throw new Error(`${messages.shared.errors.unsupportedModule}: ${moduleDefinition.key}`);
}
