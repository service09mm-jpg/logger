import { uk } from "./uk";

/** Мова інтерфейсу. Ті самі значення лежать в енумі `Locale` у Prisma. */
export type Locale = "uk" | "en";

/**
 * Форма словника виводиться з українського — він джерело правди.
 * Англійський оголошений цим типом, тому розходження ключів ламає збірку.
 */
export type Dictionary = typeof uk;

export const DEFAULT_LOCALE: Locale = "uk";

/** Чи це мова, яку ми підтримуємо — перевірка для значень з браузера. */
export function isLocale(value: string): value is Locale {
  return value === "uk" || value === "en";
}
