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

    expect(await screen.findByText("UVG Project 01: Dashboard")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("6 total")).toBeInTheDocument();
    expect(screen.getAllByText("6").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("analysis")).toBeInTheDocument();
    expect(screen.getByText("generator")).toBeInTheDocument();
    expect(screen.getByText("test-manager")).toBeInTheDocument();
    expect(screen.getByText("Low")).toBeInTheDocument();
    expect(screen.getAllByText("2").length).toBeGreaterThanOrEqual(3);
  });

  it("renders an error state when summary loading fails", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ error: { message: "Backend unavailable" } }), { status: 503 }),
    );

    render(<Dashboard />);

    await waitFor(() => expect(screen.getByText("Dashboard data unavailable.")).toBeInTheDocument());
    expect(screen.getByText("Backend unavailable")).toBeInTheDocument();
  });
});
