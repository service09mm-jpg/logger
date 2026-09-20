import { formatNumber } from "@/shared/ui/formatNumber";
import type { Dictionary, Locale } from "@/shared/i18n";
import type { MetricSummary } from "@/features/targets";

/**
 * Поточний стан метрики: значення, одиниця, підпис цілі й смужка прогресу.
 *
 * Один і той самий блок показується у двох місцях — на картці головної та в
 * шторці запису над numpad. Саме тому він окремий компонент: у шторці він має
 * оновлюватись рівно так, як оновиться картка, інакше юзер побачить одне, а
 * після закриття — інше.
 *
 * `variant` міняє лише розмір: на картці це головне число екрана, у шторці —
 * довідка поруч із тим, що юзер саме набирає.
 */
export function MetricValue({
  summary,
  dict,
  locale,
  variant,
}: {
  summary: MetricSummary;
  dict: Dictionary;
  locale: Locale;
  variant: "card" | "sheet";
}): React.ReactElement {
  const { metric, current, progress } = summary;

  const valueText =
    current === null
      ? dict.metric.noEntriesToday
      : formatNumber(current, locale);

  const targetText = buildTargetText(summary, dict, locale);
  const overTarget =
    progress !== null &&
    !progress.reached &&
    metric.targetDirection === "AT_MOST";

  return (
    <>
      <div className="flex items-baseline gap-2">
        <span
          className={
            variant === "card"
              ? "tabular text-2xl font-semibold text-foreground"
              : "tabular text-xl font-semibold text-foreground"
          }
        >
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
          {/* Смужка не перемальовується стрибком, а доповзає до нового
              значення: рух до цілі — те єдине, заради чого метрику й ведуть,
              і саме його варто показати. У шторці це видно найкраще, бо юзер
              дивиться саме сюди. */}
          <div
            className="h-full rounded-full transition-[width] duration-400 ease-out"
            style={{
              width: `${progress.ratio * 100}%`,
              backgroundColor: overTarget ? "#dc2626" : metric.color,
            }}
          />
        </div>
      )}
    </>
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
