export interface GeneratorGraph {
  states: string[];
  alphabet: string[];
  transitions: Record<string, Record<string, string>>;
  initialState: string | null;
  acceptingStates: string[];
  stateSets: Record<string, string[]>;
}

export interface GeneratorTransitionRow {
  state: string;
  accepting: boolean;
  transitions: Record<string, string | null>;
}

export interface GeneratorRule {
  index: number;
  sourcePattern: string;
  normalizedPattern: string;
  tokenName: string;
  skip: boolean;
  isEof: boolean;
  graph: GeneratorGraph;
  transitionMatrix: GeneratorTransitionRow[];
}

export interface GeneratorStats {
  ruleCount: number;
  entryArgsCount: number;
}

export interface GeneratorResult {
  entrypoint: string;
  rules: GeneratorRule[];
  lexerSource: string;
  recognizedTokens: string[];
  stats: GeneratorStats;
  errors: string[];
}
