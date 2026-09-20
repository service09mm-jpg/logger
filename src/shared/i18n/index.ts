import { en } from "./en";
import { uk } from "./uk";
import type { Dictionary, Locale } from "./dictionary";

export { DEFAULT_LOCALE, isLocale } from "./dictionary";
export type { Dictionary, Locale } from "./dictionary";

/** Словник для мови. Інших способів дістати рядок інтерфейсу немає. */
export function getDictionary(locale: Locale): Dictionary {
  if (locale === "en") {
    return en;
  }
  return uk;
}

/**
 * Підставляє значення в рядок словника: `fillTemplate(dict.auth.weakPassword,
 * { min: 8 })`. Зроблено найпростішим способом — заміною `{ключ}` на значення.
 */
export function fillTemplate(
  template: string,
  values: Record<string, string | number>
): string {
  let result = template;
  for (const [key, value] of Object.entries(values)) {
    result = result.replaceAll(`{${key}}`, String(value));
  }
  return result;
}
