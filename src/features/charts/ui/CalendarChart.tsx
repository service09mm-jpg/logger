import type { Dictionary, Locale } from "@/shared/i18n";
import { formatIsoMonth } from "@/shared/ui/formatDate";
import { formatCompactNumber } from "@/shared/ui/formatNumber";
import type { CalendarWeek } from "../domain/calendarMonth";
import { calculateIntensity } from "../domain/intensity";

/**
 * Кольори шкали й колір цифри поверх неї — по одному на рівень насиченості.
 *
 * Це послідовна шкала, а не палітра: один відтінок від світлого до темного.
 * Колір тут означає «скільки», а не «яка метрика», тому він однаковий для всіх
 * метрик — інакше дві сусідні клітинки різних кольорів читались би як різні
 * речі, хоч насправді відрізняються лише величиною.
 *
 * Значення — це змінні з `globals.css`: у темній темі шкала йде в інший бік
 * (від темного до світлого), бо на чорному тлі світле означає «більше».
 */
const LEVEL_BACKGROUND = [
  "transparent",
  "var(--cal-1)",
  "var(--cal-2)",
  "var(--cal-3)",
  "var(--cal-4)",
];

const LEVEL_INK = [
  "var(--muted)",
  "var(--cal-ink-1)",
  "var(--cal-ink-2)",
  "var(--cal-ink-3)",
  "var(--cal-ink-4)",
];

/**
 * Календар-сітка: клітинка на день, у клітинці — саме значення за той день,
 * а насиченість фону показує, наскільки день великий проти шкали.
 *
 * Шкалою слугує ціль, а якщо цілі немає — найбільше значення місяця. Тому
 * метрика без цілі теж має градієнт: видно не лише «був запис / не було», а й
 * наскільки день вибивається з інших.
 *
 * Окремої легенди до шкали немає навмисно: точні значення написані в самих
 * клітинках, а легенда пояснювала б те, що й так видно.
 */
export function CalendarChart({
  weeks,
  monthIso,
  scaleMax,
  dict,
  locale,
}: {
  weeks: CalendarWeek[];
  monthIso: string;
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
            // «05» → «5»: у клітинці кожен піксель на рахунку.
            const dayNumber = String(Number(cell.iso.slice(8)));

            return (
              <span
                key={cell.iso}
                title={
                  cell.value === null
                    ? cell.iso
                    : `${cell.iso}: ${formatNumberTitle(cell.value, locale)}`
                }
                className="relative flex aspect-square flex-col items-center justify-center rounded border border-line"
                style={{
                  backgroundColor: LEVEL_BACKGROUND[level],
                  color: LEVEL_INK[level],
                }}
              >
                <span className="absolute top-0.5 left-1 text-[9px] leading-none opacity-70">
                  {dayNumber}
                </span>
                {cell.value === null ? null : (
                  <span className="tabular mt-1 text-[11px] leading-none font-medium">
                    {formatCompactNumber(cell.value, locale, dict.common.thousands)}
                  </span>
                )}
              </span>
            );
          })
        )}
      </div>
    </div>
  );
}

/** У підказці місця вистачає, тому там число повне, без скорочення. */
function formatNumberTitle(value: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === "uk" ? "uk-UA" : "en-GB", {
    maximumFractionDigits: 2,
  }).format(value);
}
