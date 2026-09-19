"use client";

// Клієнтський компонент: уся картка — це кнопка «записати», а на ній ще й
// посилання на сторінку метрики. Обидва обробники живуть у браузері.

import Link from "next/link";
import { formatNumber } from "@/shared/ui/formatNumber";
import type { Dictionary, Locale } from "@/shared/i18n";
import type { MetricSummary } from "@/features/targets";

export function MetricCard({
  summary,
  dict,
  locale,
  onLog,
}: {
  summary: MetricSummary;
  dict: Dictionary;
  locale: Locale;
  onLog: () => void;
}): React.ReactElement {
  const { metric, current, progress } = summary;

  const valueText =
    current === null
      ? dict.metric.noEntriesToday
      : formatNumber(current, locale);

  const targetText = buildTargetText(summary, dict, locale);
  const overTarget =
    progress !== null && !progress.reached && metric.targetDirection === "AT_MOST";

  return (
    <li className="overflow-hidden rounded-xl border border-line bg-surface">
      <Link
        href={`/metrics/${metric.id}`}
        className="flex items-center gap-2 px-4 pt-3.5 pb-1 text-sm text-muted hover:text-foreground"
      >
        <span
          aria-hidden
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: metric.color }}
        />
        <span className="font-medium text-foreground">{metric.name}</span>
        <span aria-hidden className="ml-auto">
          ›
        </span>
      </Link>

      {/* Назва метрики лежить у посиланні вище, тому сама кнопка запису без
          підпису була б для скрінрідера просто «кнопка». */}
      <button
        type="button"
        onClick={onLog}
        aria-label={`${dict.entry.logTitle}: ${metric.name}`}
        className="w-full px-4 pt-1 pb-4 text-left"
      >
        <div className="flex items-baseline gap-2">
          <span className="tabular text-2xl font-semibold text-foreground">
            {valueText}
          </span>
          <span className="text-sm text-muted">{metric.unit}</span>
          {targetText === null ? null : (
            <span className="tabular ml-auto text-xs text-muted">
              {targetText}
            </span>
          )}
        </div>

        {progress === null ? null : (
          <div className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-line">
            <div
              className="h-full rounded-full"
              style={{
                width: `${progress.ratio * 100}%`,
                backgroundColor: overTarget ? "#dc2626" : metric.color,
              }}
            />
          </div>
        )}
      </button>
    </li>
  );
}

/** Підпис праворуч: «з 2000 ккал за тиждень» або нічого, якщо цілі немає. */
function buildTargetText(
  summary: MetricSummary,
  dict: Dictionary,
  locale: Locale
): string | null {
  const { metric } = summary;

  if (metric.targetValue === null) {
    return null;
  }

  const target = formatNumber(metric.targetValue, locale);
  const direction = dict.targetDirection[metric.targetDirection];

  if (metric.aggregation === "LAST" || metric.targetPeriod === "DAY") {
    return `${direction} ${target}`;
  }

  return `${direction} ${target} ${dict.periodLabel[metric.targetPeriod]}`;
}
