import { useEffect, useState } from "react";

import { fetchJson } from "../../lib/api";
import type { DashboardSummary } from "../../types/dashboard";

interface DashboardSummaryResponse extends DashboardSummary {}

export function useDashboardSummary() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSummary() {
      try {
        const payload = await fetchJson<DashboardSummaryResponse>("/api/dashboard/summary");
        if (!cancelled) {
          setSummary(payload);
          setError(null);
        }
      } catch (caughtError) {
        if (!cancelled) {
          setSummary(null);
          setError(caughtError instanceof Error ? caughtError.message : "Unknown dashboard error");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadSummary();

    return () => {
      cancelled = true;
    };
  }, []);

  return { summary, loading, error };
}
