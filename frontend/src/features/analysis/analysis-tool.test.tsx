import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AnalysisTool } from "./analysis-tool";

const { downloadTextFileMock } = vi.hoisted(() => ({
  downloadTextFileMock: vi.fn(),
}));

vi.mock("../../lib/download", async () => {
  const actual = await vi.importActual<typeof import("../../lib/download")>("../../lib/download");
  return {
    ...actual,
    downloadTextFile: downloadTextFileMock,
  };
});


describe("AnalysisTool", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    downloadTextFileMock.mockReset();
  });

  it("renders tokens after a successful analysis run", async () => {
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
            fixtureId: "analysis-medium",
            accepted: true,
            tokens: [{ type: "IF", lexeme: "if", start: 0, end: 2, line: 1, column: 1, ruleIndex: 1 }],
            errors: [],
            stats: { tokenCount: 1, errorCount: 0, inputLength: 2 },
          }),
          { status: 200 },
        ),
      );

    const user = userEvent.setup();
    render(<AnalysisTool />);

    await waitFor(() => expect(screen.getByRole("button", { name: "Media" })).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: /ejecutar analisis/i }));

    expect(await screen.findByText("IF")).toBeInTheDocument();
    expect(screen.getByText("if")).toBeInTheDocument();
    expect(screen.getByText("No se reportaron errores lexicos en la ultima ejecucion.")).toBeInTheDocument();
  });

  it("uploads a file into the editor and exports current tokens", async () => {
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
            tokens: [{ type: "IDENT", lexeme: "sample", start: 0, end: 6, line: 1, column: 1, ruleIndex: 1 }],
            errors: [],
            stats: { tokenCount: 1, errorCount: 0, inputLength: 6 },
          }),
          { status: 200 },
        ),
      );

    const user = userEvent.setup();
    render(<AnalysisTool />);

    const fileInput = await screen.findByLabelText("Cargar archivo");
    await user.upload(fileInput, new File(["sample"], "sample.txt", { type: "text/plain" }));

    await waitFor(() => expect(screen.getByLabelText("Entrada fuente")).toHaveValue("sample"));

    await user.click(screen.getByRole("button", { name: /baja/i }));
    await user.click(screen.getByRole("button", { name: /ejecutar analisis/i }));
    await screen.findByText("IDENT");

    await user.click(screen.getByRole("button", { name: /exportar tokens/i }));

    expect(downloadTextFileMock).toHaveBeenCalledWith(
      "tokens_analisis.tsv",
      "tipo\tlexema\tlinea\tcolumna\tinicio\tfin\tindiceRegla\nIDENT\tsample\t1\t1\t0\t6\t1",
      "text/tab-separated-values;charset=utf-8",
    );
  });
});
