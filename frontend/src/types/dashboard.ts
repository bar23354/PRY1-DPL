export interface DashboardSummary {
  totalFixtures: number;
  totalTestCases: number;
  complexities: {
    low: number;
    medium: number;
    high: number;
  };
  modules: {
    analysis: number;
    generator: number;
    "test-manager": number;
  };
}
