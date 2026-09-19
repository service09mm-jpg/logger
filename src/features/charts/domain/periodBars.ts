import type { Aggregation, Entry } from "@/features/metrics";
import { aggregateEntries, isWithinBounds } from "@/features/targets";
import type { PeriodBounds } from "@/features/targets";

export type PeriodBar = {
  bounds: PeriodBounds;
  /** Значення за період, або `null` якщо записів не було. */
  value: number | null;
};

/**
 * Стовпчик на період: скільки набралось кожного тижня (місяця, року).
 *
 * Значення періоду рахується тією самою агрегацією, що й на картці, а не
 * сумою денних підсумків: для AVG це різні числа.
 */
export function buildPeriodBars(
  periods: readonly PeriodBounds[],
  entries: readonly Entry[],
  aggregation: Aggregation
): PeriodBar[] {
  const bars: PeriodBar[] = [];

  for (const bounds of periods) {
    const entriesInPeriod: Entry[] = [];
    for (const entry of entries) {
      if (isWithinBounds(entry.localDate, bounds)) {
        entriesInPeriod.push(entry);
      }
    }
    bars.push({ bounds, value: aggregateEntries(entriesInPeriod, aggregation) });
  }

  return bars;
}

/** Найбільший стовпчик — шкала висоти, коли цілі немає. */
export function maxBarValue(bars: readonly PeriodBar[]): number {
  let max = 0;
  for (const bar of bars) {
    if (bar.value !== null && bar.value > max) {
      max = bar.value;
    }
  }
  return max;
}
