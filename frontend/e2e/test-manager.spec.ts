import { expect, test } from "@playwright/test";

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
