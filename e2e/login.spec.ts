import { test, expect } from "@playwright/test";

// Гарячий шлях (створити метрику, залогувати значення) тут не перевіряється:
// він потребує і бази, і входу через Google, а в CI немає ні того, ні іншого.
// Ці два тести перевіряють те, що можна перевірити без бази: незалогований
// юзер не бачить нічого, крім входу.

test("незалогований юзер потрапляє на сторінку входу", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/login$/);
});

test("сторінка входу пропонує вхід через Google", async ({ page }) => {
  await page.goto("/login");
  await expect(
    page.getByRole("button", { name: "Увійти через Google" })
  ).toBeVisible();
});
