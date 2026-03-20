import { render, screen, waitFor } from "@testing-library/react";

import { Dashboard } from "./dashboard";

describe("Dashboard", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders summary data from the backend", async () => {
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

    render(<Dashboard />);

    expect(await screen.findByText("Proyecto 01 UVG: Panel general")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("6 totales")).toBeInTheDocument();
    expect(screen.getAllByText("6").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("Analisis lexico")).toBeInTheDocument();
    expect(screen.getByText("Generador lexico")).toBeInTheDocument();
    expect(screen.getByText("Gestor de pruebas")).toBeInTheDocument();
    expect(screen.getByText("Baja")).toBeInTheDocument();
    expect(screen.getAllByText("2").length).toBeGreaterThanOrEqual(3);
  });

  it("renders an error state when summary loading fails", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ error: { message: "Backend unavailable" } }), { status: 503 }),
    );

    render(<Dashboard />);

    await waitFor(() => expect(screen.getByText("No se pudieron cargar los datos del panel general.")).toBeInTheDocument());
    expect(screen.getByText("Backend unavailable")).toBeInTheDocument();
  });
});
