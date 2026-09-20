import type { Aggregation, Entry } from "@/features/metrics";
import { aggregateEntries } from "@/features/targets";
import type { IsoDate } from "@/features/targets";

/**
 * Значення по днях: у кожному дні кілька записів зводяться в одне число тією
 * самою агрегацією, що й на картці.
 *
 * Це спільна заготовка і для календаря, і для лінії: обом потрібно «одне
 * число на день», і рахувати його двічі по-різному було б помилкою.
 */
export function buildDailyValues(
  entries: readonly Entry[],
  aggregation: Aggregation
): Map<IsoDate, number> {
  const entriesByDay = new Map<IsoDate, Entry[]>();

  for (const entry of entries) {
    const sameDay = entriesByDay.get(entry.localDate);
    if (sameDay === undefined) {
      entriesByDay.set(entry.localDate, [entry]);
    } else {
      sameDay.push(entry);
    }
  }

  const valueByDay = new Map<IsoDate, number>();
  for (const [day, dayEntries] of entriesByDay) {
    const value = aggregateEntries(dayEntries, aggregation);
    if (value !== null) {
      valueByDay.set(day, value);
    }
  }

  return valueByDay;
}

/** Ті самі значення, але списком і по порядку — вісь X лінійного графіка. */
export function toSortedPoints(
  valueByDay: ReadonlyMap<IsoDate, number>
): { iso: IsoDate; value: number }[] {
  const points: { iso: IsoDate; value: number }[] = [];
  for (const [iso, value] of valueByDay) {
    points.push({ iso, value });
  }
  points.sort((left, right) => (left.iso < right.iso ? -1 : 1));
  return points;
}
