export type ViewKey = "dashboard" | "analysis" | "generator" | "tests";

export interface ModuleDefinition {
  key: ViewKey;
  badge: string;
  cardTitle: string;
  cardDescription: string;
  activeTitle: string;
  standalonePath: string;
}
