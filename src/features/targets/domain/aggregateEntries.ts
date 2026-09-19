import type { Aggregation, Entry } from "@/features/metrics";

/**
 * Зводить кілька записів в одне число — те, що видно на картці.
 *
 * Порожній список дає `null`, а не нуль: «записів немає» і «залоговано нуль» —
 * це різні стани, і картка показує їх по-різному.
 *
 * Порядок записів у списку значення не має: LAST сам шукає найпізніший `at`.
 */
export function aggregateEntries(
  entries: readonly Entry[],
  aggregation: Aggregation
): number | null {
  if (entries.length === 0) {
    return null;
  }

  if (aggregation === "COUNT") {
    return entries.length;
  }

  if (aggregation === "LAST") {
    let latest = entries[0];
    for (const entry of entries) {
      if (entry.at.getTime() >= latest.at.getTime()) {
        latest = entry;
      }
    }
    return latest.value;
  }

  let total = 0;
  for (const entry of entries) {
    total += entry.value;
  }

  if (aggregation === "AVG") {
    return total / entries.length;
  }

  return total;
}
