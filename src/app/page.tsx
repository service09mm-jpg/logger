import Link from "next/link";
import { listEntriesBetween, getLatestEntry } from "@/features/entries";
import { listMetrics, MetricList } from "@/features/metrics";
import type { Entry } from "@/features/metrics";
import { earliestPeriodStart, summarizeMetric } from "@/features/targets";
import { getDictionary } from "@/shared/i18n";
import { logEntryAction, deleteEntryAction } from "./_actions/entryActions";
import { getTodayIso, requireUser } from "./_lib/requestContext";

/**
 * Головний екран: усі метрики юзера з поточним значенням.
 *
 * Серверний компонент — він ходить у базу напряму, без жодного API-роута, і
 * віддає в браузер уже готову розмітку. Інтерактив (шторка, оптимістичне
 * оновлення) живе всередині `MetricList`.
 */
export default async function DashboardPage(): Promise<React.ReactElement> {
  const user = await requireUser();
  const dict = getDictionary(user.locale);
  const todayIso = await getTodayIso();

  const metrics = await listMetrics(user.id);
  const periods = metrics.map((metric) => metric.targetPeriod);
  const windowStart = earliestPeriodStart(periods, todayIso);

  const entries = await listEntriesBetween(user.id, windowStart, todayIso);

  // Метрики типу «вага» показують останнє відоме значення, яке цілком могло
  // бути залоговане до початку вікна — тому їх дотягуємо окремо.
  const latestEntries: Entry[] = [];
  for (const metric of metrics) {
    if (metric.aggregation === "LAST") {
      const latest = await getLatestEntry(user.id, metric.id);
      if (latest !== null) {
        latestEntries.push(latest);
      }
    }
  }

  const allEntries = [...entries, ...latestEntries];
  const summaries = metrics.map((metric) =>
    summarizeMetric(metric, allEntries, todayIso)
  );

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-6">
      <header className="mb-5 flex items-baseline justify-between">
        <h1 className="text-xl font-semibold">{dict.dashboard.title}</h1>
        <Link href="/settings" className="text-sm text-muted hover:text-foreground">
          {dict.dashboard.settings}
        </Link>
      </header>

      {summaries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line px-4 py-10 text-center">
          <p className="font-medium">{dict.dashboard.emptyTitle}</p>
          <p className="mt-1 text-sm text-muted">{dict.dashboard.emptyHint}</p>
        </div>
      ) : (
        <MetricList
          summaries={summaries}
          dict={dict}
          locale={user.locale}
          todayIso={todayIso}
          logEntryAction={logEntryAction}
          undoEntryAction={deleteEntryAction}
        />
      )}

      <Link
        href="/metrics/new"
        className="mt-3 block rounded-xl border border-dashed border-line px-4 py-3.5 text-center text-sm font-medium hover:border-foreground/30"
      >
        {dict.dashboard.addMetric}
      </Link>
    </main>
  );
}
