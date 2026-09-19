import type { Locale } from "@/shared/i18n";

function intlLocale(locale: Locale): string {
  return locale === "uk" ? "uk-UA" : "en-GB";
}

/**
 * День у вигляді «19 вер.».
 *
 * `timeZone: "UTC"` стоїть не для краси: день уже порахований у таймзоні
 * юзера й записаний рядком, тож форматувальник не має права зсувати його ще
 * раз. Інакше сервер і браузер намалювали б різні дати й React поскаржився б
 * на розбіжність розмітки.
 */
export function formatIsoDate(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00.000Z`));
}

/** Місяць і рік для заголовка календаря. */
export function formatIsoMonth(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00.000Z`));
}

/**
 * Час запису — за годинником юзера.
 *
 * Таймзона передається явно (її надсилає браузер і зберігає кука), тому
 * сервер і браузер форматують однаково. Це не дрібниця: якби сервер брав
 * власну таймзону, розмітка двох сторін розійшлась би, і React поскаржився б
 * на невідповідність.
 */
export function formatTimeOfDay(
  at: Date,
  locale: Locale,
  timeZone: string
): string {
  try {
    return new Intl.DateTimeFormat(intlLocale(locale), {
      hour: "2-digit",
      minute: "2-digit",
      timeZone,
    }).format(at);
  } catch {
    return "";
  }
}
