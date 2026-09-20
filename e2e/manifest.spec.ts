import { test, expect } from "@playwright/test";

// Манифест — єдине, що перетворює сайт на застосунок, який можна поставити на
// домашній екран. Помилка в ньому нічого не ламає в браузері, тому помітити її
// можна лише тут: сторінки працюватимуть як раніше, а встановлення просто
// перестане пропонуватись.

test("манифест віддається і просить режим застосунку", async ({ request }) => {
  const response = await request.get("/manifest.webmanifest");
  expect(response.status()).toBe(200);

  const manifest = await response.json();
  expect(manifest.display).toBe("standalone");
  expect(manifest.start_url).toBe("/");
  expect(manifest.icons.length).toBeGreaterThan(0);
});

test("іконки з манифеста існують", async ({ request }) => {
  for (const src of ["/icon-192.png", "/icon-512.png"]) {
    const response = await request.get(src);
    expect(response.status(), src).toBe(200);
    expect(response.headers()["content-type"]).toContain("image/png");
  }
});
