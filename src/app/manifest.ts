import type { MetadataRoute } from "next";

/**
 * Манифест застосунку.
 *
 * Next.js віддає цей файл як `/manifest.webmanifest` і сам додає на нього
 * посилання в `<head>`. Браузер читає його, коли юзер додає сторінку на
 * домашній екран: звідти він бере назву, іконку й те, у якому вигляді
 * відкривати.
 *
 * `display: "standalone"` — головне тут: застосунок відкривається власним
 * вікном без адресного рядка й вкладок, а в списку запущених програм стає
 * окремою карткою. Для встановлення більше нічого не треба — лише манифест
 * і HTTPS, який на Vercel є завжди.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Logger",
    short_name: "Logger",
    description: "Трекер довільних метрик",
    start_url: "/",
    display: "standalone",
    // Колір, яким система заливає екран, поки застосунок ще не намалювався.
    // Темний, як `--background` у темній темі: світлий спалах на пів секунди
    // помітніший за темний.
    background_color: "#09090b",
    theme_color: "#18181b",
    // Один файл записаний двічі з різним призначенням. `any` — звичайна
    // іконка, `maskable` — дозвіл системі обрізати її під свою форму (коло,
    // квадрат зі скругленням). Знак навмисно малий і лежить у центрі, тож
    // обрізання країв його не зачепить.
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
