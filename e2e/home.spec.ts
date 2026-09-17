import { test, expect } from "@playwright/test";

test("home page loads and shows getting-started heading", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByText(/to get started, edit the/i)
  ).toBeVisible();
});
