import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AppShell } from "./app-shell";


describe("AppShell", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the dashboard as the default active module", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          totalFixtures: 5,
          totalTestCases: 6,
          complexities: { low: 2, medium: 2, high: 2 },
          modules: { analysis: 3, generator: 2, "test-manager": 6 },
        }),
        { status: 200 },
      ),
    );

    render(<AppShell />);

    expect(await screen.findByText("Proyecto 01 UVG: Panel general")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Proyecto 01 - Interfaz Integrada" })).toBeInTheDocument();
    expect(screen.getByTestId("active-title")).toHaveTextContent("Panel general");
    expect(screen.queryByTitle("Interfaz de modulo")).not.toBeInTheDocument();
  });

  it("switches the active module without using an iframe", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            totalFixtures: 5,
            totalTestCases: 6,
            complexities: { low: 2, medium: 2, high: 2 },
            modules: { analysis: 3, generator: 2, "test-manager": 6 },
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            fixtures: [
              { id: "generator-low", module: "generator", complexity: "low", label: "Generator Low", kind: "yalex", specPath: "fixtures/legacy/yalex/yalex_baja.yal", inputPath: null, hasInput: false },
            ],
          }),
          { status: 200 },
        ),
      );

    const user = userEvent.setup();
    render(<AppShell />);

    await user.click(screen.getByRole("button", { name: /generador lexico/i }));

    expect(screen.getByTestId("active-title")).toHaveTextContent("Generador lexico");
    expect(screen.getByRole("button", { name: /generar diagrama/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Abrir vista independiente" })).toHaveAttribute(
      "href",
      "../legacy/web/interfaz/lexical_generator/code.html",
    );
  });

  it("mounts the test case manager inside the shell", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            totalFixtures: 5,
            totalTestCases: 6,
            complexities: { low: 2, medium: 2, high: 2 },
            modules: { analysis: 3, generator: 2, "test-manager": 6 },
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            testCases: [
              {
                id: "rubric-low-valid",
                complexity: "low",
                label: "Low Valid",
                fixtureId: "analysis-low",
                specPath: "fixtures/legacy/yalex/yalex_baja.yal",
                inputPath: "fixtures/legacy/inputs/yalex_baja_input.txt",
                expectation: "accept",
                expectedTokens: ["IDENT"],
                expectedError: null,
              },
            ],
          }),
          { status: 200 },
        ),
      );

    const user = userEvent.setup();
    render(<AppShell />);

    await user.click(screen.getByRole("button", { name: /gestor de pruebas/i }));

    expect(screen.getByTestId("active-title")).toHaveTextContent("Gestor de pruebas");
    expect(await screen.findByText("Proyecto 01 UVG: Gestor de pruebas")).toBeInTheDocument();
  });
});
