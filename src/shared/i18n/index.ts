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
