import { renderHook, waitFor } from "@testing-library/react";

import { useDashboardSummary } from "./use-dashboard-summary";

describe("useDashboardSummary", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("loads dashboard summary data", async () => {
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

    const { result } = renderHook(() => useDashboardSummary());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeNull();
    expect(result.current.summary?.totalFixtures).toBe(5);
    expect(result.current.summary?.modules.analysis).toBe(3);
  });

  it("captures loading errors", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ error: { message: "Summary failed" } }), { status: 500 }),
    );

    const { result } = renderHook(() => useDashboardSummary());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.summary).toBeNull();
    expect(result.current.error).toBe("Summary failed");
  });
});
