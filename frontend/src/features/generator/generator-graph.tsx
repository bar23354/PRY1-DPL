import type { GeneratorGraph } from "../../types/generator";

interface GeneratorGraphProps {
  graph: GeneratorGraph;
  svgRef?: React.RefObject<SVGSVGElement | null>;
}

function buildPositions(states: string[]) {
  const centerX = 360;
  const centerY = 170;
  const radius = Math.max(90, 48 * states.length);

  return Object.fromEntries(
    states.map((state, index) => {
      const angle = (Math.PI * 2 * index) / Math.max(states.length, 1) - Math.PI / 2;
      return [
        state,
        {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
        },
      ];
    }),
  );
}

function escapeSymbol(symbol: string): string {
  if (symbol === "\n") {
    return "\\n";
  }
  if (symbol === "\t") {
    return "\\t";
  }
  if (symbol === " ") {
    return "space";
  }
  return symbol;
}

export function GeneratorGraphView({ graph, svgRef }: GeneratorGraphProps) {
  if (graph.states.length === 0) {
    return (
      <div className="flex h-[320px] items-center justify-center rounded-2xl border border-white/5 bg-[rgba(12,14,16,0.4)] text-sm text-slate-500">
        No graph data available for this rule.
      </div>
    );
  }

  const positions = buildPositions(graph.states);
  const edges = Object.entries(graph.transitions).flatMap(([fromState, transitions]) =>
    Object.entries(transitions).map(([symbol, toState]) => ({
      fromState,
      toState,
      symbol: escapeSymbol(symbol),
    })),
  );

  return (
    <svg ref={svgRef} data-testid="generator-graph" viewBox="0 0 720 340" className="h-[340px] w-full overflow-visible">
      <defs>
        <marker id="arrowhead-generator" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
        </marker>
      </defs>

      {edges.map((edge, index) => {
        const from = positions[edge.fromState];
        const to = positions[edge.toState];
        const isLoop = edge.fromState === edge.toState;
        const path = isLoop
          ? `M ${from.x} ${from.y - 30} C ${from.x + 45} ${from.y - 85}, ${from.x - 45} ${from.y - 85}, ${from.x} ${
              from.y - 30
            }`
          : `M ${from.x} ${from.y} Q ${(from.x + to.x) / 2} ${Math.min(from.y, to.y) - 32} ${to.x} ${to.y}`;
        const labelX = isLoop ? from.x : (from.x + to.x) / 2;
        const labelY = isLoop ? from.y - 92 : Math.min(from.y, to.y) - 38;

        return (
          <g key={`${edge.fromState}-${edge.toState}-${edge.symbol}-${index}`}>
            <path d={path} fill="none" stroke="#6b7280" strokeWidth="2" markerEnd="url(#arrowhead-generator)" />
            <text x={labelX} y={labelY} fill="#bcc2ff" fontSize="11" textAnchor="middle">
              {edge.symbol}
            </text>
          </g>
        );
      })}

      {graph.states.map((state) => {
        const position = positions[state];
        const isAccepting = graph.acceptingStates.includes(state);
        const isInitial = graph.initialState === state;

        return (
          <g key={state}>
            <circle cx={position.x} cy={position.y} r="28" fill="#121416" stroke={isInitial ? "#bcc2ff" : "#6b7280"} strokeWidth="2.5" />
            {isAccepting ? <circle cx={position.x} cy={position.y} r="21" fill="none" stroke="#ffb59d" strokeWidth="2" /> : null}
            <text x={position.x} y={position.y + 4} fill="#e2e2e5" textAnchor="middle" fontSize="12" fontWeight="700">
              {state}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
