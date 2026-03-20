import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { GeneratorTool } from "./generator-tool";

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

describe("GeneratorTool", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    downloadTextFileMock.mockReset();
  });

  it("compiles YALex source, renders results and allows rule switching", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            fixtures: [
              { id: "generator-low", module: "generator", complexity: "low", label: "Generator Low", kind: "yalex", specPath: "fixtures/legacy/yalex/yalex_baja.yal", inputPath: null, hasInput: false },
              { id: "generator-full-features", module: "generator", complexity: "high", label: "Full Features", kind: "yalex", specPath: "fixtures/legacy/yalex/yalex_full_features.yal", inputPath: null, hasInput: false },
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
                graph: { states: ["M0", "M1"], alphabet: [" "], transitions: { M0: { " ": "M1" }, M1: { " ": "M1" } }, initialState: "M0", acceptingStates: ["M1"], stateSets: { M0: ["S0"], M1: ["S1"] } },
                transitionMatrix: [{ state: "M0", accepting: false, transitions: { " ": "M1" } }],
              },
              {
                index: 1,
                sourcePattern: "identificador",
                normalizedPattern: "id",
                tokenName: "IDENT",
                skip: false,
                isEof: false,
                graph: { states: ["M0", "M1"], alphabet: ["a"], transitions: { M0: { a: "M1" }, M1: { a: "M1" } }, initialState: "M0", acceptingStates: ["M1"], stateSets: { M0: ["S0"], M1: ["S1"] } },
                transitionMatrix: [{ state: "M0", accepting: false, transitions: { a: "M1" } }],
              },
            ],
            lexerSource: "def tokens(text, *args, **kwargs):\\n    return []\\n",
            recognizedTokens: ["IDENT", "PLUS"],
            stats: { ruleCount: 2, entryArgsCount: 0 },
            errors: [],
          }),
          { status: 200 },
        ),
      );

    const user = userEvent.setup();
    render(<GeneratorTool />);

    await waitFor(() => expect(screen.getByRole("button", { name: /generate diagram/i })).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: /generate diagram/i }));

    expect(await screen.findByTestId("active-rule-token")).toHaveTextContent("IDENT");
    expect(screen.getByTestId("generator-graph")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /espacioenblanco/i }));

    expect(screen.getByTestId("active-rule-token")).toHaveTextContent("SKIP");
  });

  it("uploads source and downloads lexer and automaton", async () => {
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
        new Response(
          JSON.stringify({
            entrypoint: "tokens",
            rules: [
              {
                index: 1,
                sourcePattern: "identificador",
                normalizedPattern: "id",
                tokenName: "IDENT",
                skip: false,
                isEof: false,
                graph: { states: ["M0", "M1"], alphabet: ["a"], transitions: { M0: { a: "M1" }, M1: { a: "M1" } }, initialState: "M0", acceptingStates: ["M1"], stateSets: { M0: ["S0"], M1: ["S1"] } },
                transitionMatrix: [{ state: "M0", accepting: false, transitions: { a: "M1" } }],
              },
            ],
            lexerSource: "def tokens(text, *args, **kwargs):\\n    return []\\n",
            recognizedTokens: ["IDENT"],
            stats: { ruleCount: 1, entryArgsCount: 0 },
            errors: [],
          }),
          { status: 200 },
        ),
      );

    const user = userEvent.setup();
    render(<GeneratorTool />);

    const fileInput = await screen.findByLabelText("Upload file");
    const file = new File(["rule tokens =\n  'a' { return A }\n"], "lexer.yal", { type: "text/plain" });
    await user.upload(fileInput, file);
    await waitFor(() => expect(screen.getByLabelText("YALex source")).toHaveValue("rule tokens =\n  'a' { return A }\n"));

    await user.click(screen.getByRole("button", { name: /generate diagram/i }));
    await screen.findByTestId("generator-graph");

    await user.click(screen.getByRole("button", { name: /download lexer/i }));
    await user.click(screen.getByRole("button", { name: /download automaton/i }));

    expect(downloadTextFileMock).toHaveBeenCalledWith(
      "thelexer.py",
      "def tokens(text, *args, **kwargs):\\n    return []\\n",
      "text/x-python;charset=utf-8",
    );
    expect(downloadTextFileMock).toHaveBeenCalledWith(
      "automaton.svg",
      expect.stringContaining("<svg"),
      "image/svg+xml;charset=utf-8",
    );
  });
});
