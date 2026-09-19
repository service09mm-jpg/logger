import type { TargetPeriod } from "@/features/metrics";
import { addDays, fromIsoDate, isoWeekday, toIsoDate } from "./isoDate";
import type { IsoDate } from "./isoDate";

/** Відрізок днів, за який рахується прогрес. Обидві межі включно. */
export type PeriodBounds = {
  startIso: IsoDate;
  endIso: IsoDate;
};

/**
 * Межі періоду, в який потрапляє день `todayIso`.
 *
 * Два рішення, зафіксовані власником проєкту:
 * - тиждень починається в понеділок;
 * - рік календарний, з 1 січня, а не ковзний від створення метрики.
 */
export function getPeriodBounds(
  period: TargetPeriod,
  todayIso: IsoDate
): PeriodBounds {
  if (period === "DAY") {
    return { startIso: todayIso, endIso: todayIso };
  }

  if (period === "WEEK") {
    const daysSinceMonday = isoWeekday(todayIso) - 1;
    const monday = addDays(todayIso, -daysSinceMonday);
    return { startIso: monday, endIso: addDays(monday, 6) };
  }

  const date = fromIsoDate(todayIso);
  const year = date.getUTCFullYear();

  if (period === "MONTH") {
    const month = date.getUTCMonth();
    const firstDay = new Date(Date.UTC(year, month, 1));
    // Нульовий день наступного місяця — це останній день поточного,
    // і рахувати кількість днів у місяці вручну не треба.
    const lastDay = new Date(Date.UTC(year, month + 1, 0));
    return { startIso: toIsoDate(firstDay), endIso: toIsoDate(lastDay) };
  }

  return {
    startIso: toIsoDate(new Date(Date.UTC(year, 0, 1))),
    endIso: toIsoDate(new Date(Date.UTC(year, 11, 31))),
  };
}

/** Чи потрапляє день у відрізок. Межі включно. */
export function isWithinBounds(iso: IsoDate, bounds: PeriodBounds): boolean {
  return iso >= bounds.startIso && iso <= bounds.endIso;
}

/**
 * Останні `count` періодів, від найстарішого до поточного включно.
 * Це вісь X для графіка-стовпчиків: «скільки було кожного тижня».
 */
export function listRecentPeriods(
  period: TargetPeriod,
  todayIso: IsoDate,
  count: number
): PeriodBounds[] {
  const periods: PeriodBounds[] = [];

  for (let stepsBack = count - 1; stepsBack >= 0; stepsBack -= 1) {
    const dayInsidePeriod = shiftByPeriods(period, todayIso, stepsBack);
    periods.push(getPeriodBounds(period, dayInsidePeriod));
  }

  return periods;
}

/** День, який лежить на `stepsBack` періодів раніше за `todayIso`. */
function shiftByPeriods(
  period: TargetPeriod,
  todayIso: IsoDate,
  stepsBack: number
): IsoDate {
  if (period === "DAY") {
    return addDays(todayIso, -stepsBack);
  }
  if (period === "WEEK") {
    return addDays(todayIso, -7 * stepsBack);
  }

  const date = fromIsoDate(todayIso);
  const year = date.getUTCFullYear();

  if (period === "MONTH") {
    // Date.UTC сам переносить від'ємний номер місяця на попередній рік.
    return toIsoDate(new Date(Date.UTC(year, date.getUTCMonth() - stepsBack, 1)));
  }

  return toIsoDate(new Date(Date.UTC(year - stepsBack, 0, 1)));
}

/**
 * Найраніший день, який ще потрібен для поточних періодів усіх метрик.
 *
 * Головний екран показує метрики з різними періодами — денними, тижневими,
 * річними. Щоб дістати їхні записи одним запитом, треба знати найширшу межу.
 */
export function earliestPeriodStart(
  periods: readonly TargetPeriod[],
  todayIso: IsoDate
): IsoDate {
  let earliest = todayIso;

  for (const period of periods) {
    const { startIso } = getPeriodBounds(period, todayIso);
    if (startIso < earliest) {
      earliest = startIso;
    }
  }

  return earliest;
}
