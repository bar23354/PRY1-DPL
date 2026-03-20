import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AppShell } from "./app-shell";


describe("AppShell", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the dashboard as the default active module", () => {
    render(<AppShell />);

    expect(screen.getByRole("heading", { name: "Proyecto 01 - Interfaz Integrada" })).toBeInTheDocument();
    expect(screen.getByTestId("active-title")).toHaveTextContent("Dashboard General");
    expect(screen.queryByTitle("Interfaz de modulo")).not.toBeInTheDocument();
  });

  it("switches the active module without using an iframe", async () => {
    const user = userEvent.setup();
    render(<AppShell />);

    await user.click(screen.getByRole("button", { name: /lexical generator/i }));

    expect(screen.getByTestId("active-title")).toHaveTextContent("Lexical Generator");
    expect(screen.getByRole("button", { name: /generate diagram/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Abrir vista independiente" })).toHaveAttribute(
      "href",
      "../legacy/web/interfaz/lexical_generator/code.html",
    );
  });

  it("mounts the test case manager inside the shell", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
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

    await user.click(screen.getByRole("button", { name: /test case manager/i }));

    expect(screen.getByTestId("active-title")).toHaveTextContent("Test Case Manager");
    expect(await screen.findByText("UVG Project 01: Test Case Manager")).toBeInTheDocument();
  });
});
