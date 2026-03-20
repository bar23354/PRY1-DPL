import path from "node:path";

import { expect, test } from "@playwright/test";

const repoRoot = path.resolve(__dirname, "..", "..");
const lowInvalidInput = path.join(repoRoot, "fixtures", "legacy", "inputs", "yalex_baja_invalid_input.txt");

test("runs lexical analysis with valid and invalid inputs", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /lexical analysis/i }).click();

  await expect(page.getByTestId("active-title")).toHaveText("Lexical Analysis");
  await page.getByRole("button", { name: "Low" }).click();
  await page.getByRole("button", { name: /run analysis/i }).click();

  await expect(page.locator("tbody").getByText("IDENT", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("No lexical errors reported for the latest analysis run.")).toBeVisible();

  await page.locator('input[aria-label="Load file"]').setInputFiles(lowInvalidInput);
  await page.getByRole("button", { name: /run analysis/i }).click();

  await expect(page.getByText(/No se pudo tokenizar/)).toBeVisible();
  await expect(page).toHaveScreenshot("analysis-results.png", { fullPage: true });
});

test("compiles generator source, handles invalid source and downloads the lexer", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /lexical generator/i }).click();

  await expect(page.getByTestId("active-title")).toHaveText("Lexical Generator");
  await page.getByRole("button", { name: /generate diagram/i }).click();
  await expect(page.getByTestId("generator-graph")).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /download lexer/i }).click();
  const download = await downloadPromise;
  await expect(download.suggestedFilename()).toBe("thelexer.py");

  await page.getByLabel("YALex source").fill("let digit = ['0'-'9']");
  await page.getByRole("button", { name: /generate diagram/i }).click();
  await expect(page.getByText("No se encontro una seccion rule.")).toBeVisible();

  await expect(page).toHaveScreenshot("generator-results.png", { fullPage: true });
});
