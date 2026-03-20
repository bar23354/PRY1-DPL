import type { ModuleDefinition, ViewKey } from "../types/shell";

export const MODULES: ModuleDefinition[] = [
  {
    key: "dashboard",
    badge: "Vista 01",
    cardTitle: "Dashboard General",
    cardDescription: "Estado global del proyecto, rubrica y modulos.",
    activeTitle: "Dashboard General",
    standalonePath: "dashboard_project_01/code.html",
  },
  {
    key: "analysis",
    badge: "Vista 02",
    cardTitle: "Lexical Analysis",
    cardDescription: "Identificacion de tokens y deteccion de errores.",
    activeTitle: "Lexical Analysis",
    standalonePath: "analysis_tool/code.html",
  },
  {
    key: "generator",
    badge: "Vista 03",
    cardTitle: "Lexical Generator",
    cardDescription: "Editor YALex y diagrama de transiciones.",
    activeTitle: "Lexical Generator",
    standalonePath: "lexical_generator/code.html",
  },
  {
    key: "tests",
    badge: "Vista 04",
    cardTitle: "Test Case Manager",
    cardDescription: "Casos baja/media/alta y ejecucion de pruebas.",
    activeTitle: "Test Case Manager",
    standalonePath: "test_case_manager/code.html",
  },
];

export const DEFAULT_VIEW: ViewKey = "dashboard";

export function getModuleDefinition(key: ViewKey): ModuleDefinition {
  const moduleDefinition = MODULES.find((item) => item.key === key);
  if (!moduleDefinition) {
    throw new Error(`Unknown module key: ${key}`);
  }
  return moduleDefinition;
}
