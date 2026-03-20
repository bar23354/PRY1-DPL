import { expect, test } from "@playwright/test";

test("runs single and bulk executions from the test manager", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /test case manager/i }).click();

  await expect(page.getByTestId("active-title")).toHaveText("Test Case Manager");
  await expect(page.getByRole("heading", { name: "UVG Project 01: Test Case Manager" })).toBeVisible();

  await page.getByRole("button", { name: /run case low valid input/i }).click();
  await expect(page.getByText("Passed", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: /run all tests/i }).click();
  await expect(page.getByText("100.0%")).toBeVisible();

  await expect(page).toHaveScreenshot("test-manager-results.png", { fullPage: true });
});
