import path from "node:path";

import { defineConfig, devices } from "@playwright/test";

const repoRoot = path.resolve(__dirname, "..");

export default defineConfig({
  testDir: path.join(__dirname, "e2e"),
  fullyParallel: false,
  reporter: [["list"], ["html", { outputFolder: path.join(repoRoot, "artifacts", "reports", "playwright-report") }]],
  outputDir: path.join(repoRoot, "artifacts", "reports", "playwright-results"),
  snapshotPathTemplate: "{testDir}/{testFilePath}-snapshots/{arg}{ext}",
  use: {
    baseURL: "http://127.0.0.1:3000",
    headless: true,
    viewport: { width: 1440, height: 1080 },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: [
    {
      command: "python -m laboratorio.cli.serve",
      cwd: repoRoot,
      env: {
        ...process.env,
        PYTHONPATH: "backend/src",
        LABORATORIO_API_HOST: "127.0.0.1",
        LABORATORIO_API_PORT: "8000",
      },
      url: "http://127.0.0.1:8000/api/health",
      reuseExistingServer: true,
      timeout: 120_000,
    },
    {
      command: "npm run dev -- --hostname 127.0.0.1 --port 3000",
      cwd: __dirname,
      env: {
        ...process.env,
        BACKEND_API_ORIGIN: "http://127.0.0.1:8000",
      },
      url: "http://127.0.0.1:3000",
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
