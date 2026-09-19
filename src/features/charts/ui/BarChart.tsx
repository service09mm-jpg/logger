import type { Locale } from "@/shared/i18n";
import { formatIsoDate } from "@/shared/ui/formatDate";
import type { PeriodBar } from "../domain/periodBars";
import { EmptyChart } from "./LineChart";

/**
 * Стовпчики по періодах — для цілей на тиждень, місяць чи рік. Денна
 * клітинка для них бреше, бо ціль стоїть не на день.
 *
 * Висота стовпчика — частка від шкали: цілі, якщо вона є, або від
 * найбільшого стовпчика, якщо цілі немає.
 */
export function BarChart({
  bars,
  color,
  scaleMax,
  locale,
  emptyLabel,
}: {
  bars: PeriodBar[];
  color: string;
  scaleMax: number;
  locale: Locale;
  emptyLabel: string;
}): React.ReactElement {
  const hasAnyValue = bars.some((bar) => bar.value !== null);
  if (!hasAnyValue) {
    return <EmptyChart label={emptyLabel} />;
  }

  return (
    <div>
      {/* Вісь малюється під самими стовпчиками, а не під підписами —
          інакше лінія відривається від графіка. */}
      <div className="flex h-32 items-end gap-1.5 border-b border-line">
        {bars.map((bar) => {
          const ratio =
            bar.value === null || scaleMax <= 0
              ? 0
              : Math.min(bar.value / scaleMax, 1);

          return (
            <div
              key={bar.bounds.startIso}
              className="flex h-full flex-1 items-end"
            >
              <div
                className="w-full rounded-t"
                style={{
                  height: `${Math.max(ratio * 100, 2)}%`,
                  backgroundColor: color,
                  opacity: bar.value === null ? 0.2 : 1,
                }}
              />
            </div>
          );
        })}
      </div>

      <div className="flex gap-1.5 pt-1">
        {bars.map((bar) => (
          <span
            key={bar.bounds.startIso}
            className="flex-1 text-center text-[10px] text-muted"
          >
            {formatIsoDate(bar.bounds.startIso, locale)}
          </span>
        ))}
      </div>
    </div>
  );
}
