"use client";

// Клієнтський компонент: уся картка — це кнопка «записати», а на ній ще й
// посилання на сторінку метрики. Обидва обробники живуть у браузері.

import Link from "next/link";
import { LinkPending } from "@/shared/ui/LinkPending";
import { formatNumber } from "@/shared/ui/formatNumber";
import type { Dictionary, Locale } from "@/shared/i18n";
import type { MetricSummary } from "@/features/targets";

export function MetricCard({
  summary,
  dict,
  locale,
  justLogged = null,
  onDeltaShown,
  onLog,
}: {
  summary: MetricSummary;
  dict: Dictionary;
  locale: Locale;
  /** Щойно записане значення — показується й тане. `null`, коли показувати нічого. */
  justLogged?: number | null;
  onDeltaShown?: () => void;
  onLog: () => void;
}): React.ReactElement {
  const { metric, current, progress } = summary;

  const valueText =
    current === null
      ? dict.metric.noEntriesToday
      : formatNumber(current, locale);

  const targetText = buildTargetText(summary, dict, locale);

  // Для метрик, де записи складаються (сума за день, кількість разів), важливо
  // показати саме доданок: на картці стоїть підсумок, і без «+250» незрозуміло,
  // чи твої 250 узагалі дійшли. Для ваги чи середнього доданка не буває —
  // записане значення просто стає новим, тож знак плюс там був би брехнею.
  const deltaText =
    justLogged === null
      ? null
      : (metric.aggregation === "SUM" || metric.aggregation === "COUNT"
          ? "+"
          : "") + formatNumber(justLogged, locale);
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
        <span className="ml-auto flex items-center">
          <LinkPending idle={<span aria-hidden>›</span>} />
        </span>
      </Link>

      {/* Назва метрики лежить у посиланні вище, тому сама кнопка запису без
          підпису була б для скрінрідера просто «кнопка». */}
      <button
        type="button"
        onClick={onLog}
        aria-label={`${dict.entry.logTitle}: ${metric.name}`}
        className="w-full px-4 pt-1 pb-4 text-left transition duration-100 select-none active:bg-foreground/5"
      >
        <div className="flex items-baseline gap-2">
          <span className="tabular text-2xl font-semibold text-foreground">
            {valueText}
          </span>
          <span className="text-sm text-muted">{metric.unit}</span>
          {/* Той самий куток картки: щойно записане значення на секунду займає
              місце підпису цілі. Так цифрі не доводиться ні з чим ділити
              простір і нічого не перекриває. */}
          {deltaText !== null ? (
            <span
              onAnimationEnd={onDeltaShown}
              className="animate-delta tabular ml-auto text-sm font-medium"
              style={{ color: metric.color }}
            >
              {deltaText}
            </span>
          ) : targetText === null ? null : (
            <span className="tabular ml-auto text-xs text-muted">
              {targetText}
            </span>
          )}
        </div>

        {progress === null ? null : (
          <div className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-line">
            {/* Смужка не перемальовується стрибком, а доповзає до нового
                значення: рух до цілі — те єдине, заради чого метрику й ведуть,
                і саме його варто показати. */}
            <div
              className="h-full rounded-full transition-[width] duration-500 ease-out"
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
