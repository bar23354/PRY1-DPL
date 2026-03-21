import { act, renderHook, waitFor } from "@testing-library/react";

import { useAnalysisTool } from "./use-analysis-tool";


describe("useAnalysisTool", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("loads analysis fixtures and defaults to medium complexity", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          fixtures: [
            { id: "analysis-low", module: "analysis", complexity: "low", label: "Low", kind: "yalex", specPath: "fixtures/cases/yalex/yalex_baja.yal", inputPath: "fixtures/cases/inputs/yalex_baja_input.txt", hasInput: true },
            { id: "analysis-medium", module: "analysis", complexity: "medium", label: "Medium", kind: "yalex", specPath: "fixtures/cases/yalex/yalex_media.yal", inputPath: "fixtures/cases/inputs/yalex_media_input.txt", hasInput: true },
            { id: "analysis-high", module: "analysis", complexity: "high", label: "High", kind: "yalex", specPath: "fixtures/cases/yalex/yalex_alta.yal", inputPath: "fixtures/cases/inputs/yalex_alta_input.txt", hasInput: true },
          ],
        }),
        { status: 200 },
      ),
    );

    const { result } = renderHook(() => useAnalysisTool());

    await waitFor(() => expect(result.current.isCatalogLoading).toBe(false));

    expect(result.current.activeComplexity).toBe("medium");
    expect(result.current.activeFixture?.id).toBe("analysis-medium");
    expect(result.current.fixtures).toHaveLength(3);
  });

  it("runs analysis successfully for the selected complexity", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            fixtures: [
              { id: "analysis-low", module: "analysis", complexity: "low", label: "Low", kind: "yalex", specPath: "fixtures/cases/yalex/yalex_baja.yal", inputPath: "fixtures/cases/inputs/yalex_baja_input.txt", hasInput: true },
              { id: "analysis-medium", module: "analysis", complexity: "medium", label: "Medium", kind: "yalex", specPath: "fixtures/cases/yalex/yalex_media.yal", inputPath: "fixtures/cases/inputs/yalex_media_input.txt", hasInput: true },
              { id: "analysis-high", module: "analysis", complexity: "high", label: "High", kind: "yalex", specPath: "fixtures/cases/yalex/yalex_alta.yal", inputPath: "fixtures/cases/inputs/yalex_alta_input.txt", hasInput: true },
            ],
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            fixtureId: "analysis-low",
            accepted: true,
            tokens: [{ type: "IDENT", lexeme: "variable", start: 0, end: 8, line: 1, column: 1, ruleIndex: 1 }],
            errors: [],
            stats: { tokenCount: 1, errorCount: 0, inputLength: 8 },
          }),
          { status: 200 },
        ),
      );

    const { result } = renderHook(() => useAnalysisTool());
    await waitFor(() => expect(result.current.isCatalogLoading).toBe(false));

    act(() => {
      result.current.setActiveComplexity("low");
      result.current.setInputText("variable");
    });

    await act(async () => {
      await result.current.runAnalysis();
    });

    expect(result.current.result?.accepted).toBe(true);
    expect(result.current.result?.tokens[0].type).toBe("IDENT");
    expect(globalThis.fetch).toHaveBeenLastCalledWith(
      "/api/analysis/run",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ fixtureId: "analysis-low", inputText: "variable" }),
      }),
    );
  });

  it("stores lexical errors returned by the backend", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            fixtures: [
              { id: "analysis-low", module: "analysis", complexity: "low", label: "Low", kind: "yalex", specPath: "fixtures/cases/yalex/yalex_baja.yal", inputPath: "fixtures/cases/inputs/yalex_baja_input.txt", hasInput: true },
              { id: "analysis-medium", module: "analysis", complexity: "medium", label: "Medium", kind: "yalex", specPath: "fixtures/cases/yalex/yalex_media.yal", inputPath: "fixtures/cases/inputs/yalex_media_input.txt", hasInput: true },
              { id: "analysis-high", module: "analysis", complexity: "high", label: "High", kind: "yalex", specPath: "fixtures/cases/yalex/yalex_alta.yal", inputPath: "fixtures/cases/inputs/yalex_alta_input.txt", hasInput: true },
            ],
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            fixtureId: "analysis-low",
            accepted: false,
            tokens: [],
            errors: [{ message: "No se pudo tokenizar", start: 4, end: 5, line: 1, column: 5, preview: "@ -4" }],
            stats: { tokenCount: 0, errorCount: 1, inputLength: 8 },
          }),
          { status: 200 },
        ),
      );

    const { result } = renderHook(() => useAnalysisTool());
    await waitFor(() => expect(result.current.isCatalogLoading).toBe(false));

    act(() => {
      result.current.setActiveComplexity("low");
      result.current.setInputText("var @ -4");
    });

    await act(async () => {
      await result.current.runAnalysis();
    });

    expect(result.current.result?.accepted).toBe(false);
    expect(result.current.result?.errors[0].preview).toBe("@ -4");
  });
});
