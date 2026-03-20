import { expect, test } from "@playwright/test";

const RUBRIC_CASES = [
  "Entrada valida de baja",
  "Entrada invalida de baja",
  "Entrada valida modificada de baja",
  "Entrada invalida modificada de baja",
  "Entrada valida de media",
  "Entrada invalida de media",
  "Entrada valida modificada de media",
  "Entrada invalida modificada de media",
  "Entrada valida de alta",
  "Entrada invalida de alta",
  "Entrada valida modificada de alta",
  "Entrada invalida modificada de alta",
] as const;

test("runs single and bulk executions from the test manager", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /gestor de pruebas/i }).click();

  await expect(page.getByTestId("active-title")).toHaveText("Gestor de pruebas");
  await expect(page.getByRole("heading", { name: "Proyecto 01 UVG: Gestor de pruebas" })).toBeVisible();

  await page.getByRole("button", { name: /ejecutar caso entrada valida de baja/i }).click();
  await expect(page.getByText("Aprobado", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: /ejecutar todas las pruebas/i }).click();
  await expect(page.getByText("100.0%")).toBeVisible();

  await expect(page).toHaveScreenshot("test-manager-results.png", { fullPage: true });
});

test("covers all rubric cases through the integrated test manager", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /gestor de pruebas/i }).click();

  await page.getByRole("button", { name: /ejecutar todas las pruebas/i }).click();
  await expect(page.getByText("100.0%")).toBeVisible();

  for (const caseLabel of RUBRIC_CASES) {
    const row = page.locator("tr").filter({ hasText: caseLabel });
    await expect(row).toContainText("Aprobado");
  }
});
