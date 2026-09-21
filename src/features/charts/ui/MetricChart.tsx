import { getChartShape } from "@/features/metrics";
import type { Entry, Metric } from "@/features/metrics";
import { listRecentPeriods } from "@/features/targets";
import type { IsoDate } from "@/features/targets";
import type { Dictionary, Locale } from "@/shared/i18n";
import { buildCalendarMonth, maxValueInWeeks } from "../domain/calendarMonth";
import { buildDailyValues, toSortedPoints } from "../domain/dailyValues";
import { buildLineGeometry } from "../domain/lineGeometry";
import { buildPeriodBars, maxBarValue } from "../domain/periodBars";
import { BarChart } from "./BarChart";
import { CalendarChart } from "./CalendarChart";
import { LineChart } from "./LineChart";

/** Скільки періодів показувати на графіку-стовпчиках. */
const BAR_COUNT = 8;

/**
 * Графік метрики. Форму обирає не викликач, а сама фіча — вона виводиться з
 * агрегації й періоду цілі (див. `getChartShape`).
 *
 * Серверний компонент: тут лише обчислення й розмітка, жодної взаємодії.
 */
export function MetricChart({
  metric,
  entries,
  todayIso,
  dict,
  locale,
}: {
  metric: Metric;
  entries: Entry[];
  todayIso: IsoDate;
  dict: Dictionary;
  locale: Locale;
}): React.ReactElement {
  const shape = getChartShape(metric.aggregation, metric.targetPeriod);
  const valueByDay = buildDailyValues(entries, metric.aggregation);

  if (shape === "LINE") {
    const geometry = buildLineGeometry(toSortedPoints(valueByDay), {
      width: 300,
      height: 120,
      targetValue: metric.targetValue,
    });
    return (
      <LineChart
        geometry={geometry}
        color={metric.color}
        emptyLabel={dict.metric.chartEmpty}
      />
    );
  }

  if (shape === "BARS") {
    const bars = buildPeriodBars(
      listRecentPeriods(metric.targetPeriod, todayIso, BAR_COUNT),
      entries,
      metric.aggregation
    );
    const scaleMax = metric.targetValue ?? maxBarValue(bars);
    return (
      <BarChart
        bars={bars}
        color={metric.color}
        scaleMax={scaleMax}
        locale={locale}
        emptyLabel={dict.metric.chartEmpty}
      />
    );
  }

  const weeks = buildCalendarMonth(todayIso, valueByDay);
  const scaleMax = metric.targetValue ?? maxValueInWeeks(weeks);
  return (
    <CalendarChart
      weeks={weeks}
      monthIso={todayIso}
      scaleMax={scaleMax}
      dict={dict}
      locale={locale}
    />
  );
}
