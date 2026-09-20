/**
 * Палітра кольорів метрик. Фіксований список, а не довільний hex, з двох причин:
 * випадковий колір легко зробити нечитабельним на темному тлі, і фіксований
 * набір тримає інтерфейс спокійним.
 *
 * Значення зберігається в `Metric.color` як рядок і підставляється прямо в CSS.
 */
export const METRIC_COLORS = [
  "#4f7cac",
  "#5c8a72",
  "#a8734a",
  "#8a5c7a",
  "#4a7d8a",
  "#8a6f4a",
  "#6b6f8a",
  "#7d8a4a",
] as const;

export type MetricColor = (typeof METRIC_COLORS)[number];

export const DEFAULT_METRIC_COLOR: MetricColor = METRIC_COLORS[0];

/** Чи це колір з нашої палітри — перевірка для даних, що прийшли з браузера. */
export function isMetricColor(value: string): value is MetricColor {
  for (const color of METRIC_COLORS) {
    if (color === value) {
      return true;
    }
  }
  return false;
}
