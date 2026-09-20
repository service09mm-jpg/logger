import type { Aggregation, ChartShape, TargetPeriod } from "./metricTypes";

/**
 * Юзер не обирає тип графіка — він випливає з того, що метрика означає.
 *
 * - LAST (вага) — лінія: важлива траєкторія, окремі дні безглузді.
 * - денна ціль — календар: видно візерунок пропусків за місяць.
 * - тижнева / місячна / річна ціль — стовпчики по періодах, бо денна
 *   клітинка бреше, коли ціль стоїть на тиждень.
 */
export function getChartShape(
  aggregation: Aggregation,
  targetPeriod: TargetPeriod
): ChartShape {
  if (aggregation === "LAST") {
    return "LINE";
  }
  if (targetPeriod === "DAY") {
    return "CALENDAR";
  }
  return "BARS";
}
