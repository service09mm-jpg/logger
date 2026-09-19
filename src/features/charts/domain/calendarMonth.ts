import { addDays, fromIsoDate, isoWeekday, toIsoDate } from "@/features/targets";
import type { IsoDate } from "@/features/targets";

/** Одна клітинка календаря — один день. */
export type CalendarCell = {
  iso: IsoDate;
  /** Дні сусідніх місяців потрібні лише щоб добити тиждень до семи клітинок. */
  inMonth: boolean;
  /** Агреговане значення за цей день, або `null` якщо записів не було. */
  value: number | null;
};

/** Тиждень — завжди рівно сім клітинок, від понеділка до неділі. */
export type CalendarWeek = readonly CalendarCell[];

/**
 * Сітка календаря на місяць, у який потрапляє `monthIso`.
 *
 * Перший тиждень добивається днями попереднього місяця, останній — наступного,
 * щоб кожен рядок мав сім клітинок і колонки збігались із днями тижня.
 */
export function buildCalendarMonth(
  monthIso: IsoDate,
  valueByDay: ReadonlyMap<IsoDate, number>
): CalendarWeek[] {
  const monthDate = fromIsoDate(monthIso);
  const year = monthDate.getUTCFullYear();
  const month = monthDate.getUTCMonth();

  const firstOfMonth = toIsoDate(new Date(Date.UTC(year, month, 1)));
  const lastOfMonth = toIsoDate(new Date(Date.UTC(year, month + 1, 0)));

  const gridStart = addDays(firstOfMonth, -(isoWeekday(firstOfMonth) - 1));
  const gridEnd = addDays(lastOfMonth, 7 - isoWeekday(lastOfMonth));

  const weeks: CalendarWeek[] = [];
  let cursor = gridStart;

  while (cursor <= gridEnd) {
    const week: CalendarCell[] = [];
    for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek += 1) {
      const value = valueByDay.get(cursor);
      week.push({
        iso: cursor,
        inMonth: cursor >= firstOfMonth && cursor <= lastOfMonth,
        value: value === undefined ? null : value,
      });
      cursor = addDays(cursor, 1);
    }
    weeks.push(week);
  }

  return weeks;
}

/** Найбільше значення в сітці — шкала для градієнта, коли цілі немає. */
export function maxValueInWeeks(weeks: readonly CalendarWeek[]): number {
  let max = 0;
  for (const week of weeks) {
    for (const cell of week) {
      if (cell.value !== null && cell.value > max) {
        max = cell.value;
      }
    }
  }
  return max;
}
