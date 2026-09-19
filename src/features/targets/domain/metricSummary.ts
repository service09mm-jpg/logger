import type { Entry, Metric } from "@/features/metrics";
import { aggregateEntries } from "./aggregateEntries";
import type { IsoDate } from "./isoDate";
import { getPeriodBounds, isWithinBounds } from "./periodBounds";
import type { PeriodBounds } from "./periodBounds";
import { calculateProgress } from "./progress";
import type { TargetProgress } from "./progress";

/** Усе, що картка метрики показує на головному екрані. */
export type MetricSummary = {
  metric: Metric;
  /** Поточне значення за період, або `null` якщо записів не було. */
  current: number | null;
  /** Скільки записів дали це значення. Потрібне для оптимістичного оновлення. */
  entryCount: number;
  bounds: PeriodBounds;
  /**
   * Прогрес до цілі. `null`, якщо цілі немає або якщо метрика з агрегацією
   * LAST: для ваги стану «виконано / не виконано» не існує, ціль для неї —
   * просто лінія на графіку.
   */
  progress: TargetProgress | null;
};

/**
 * Зводить метрику та її записи до одного стану.
 *
 * Метрики з LAST періоду не мають: на картці показується останнє відоме
 * значення, навіть якщо його залоговано позавчора. Тому для них записи не
 * фільтруються за межами періоду — викликач передає стільки, скільки має.
 */
export function summarizeMetric(
  metric: Metric,
  entries: readonly Entry[],
  todayIso: IsoDate,
): MetricSummary {
  const bounds = getPeriodBounds(metric.targetPeriod, todayIso);

  const relevantEntries: Entry[] = [];
  for (const entry of entries) {
    if (entry.metricId !== metric.id) {
      continue;
    }
    if (
      metric.aggregation !== "LAST" &&
      !isWithinBounds(entry.localDate, bounds)
    ) {
      continue;
    }
    relevantEntries.push(entry);
  }

  const current = aggregateEntries(relevantEntries, metric.aggregation);

  if (metric.targetValue === null || metric.aggregation === "LAST") {
    return {
      metric,
      current,
      entryCount: relevantEntries.length,
      bounds,
      progress: null,
    };
  }

  return {
    metric,
    current,
    entryCount: relevantEntries.length,
    bounds,
    progress: calculateProgress({
      current,
      targetValue: metric.targetValue,
      targetDirection: metric.targetDirection,
    }),
  };
}

/**
 * Як виглядатиме картка, якщо просто зараз додати запис зі значенням `value`.
 *
 * Це та сама арифметика, що й на сервері, але виконана в браузері до того, як
 * запит долетить: значення на картці оновлюється миттєво, а справжній
 * результат приходить наступним рендером. Якщо запит впаде, стан просто
 * відкотиться до серверного.
 */
export function applyOptimisticEntry(
  summary: MetricSummary,
  value: number,
): MetricSummary {
  const { metric, current, entryCount } = summary;
  const nextCount = entryCount + 1;
  const nextCurrent = nextValue(metric.aggregation, current, entryCount, value);

  if (metric.targetValue === null || metric.aggregation === "LAST") {
    return { ...summary, current: nextCurrent, entryCount: nextCount };
  }

  return {
    ...summary,
    current: nextCurrent,
    entryCount: nextCount,
    progress: calculateProgress({
      current: nextCurrent,
      targetValue: metric.targetValue,
      targetDirection: metric.targetDirection,
    }),
  };
}

function nextValue(
  aggregation: Metric["aggregation"],
  current: number | null,
  entryCount: number,
  value: number,
): number {
  if (aggregation === "LAST") {
    return value;
  }
  if (aggregation === "COUNT") {
    return entryCount + 1;
  }
  if (aggregation === "AVG") {
    const total = (current ?? 0) * entryCount + value;
    return total / (entryCount + 1);
  }
  return (current ?? 0) + value;
}
