import { test, expect } from "@playwright/test";

// Гарячий шлях (створити метрику, залогувати значення) тут не перевіряється:
// він потребує бази, якої в CI немає. Ці тести перевіряють те, що можна
// перевірити без неї: незалогований юзер бачить лише вхід і реєстрацію.

test("незалогований юзер потрапляє на сторінку входу", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/login$/);
});

test("сторінка входу просить пошту й пароль", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByLabel("Пошта")).toBeVisible();
  await expect(page.getByLabel("Пароль")).toBeVisible();
  await expect(page.getByRole("button", { name: "Увійти" })).toBeVisible();
});

test("зі сторінки входу можна перейти до реєстрації", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("link", { name: "Зареєструватися" }).click();
  await expect(page).toHaveURL(/\/register$/);
  await expect(
    page.getByRole("button", { name: "Зареєструватися" })
  ).toBeVisible();
});
