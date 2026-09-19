// Публічний API фічі «цілі та прогрес». Усе, що інші фічі мають право брати
// звідси, перелічено тут; глибші шляхи заборонені лінтером.
//
// Ця фіча складається з самого лише domain/: у неї немає ні запитів до бази,
// ні компонентів — тільки обчислення над простими типами.

export { aggregateEntries } from "./domain/aggregateEntries";
export {
  addDays,
  daysBetween,
  fromIsoDate,
  isIsoDate,
  isoWeekday,
  middayOf,
  toIsoDate,
  todayIsoInTimeZone,
} from "./domain/isoDate";
export type { IsoDate } from "./domain/isoDate";
export {
  applyOptimisticEntry,
  summarizeMetric,
} from "./domain/metricSummary";
export type { MetricSummary } from "./domain/metricSummary";
export {
  earliestPeriodStart,
  getPeriodBounds,
  isWithinBounds,
  listRecentPeriods,
} from "./domain/periodBounds";
export type { PeriodBounds } from "./domain/periodBounds";
export { calculateProgress } from "./domain/progress";
export type { TargetProgress } from "./domain/progress";
