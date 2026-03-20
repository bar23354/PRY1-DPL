import path from "node:path";

import { expect, test } from "@playwright/test";

const repoRoot = path.resolve(__dirname, "..", "..");
const lowInvalidInput = path.join(repoRoot, "fixtures", "legacy", "inputs", "yalex_baja_invalid_input.txt");

test("runs lexical analysis with valid and invalid inputs", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /analisis lexico/i }).click();

  await expect(page.getByTestId("active-title")).toHaveText("Analisis lexico");
  await page.getByRole("button", { name: /^Baja$/i }).click();
  await page.getByRole("button", { name: /ejecutar analisis/i }).click();

  await expect(page.locator("tbody").getByText("IDENT", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("No se reportaron errores lexicos en la ultima ejecucion.")).toBeVisible();

  await page.locator('input[aria-label="Cargar archivo"]').setInputFiles(lowInvalidInput);
  await page.getByRole("button", { name: /ejecutar analisis/i }).click();

  await expect(page.getByText(/No se pudo tokenizar/)).toBeVisible();
  await expect(page).toHaveScreenshot("analysis-results.png", { fullPage: true });
});

test("compiles generator source, handles invalid source and downloads the lexer", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /generador lexico/i }).click();

  await expect(page.getByTestId("active-title")).toHaveText("Generador lexico");
  await page.getByRole("button", { name: /generar diagrama/i }).click();
  await expect(page.getByTestId("generator-graph")).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /descargar lexer/i }).click();
  const download = await downloadPromise;
  await expect(download.suggestedFilename()).toBe("lexer_generado.py");

  await page.getByLabel("Fuente YALex").fill("let digit = ['0'-'9']");
  await page.getByRole("button", { name: /generar diagrama/i }).click();
  await expect(page.getByText("No se encontro una seccion rule.")).toBeVisible();

  await expect(page).toHaveScreenshot("generator-results.png", { fullPage: true });
});
