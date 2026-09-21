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

/**
 * Число, яке має влізти в клітинку календаря: 1750 → «1,8к».
 *
 * Звичайне форматування тут не годиться — «1 750» у клітинку завширшки з
 * палець не поміщається. Скорочення від Intl (`notation: "compact"`) теж:
 * українською воно дає «1,8 тис.», що довше за саме число.
 *
 * Суфікс приходить зі словника, бо «к» і «k» — різні літери.
 */
export function formatCompactNumber(
  value: number,
  locale: Locale,
  thousandsSuffix: string
): string {
  if (Math.abs(value) < 1000) {
    return formatNumber(value, locale);
  }

  const thousands = value / 1000;
  // До десяти тисяч десята частка ще щось означає, далі — ні.
  const rounded =
    Math.abs(thousands) < 10 ? Math.round(thousands * 10) / 10 : Math.round(thousands);

  return formatNumber(rounded, locale) + thousandsSuffix;
}
