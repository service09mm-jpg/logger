import Link from "next/link";
import { LinkPending } from "@/shared/ui/LinkPending";
import { listEntriesBetween, listLatestEntries } from "@/features/entries";
import { listMetrics, MetricList } from "@/features/metrics";
import type { Entry } from "@/features/metrics";
import { earliestPeriodStart, summarizeMetric } from "@/features/targets";
import { getDictionary } from "@/shared/i18n";
import { logEntryAction } from "./_actions/entryActions";
import { getTodayIso, requireUser } from "./_lib/requestContext";

/**
 * Головний екран: усі метрики юзера з поточним значенням.
 *
 * Серверний компонент — він ходить у базу напряму, без жодного API-роута, і
 * віддає в браузер уже готову розмітку. Інтерактив (шторка, оптимістичне
 * оновлення) живе всередині `MetricList`.
 */
export default async function DashboardPage(): Promise<React.ReactElement> {
  // `Promise.all` замість двох `await` поспіль: юзер і сьогоднішній день один
  // від одного не залежать, тож чекати їх по черзі немає сенсу. Далі так само
  // скрізь, де запити незалежні, — саме через це сторінка й відкривалась
  // повільно: не через складність запитів, а через те, що вони стояли в черзі.
  const [user, todayIso] = await Promise.all([requireUser(), getTodayIso()]);
  const dict = getDictionary(user.locale);

  const metrics = await listMetrics(user.id);
  const periods = metrics.map((metric) => metric.targetPeriod);
  const windowStart = earliestPeriodStart(periods, todayIso);

  // Метрики типу «вага» показують останнє відоме значення, яке цілком могло
  // бути залоговане до початку вікна, — тому їх дотягуємо окремо. Раніше це
  // був окремий запит на кожну таку метрику, у циклі; тепер один на всі.
  const lastMetricIds = metrics
    .filter((metric) => metric.aggregation === "LAST")
    .map((metric) => metric.id);

  const [entries, latestEntries] = await Promise.all([
    listEntriesBetween(user.id, windowStart, todayIso),
    listLatestEntries(user.id, lastMetricIds),
  ]);

  const allEntries: Entry[] = [...entries, ...latestEntries];
  const summaries = metrics.map((metric) =>
    summarizeMetric(metric, allEntries, todayIso)
  );

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-6">
      <header className="mb-5 flex items-baseline justify-between">
        <h1 className="text-xl font-semibold">{dict.dashboard.title}</h1>
        <Link
          href="/settings"
          className="flex items-center gap-2 text-sm text-muted transition duration-100 hover:text-foreground active:scale-[0.97]"
        >
          {dict.dashboard.settings}
          <LinkPending />
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
        />
      )}

      <Link
        href="/metrics/new"
        className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-dashed border-line px-4 py-3.5 text-center text-sm font-medium transition duration-100 hover:border-foreground/30 active:scale-[0.99]"
      >
        {dict.dashboard.addMetric}
        <LinkPending />
      </Link>
    </main>
  );
}
