"use client";

// Клієнтський компонент: уся картка — це кнопка «записати», а на ній ще й
// посилання на сторінку метрики. Обидва обробники живуть у браузері.

import Link from "next/link";
import { LinkPending } from "@/shared/ui/LinkPending";
import type { Dictionary, Locale } from "@/shared/i18n";
import { MetricValue } from "./MetricValue";
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
  const { metric } = summary;

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
        <MetricValue
          summary={summary}
          dict={dict}
          locale={locale}
          variant="card"
        />
      </button>
    </li>
  );
}
