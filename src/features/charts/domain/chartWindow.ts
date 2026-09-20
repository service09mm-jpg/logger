import { getChartShape } from "@/features/metrics";
import type { Aggregation, TargetPeriod } from "@/features/metrics";
import { addDays, getPeriodBounds, listRecentPeriods } from "@/features/targets";
import type { IsoDate, PeriodBounds } from "@/features/targets";

/** Скільки днів показує лінійний графік. */
const LINE_DAYS = 90;
/** Скільки періодів показує графік-стовпчики. */
const BAR_PERIODS = 8;

/**
 * За який проміжок тягнути записи для графіка.
 *
 * Кожна форма графіка потребує свого вікна, і знати його треба ще до запиту в
 * базу — інакше довелось би тягнути всю історію й відкидати зайве.
 */
export function getChartWindow(
  metric: { aggregation: Aggregation; targetPeriod: TargetPeriod },
  todayIso: IsoDate
): PeriodBounds {
  const shape = getChartShape(metric.aggregation, metric.targetPeriod);

  if (shape === "LINE") {
    return { startIso: addDays(todayIso, -LINE_DAYS), endIso: todayIso };
  }

  if (shape === "BARS") {
    const periods = listRecentPeriods(
      metric.targetPeriod,
      todayIso,
      BAR_PERIODS
    );
    return { startIso: periods[0].startIso, endIso: todayIso };
  }

  return getPeriodBounds("MONTH", todayIso);
}
