import { METRIC_TEMPLATES } from "./metricTemplates";
import type {
  Aggregation,
  TargetDirection,
  TargetPeriod,
} from "./metricTypes";

// Значення з форм приходять рядками, і вірити їм не можна: форму можна
// підмінити. Ці перевірки — межа, за якою рядок стає типізованим значенням.

const AGGREGATIONS: Aggregation[] = ["SUM", "AVG", "LAST", "COUNT"];
const TARGET_DIRECTIONS: TargetDirection[] = ["AT_LEAST", "AT_MOST"];
const TARGET_PERIODS: TargetPeriod[] = ["DAY", "WEEK", "MONTH", "YEAR"];

export function isAggregation(value: string): value is Aggregation {
  return AGGREGATIONS.includes(value as Aggregation);
}

export function isTargetDirection(value: string): value is TargetDirection {
  return TARGET_DIRECTIONS.includes(value as TargetDirection);
}

export function isTargetPeriod(value: string): value is TargetPeriod {
  return TARGET_PERIODS.includes(value as TargetPeriod);
}

export function listAggregations(): Aggregation[] {
  return [...AGGREGATIONS];
}

export function listTargetDirections(): TargetDirection[] {
  return [...TARGET_DIRECTIONS];
}

export function listTargetPeriods(): TargetPeriod[] {
  return [...TARGET_PERIODS];
}

/** Усі id шаблонів — потрібні галереї, щоб пройтись по них у потрібному порядку. */
export function listTemplateIds(): string[] {
  const ids: string[] = [];
  for (const template of METRIC_TEMPLATES) {
    ids.push(template.id);
  }
  return ids;
}
