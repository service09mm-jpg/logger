import Link from "next/link";
import { LinkPending } from "@/shared/ui/LinkPending";
import { notFound } from "next/navigation";
import { getChartWindow, MetricChart } from "@/features/charts";
import { EntryHistory, listEntriesForMetric, listRecentEntries } from "@/features/entries";
import { getMetric } from "@/features/metrics";
import { summarizeMetric } from "@/features/targets";
import { getDictionary } from "@/shared/i18n";
import { BackLink } from "@/shared/ui/BackLink";
import { formatNumber } from "@/shared/ui/formatNumber";
import {
  deleteEntryAction,
  logEntryAction,
  updateEntryAction,
} from "../../_actions/entryActions";
import {
  getTimeZone,
  getTodayIso,
  requireUser,
} from "../../_lib/requestContext";

/** Скільки записів показує журнал. */
const HISTORY_LIMIT = 30;

/**
 * Сторінка метрики: графік, поточне значення й журнал записів.
 *
 * `params` у Next.js 16 приходить обіцянкою (Promise) — звідси `await`.
 */
export default async function MetricPage(
  props: PageProps<"/metrics/[id]">
): Promise<React.ReactElement> {
  const { id } = await props.params;
  const user = await requireUser();
  const dict = getDictionary(user.locale);
  const todayIso = await getTodayIso();
  const timeZone = await getTimeZone();

  const metric = await getMetric(user.id, id);
  if (metric === null) {
    notFound();
  }

  const chartWindow = getChartWindow(metric, todayIso);
  const chartEntries = await listEntriesForMetric(
    user.id,
    metric.id,
    chartWindow.startIso,
    chartWindow.endIso
  );
  const recentEntries = await listRecentEntries(
    user.id,
    metric.id,
    HISTORY_LIMIT
  );

  const summary = summarizeMetric(metric, chartEntries, todayIso);

  async function restoreEntryAction(input: {
    metricId: string;
    value: number;
    localDate: string;
  }): Promise<void> {
    "use server";
    await logEntryAction(input);
  }

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-6">
      <header className="mb-5 flex items-baseline justify-between">
        <h1 className="flex items-center gap-2 text-xl font-semibold">
          <span
            aria-hidden
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: metric.color }}
          />
          {metric.name}
        </h1>
        <BackLink href="/" label={dict.common.back} />
      </header>

      <p className="tabular mb-6 text-3xl font-semibold">
        {summary.current === null
          ? dict.metric.noEntriesToday
          : formatNumber(summary.current, user.locale)}
        <span className="ml-2 text-base font-normal text-muted">
          {metric.unit}
        </span>
      </p>

      <section className="mb-8">
        <h2 className="mb-2.5 text-sm font-medium">{dict.metric.chartTitle}</h2>
        <MetricChart
          metric={metric}
          entries={chartEntries}
          todayIso={todayIso}
          dict={dict}
          locale={user.locale}
        />
      </section>

      <section className="mb-8">
        <h2 className="mb-1 text-sm font-medium">{dict.metric.history}</h2>
        <EntryHistory
          entries={recentEntries}
          metric={metric}
          dict={dict}
          locale={user.locale}
          timeZone={timeZone}
          updateEntryAction={updateEntryAction}
          deleteEntryAction={deleteEntryAction}
          restoreEntryAction={restoreEntryAction}
        />
      </section>

      <Link
        href={`/metrics/${metric.id}/settings`}
        className="flex items-center justify-center gap-2 rounded-xl border border-line px-4 py-3 text-center text-sm transition duration-100 hover:border-foreground/30 active:scale-[0.99]"
      >
        {dict.metric.openSettings}
        <LinkPending />
      </Link>
    </main>
  );
}
