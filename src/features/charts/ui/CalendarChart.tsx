import type { Dictionary, Locale } from "@/shared/i18n";
import { formatIsoMonth } from "@/shared/ui/formatDate";
import type { CalendarWeek } from "../domain/calendarMonth";
import { calculateIntensity } from "../domain/intensity";

/**
 * Насиченість кольору на кожному рівні — як прозорість у кінці HEX-коду.
 *
 * Саме прозорість фону, а не властивість `opacity`: та приглушила б заодно й
 * межу клітинки, і порожні дні місяця стали б невидимими.
 */
const LEVEL_ALPHA = ["", "40", "73", "b3", "ff"];

/**
 * Календар-сітка: клітинка на день, колір показує, скільки того дня набралось.
 *
 * Шкалою слугує ціль, а якщо цілі немає — найбільше значення місяця. Тому
 * метрика без цілі теж має градієнт: видно не лише «був запис / не було», а й
 * наскільки день вибивається з інших.
 */
export function CalendarChart({
  weeks,
  monthIso,
  color,
  scaleMax,
  dict,
  locale,
}: {
  weeks: CalendarWeek[];
  monthIso: string;
  color: string;
  scaleMax: number;
  dict: Dictionary;
  locale: Locale;
}): React.ReactElement {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-muted">{formatIsoMonth(monthIso, locale)}</p>

      <div className="grid grid-cols-7 gap-1">
        {dict.weekdays.map((weekday) => (
          <span key={weekday} className="text-center text-[10px] text-muted">
            {weekday}
          </span>
        ))}

        {weeks.map((week) =>
          week.map((cell) => {
            // Дні сусідніх місяців лишаються порожнім місцем: вони тут лише
            // для того, щоб колонки збігались із днями тижня.
            if (!cell.inMonth) {
              return <span key={cell.iso} className="aspect-square" />;
            }

            const level = calculateIntensity(cell.value, scaleMax);
            return (
              <span
                key={cell.iso}
                title={cell.iso}
                className="aspect-square rounded border border-line"
                style={{
                  backgroundColor:
                    level === 0 ? "transparent" : `${color}${LEVEL_ALPHA[level]}`,
                }}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
