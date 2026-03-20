import { expect, test } from "@playwright/test";

test("renders the integrated shell with dashboard summary and no iframe", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Proyecto 01 - Interfaz Integrada" })).toBeVisible();
  await expect(page.getByTestId("active-title")).toHaveText("Panel general");
  await expect(page.getByRole("heading", { name: "Proyecto 01 UVG: Panel general" })).toBeVisible();
  await expect(page.locator("iframe")).toHaveCount(0);

  await expect(page).toHaveScreenshot("dashboard-home.png", { fullPage: true });
});
