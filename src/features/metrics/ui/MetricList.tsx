"use client";

// Клієнтський компонент: він тримає стан «яку метрику зараз логуємо»,
// оптимістичне значення й тост із відкатом. Усе це — стан у браузері.

import { useOptimistic, useState, useTransition } from "react";
import { applyOptimisticEntry } from "@/features/targets";
import type { MetricSummary } from "@/features/targets";
import type { Dictionary, Locale } from "@/shared/i18n";
import { Toast } from "@/shared/ui/Toast";
import { ValueSheet } from "@/shared/ui/ValueSheet";
import { MetricCard } from "./MetricCard";

/** Що повертає серверна дія: id створеного запису або ознаку помилки. */
export type LogEntryResult = { entryId: string } | { error: true };

type PendingEntry = {
  metricId: string;
  value: number;
};

export function MetricList({
  summaries,
  dict,
  locale,
  todayIso,
  logEntryAction,
}: {
  summaries: MetricSummary[];
  dict: Dictionary;
  locale: Locale;
  todayIso: string;
  logEntryAction: (input: {
    metricId: string;
    value: number;
    localDate: string;
  }) => Promise<LogEntryResult>;
}): React.ReactElement {
  // useOptimistic показує майбутній стан ще до відповіді сервера. Коли сервер
  // відповість і сторінка оновиться, React сам викине оптимістичне значення й
  // покаже справжнє — відкочувати руками нічого не треба.
  const [visibleSummaries, addPendingEntry] = useOptimistic(
    summaries,
    (currentSummaries: MetricSummary[], pending: PendingEntry) =>
      currentSummaries.map((summary) =>
        summary.metric.id === pending.metricId
          ? applyOptimisticEntry(summary, pending.value)
          : summary
      )
  );

  const [openMetricId, setOpenMetricId] = useState<string | null>(null);
  // Повідомлення показується лише коли запис не дійшов до сервера. Підтвердження
  // успіху тут немає навмисно: значення на картці змінюється миттєво, і це вже
  // є відповіддю. Банер «Записано · Скасувати» після кожного тапу тільки
  // заважав — помилку виправляють у журналі метрики, де запис можна видалити.
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // Щойно записане значення — щоб картка могла показати, що саме прилетіло.
  // Живе рівно стільки, скільки триває спливання цифри.
  const [justLogged, setJustLogged] = useState<PendingEntry | null>(null);
  const [, startTransition] = useTransition();

  const openSummary =
    visibleSummaries.find((summary) => summary.metric.id === openMetricId) ??
    null;

  function handleSubmit(value: number, localDate: string): void {
    if (openMetricId === null) {
      return;
    }
    const metricId = openMetricId;

    // Шторку тут більше не закриваємо: вона показує галочку й іде сама, а до
    // того встигає початись оптимістичне оновлення картки під нею.
    setJustLogged({ metricId, value });

    // Оптимістичне оновлення дозволене лише всередині переходу — React має
    // знати, доки тримати тимчасовий стан.
    startTransition(async () => {
      addPendingEntry({ metricId, value });
      const result = await logEntryAction({ metricId, value, localDate });

      if ("error" in result) {
        setErrorMessage(dict.entry.failed);
      }
    });
  }

  return (
    <>
      <ul className="flex flex-col gap-2.5">
        {visibleSummaries.map((summary) => (
          <MetricCard
            key={summary.metric.id}
            summary={summary}
            dict={dict}
            locale={locale}
            justLogged={
              justLogged?.metricId === summary.metric.id
                ? justLogged.value
                : null
            }
            onDeltaShown={() => setJustLogged(null)}
            onLog={() => setOpenMetricId(summary.metric.id)}
          />
        ))}
      </ul>

      {openSummary === null ? null : (
        <ValueSheet
          key={openSummary.metric.id}
          open
          label={openSummary.metric.name}
          unit={openSummary.metric.unit}
          // Для метрик типу «вага» в полі вже стоїть попереднє значення:
          // виправити одну цифру швидше, ніж набрати число заново.
          initialValue={
            openSummary.metric.aggregation === "LAST" &&
            openSummary.current !== null
              ? String(openSummary.current)
              : ""
          }
          initialDate={todayIso}
          texts={{
            title: openSummary.metric.name,
            date: dict.entry.date,
            submit: dict.entry.submit,
            cancel: dict.common.cancel,
          }}
          onSubmit={handleSubmit}
          onClose={() => setOpenMetricId(null)}
        />
      )}

      {errorMessage === null ? null : (
        <Toast message={errorMessage} onHide={() => setErrorMessage(null)} />
      )}
    </>
  );
}
