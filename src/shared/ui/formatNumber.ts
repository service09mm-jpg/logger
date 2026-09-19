import type { Locale } from "@/shared/i18n";

/**
 * Число для показу: без «хвоста» з нулів, але з роздільником тисяч.
 *
 * Формат залежить від мови, тому функція приймає локаль явно, а не бере її з
 * оточення: на сервері й у браузері вона має дати однаковий рядок, інакше
 * React поскаржиться на розбіжність розмітки.
 */
export function formatNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === "uk" ? "uk-UA" : "en-GB", {
    maximumFractionDigits: 2,
  }).format(value);
}
