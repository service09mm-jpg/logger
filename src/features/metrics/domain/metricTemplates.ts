import { METRIC_COLORS } from "./metricColors";
import type {
  Aggregation,
  TargetDirection,
  TargetPeriod,
} from "./metricTypes";

/**
 * Галерея шаблонів: створення метрики в один тап.
 *
 * Тут немає ні назви, ні одиниці виміру — вони різні для uk та en і живуть у
 * словнику `shared/i18n`. Шаблон тримає лише те, що від мови не залежить:
 * правило агрегації, період цілі та її орієнтовне значення.
 */
export type MetricTemplateId =
  | "weight"
  | "calories"
  | "water"
  | "coffee"
  | "sleep"
  | "workout"
  | "steps"
  | "reading";

export type MetricTemplate = {
  id: MetricTemplateId;
  aggregation: Aggregation;
  targetPeriod: TargetPeriod;
  targetDirection: TargetDirection;
  /** Значення, яке підставиться в поле цілі. `null` — ціль лишається порожньою. */
  suggestedTarget: number | null;
  color: string;
};

export const METRIC_TEMPLATES: readonly MetricTemplate[] = [
  {
    id: "weight",
    aggregation: "LAST",
    targetPeriod: "DAY",
    targetDirection: "AT_MOST",
    suggestedTarget: null,
    color: METRIC_COLORS[0],
  },
  {
    id: "calories",
    aggregation: "SUM",
    targetPeriod: "DAY",
    targetDirection: "AT_MOST",
    suggestedTarget: 2000,
    color: METRIC_COLORS[1],
  },
  {
    id: "water",
    aggregation: "SUM",
    targetPeriod: "DAY",
    targetDirection: "AT_LEAST",
    suggestedTarget: 2000,
    color: METRIC_COLORS[6],
  },
  {
    id: "coffee",
    aggregation: "SUM",
    targetPeriod: "DAY",
    targetDirection: "AT_MOST",
    suggestedTarget: 3,
    color: METRIC_COLORS[7],
  },
  {
    id: "sleep",
    aggregation: "LAST",
    targetPeriod: "DAY",
    targetDirection: "AT_LEAST",
    suggestedTarget: 8,
    color: METRIC_COLORS[5],
  },
  {
    id: "workout",
    aggregation: "COUNT",
    targetPeriod: "WEEK",
    targetDirection: "AT_LEAST",
    suggestedTarget: 3,
    color: METRIC_COLORS[2],
  },
  {
    id: "steps",
    aggregation: "SUM",
    targetPeriod: "DAY",
    targetDirection: "AT_LEAST",
    suggestedTarget: 8000,
    color: METRIC_COLORS[4],
  },
  {
    id: "reading",
    aggregation: "SUM",
    targetPeriod: "DAY",
    targetDirection: "AT_LEAST",
    suggestedTarget: 30,
    color: METRIC_COLORS[3],
  },
];

/** Шаблон за його id, або `null` якщо id прийшов з браузера і він вигаданий. */
export function findMetricTemplate(id: string): MetricTemplate | null {
  for (const template of METRIC_TEMPLATES) {
    if (template.id === id) {
      return template;
    }
  }
  return null;
}
