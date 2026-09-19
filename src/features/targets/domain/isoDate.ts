/**
 * Календарний день як рядок "YYYY-MM-DD".
 *
 * Чому рядок, а не `Date`: `Date` завжди тягне за собою час і таймзону, і
 * порівняння двох таких «днів» починає залежати від того, на якому сервері
 * виконується код. Рядок такої проблеми не має — два дні рівні тоді й лише
 * тоді, коли рівні рядки, а сортування збігається зі звичайним алфавітним.
 *
 * День юзера рахує браузер (він єдиний знає таймзону) і надсилає готовим.
 */
export type IsoDate = string;

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Чи це справді день у форматі YYYY-MM-DD. Перевіряється не лише форма, а й
 * існування дати: "2026-02-30" має форму, але такого дня немає.
 */
export function isIsoDate(value: string): boolean {
  if (!ISO_DATE_PATTERN.test(value)) {
    return false;
  }
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    return false;
  }
  return toIsoDate(parsed) === value;
}

/**
 * День з `Date`, прочитаний в UTC.
 *
 * Саме UTC, бо сюди потрапляють значення колонки типу DATE — Prisma віддає їх
 * як опівніч UTC. Для `new Date()` на сервері ця функція не призначена:
 * серверна таймзона не має стосунку до дня юзера.
 */
export function toIsoDate(date: Date): IsoDate {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  return `${pad(year, 4)}-${pad(month, 2)}-${pad(day, 2)}`;
}

/** Опівніч UTC цього дня — значення, яке лягає в колонку типу DATE. */
export function fromIsoDate(iso: IsoDate): Date {
  return new Date(`${iso}T00:00:00.000Z`);
}

/** Той самий день плюс-мінус кілька днів. Перехід через місяць і рік враховано. */
export function addDays(iso: IsoDate, days: number): IsoDate {
  const date = fromIsoDate(iso);
  date.setUTCDate(date.getUTCDate() + days);
  return toIsoDate(date);
}

/** Скільки цілих днів між двома днями: `to` мінус `from`. */
export function daysBetween(from: IsoDate, to: IsoDate): number {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const difference = fromIsoDate(to).getTime() - fromIsoDate(from).getTime();
  return Math.round(difference / millisecondsPerDay);
}

/**
 * День тижня: 1 — понеділок, 7 — неділя.
 *
 * Не збігається з `Date.getUTCDay()`, де тиждень починається з неділі й вона
 * має номер 0. Тиждень у цьому застосунку починається з понеділка.
 */
export function isoWeekday(iso: IsoDate): number {
  const sundayBasedDay = fromIsoDate(iso).getUTCDay();
  if (sundayBasedDay === 0) {
    return 7;
  }
  return sundayBasedDay;
}

function pad(value: number, length: number): string {
  return String(value).padStart(length, "0");
}

/**
 * Який сьогодні день у вказаній таймзоні.
 *
 * Сервер не знає таймзони юзера — її надсилає браузер, і саме від неї
 * залежить, який день вважати сьогоднішнім. Невідома чи зіпсована назва
 * таймзони не має ламати сторінку, тому такий випадок відкочується на UTC.
 *
 * Локаль "en-CA" обрана не випадково: вона форматує дату як YYYY-MM-DD.
 */
export function todayIsoInTimeZone(now: Date, timeZone: string): IsoDate {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(now);
  } catch {
    return toIsoDate(
      new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
      )
    );
  }
}

/**
 * Полудень UTC цього дня.
 *
 * Використовується як момент `at` для записів заднім числом: конкретної
 * години юзер не називав, а полудень гарантовано лежить всередині доби в
 * будь-якій таймзоні, тож запис не «переповзе» на сусідній день.
 */
export function middayOf(iso: IsoDate): Date {
  return new Date(`${iso}T12:00:00.000Z`);
}
