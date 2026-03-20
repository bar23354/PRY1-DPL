import { act, renderHook, waitFor } from "@testing-library/react";

import { useGeneratorTool } from "./use-generator-tool";

describe("useGeneratorTool", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("loads generator fixtures and keeps a default template in the editor", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          fixtures: [
            { id: "analysis-low", module: "analysis", complexity: "low", label: "Low", kind: "yalex", specPath: "fixtures/legacy/yalex/yalex_baja.yal", inputPath: "fixtures/legacy/inputs/yalex_baja_input.txt", hasInput: true },
            { id: "generator-low", module: "generator", complexity: "low", label: "Generator Low", kind: "yalex", specPath: "fixtures/legacy/yalex/yalex_baja.yal", inputPath: null, hasInput: false },
            { id: "generator-medium", module: "generator", complexity: "medium", label: "Generator Medium", kind: "yalex", specPath: "fixtures/legacy/yalex/yalex_media.yal", inputPath: null, hasInput: false },
            { id: "generator-high", module: "generator", complexity: "high", label: "Generator High", kind: "yalex", specPath: "fixtures/legacy/yalex/yalex_alta.yal", inputPath: null, hasInput: false },
            { id: "generator-full-features", module: "generator", complexity: "high", label: "Full Features", kind: "yalex", specPath: "fixtures/legacy/yalex/yalex_full_features.yal", inputPath: null, hasInput: false }
          ],
        }),
        { status: 200 },
      ),
    );

    const { result } = renderHook(() => useGeneratorTool());

    await waitFor(() => expect(result.current.isCatalogLoading).toBe(false));

    expect(result.current.fixtures).toHaveLength(4);
    expect(result.current.activeFixtureId).toBe("generator-low");
    expect(result.current.sourceText).toContain("rule tokens =");
  });

  it("compiles source and selects the first visible rule", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            fixtures: [
              { id: "generator-low", module: "generator", complexity: "low", label: "Generator Low", kind: "yalex", specPath: "fixtures/legacy/yalex/yalex_baja.yal", inputPath: null, hasInput: false },
            ],
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            entrypoint: "tokens",
            rules: [
              {
                index: 0,
                sourcePattern: "espacioEnBlanco",
                normalizedPattern: "(\\t|\\n| )+",
                tokenName: "SKIP",
                skip: true,
                isEof: false,
                graph: { states: ["M0"], alphabet: [" "], transitions: { M0: { " ": "M0" } }, initialState: "M0", acceptingStates: ["M0"], stateSets: { M0: ["S0"] } },
                transitionMatrix: [{ state: "M0", accepting: true, transitions: { " ": "M0" } }],
              },
              {
                index: 1,
                sourcePattern: "identificador",
                normalizedPattern: "id",
                tokenName: "IDENT",
                skip: false,
                isEof: false,
                graph: { states: ["M0", "M1"], alphabet: ["a"], transitions: { M0: { a: "M1" } }, initialState: "M0", acceptingStates: ["M1"], stateSets: { M0: ["S0"], M1: ["S1"] } },
                transitionMatrix: [{ state: "M0", accepting: false, transitions: { a: "M1" } }],
              },
            ],
            lexerSource: "def tokens(text, *args, **kwargs):\n    return []\n",
            recognizedTokens: ["IDENT"],
            stats: { ruleCount: 2, entryArgsCount: 0 },
            errors: [],
          }),
          { status: 200 },
        ),
      );

    const { result } = renderHook(() => useGeneratorTool());
    await waitFor(() => expect(result.current.isCatalogLoading).toBe(false));

    await act(async () => {
      await result.current.compileSource();
    });

    expect(result.current.result?.entrypoint).toBe("tokens");
    expect(result.current.activeRule?.tokenName).toBe("IDENT");
  });

  it("stores compile errors from the backend", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            fixtures: [{ id: "generator-low", module: "generator", complexity: "low", label: "Generator Low", kind: "yalex", specPath: "fixtures/legacy/yalex/yalex_baja.yal", inputPath: null, hasInput: false }],
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: { code: "bad_request", message: "Invalid YALex source." } }), { status: 400 }),
      );

    const { result } = renderHook(() => useGeneratorTool());
    await waitFor(() => expect(result.current.isCatalogLoading).toBe(false));

    await act(async () => {
      await result.current.compileSource();
    });

    expect(result.current.requestError).toBe("Invalid YALex source.");
    expect(result.current.result).toBeNull();
  });
});
