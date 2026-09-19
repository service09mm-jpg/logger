// Публічний API фічі «метрики». Інші фічі й роути беруть звідси і лише звідси.
//
// Увага: цей файл змішує серверний код (data/, він тягне Prisma) і
// компоненти. Серверним компонентам це байдуже, а от клієнтський компонент,
// який імпортує звідси, потягне Prisma в браузерний бандл. Тому всередині
// фічі клієнтські компоненти імпортують сусідів відносним шляхом
// (`./MetricCard`), а не через цей файл.

export { listMetrics, getMetric, createMetric, updateMetric, archiveMetric } from "./data/metricRepo";
export type { MetricInput } from "./data/metricRepo";
export { getChartShape } from "./domain/chartShape";
export {
  DEFAULT_METRIC_COLOR,
  isMetricColor,
  METRIC_COLORS,
} from "./domain/metricColors";
export {
  isAggregation,
  isTargetDirection,
  isTargetPeriod,
  listAggregations,
  listTargetDirections,
  listTargetPeriods,
} from "./domain/metricGuards";
export {
  findMetricTemplate,
  METRIC_TEMPLATES,
} from "./domain/metricTemplates";
export type {
  MetricTemplate,
  MetricTemplateId,
} from "./domain/metricTemplates";
export type {
  Aggregation,
  ChartShape,
  Entry,
  Metric,
  TargetDirection,
  TargetPeriod,
} from "./domain/metricTypes";
export { MetricForm } from "./ui/MetricForm";
export { MetricList } from "./ui/MetricList";
export type { LogEntryResult } from "./ui/MetricList";
export { TemplateGallery } from "./ui/TemplateGallery";
