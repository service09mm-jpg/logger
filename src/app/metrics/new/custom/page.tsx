import Link from "next/link";
import { MetricForm } from "@/features/metrics";
import { getDictionary } from "@/shared/i18n";
import { createMetricAction } from "../../../_actions/metricActions";
import { requireUser } from "../../../_lib/requestContext";

/** Холодний шлях: метрика, якої немає в галереї. Тут можна бути багатослівним. */
export default async function CustomMetricPage(): Promise<React.ReactElement> {
  const user = await requireUser();
  const dict = getDictionary(user.locale);

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-6">
      <header className="mb-5 flex items-baseline justify-between">
        <h1 className="text-xl font-semibold">{dict.metric.custom}</h1>
        <Link
          href="/metrics/new"
          className="text-sm text-muted hover:text-foreground"
        >
          {dict.common.back}
        </Link>
      </header>

      <MetricForm
        dict={dict}
        action={createMetricAction}
        submitLabel={dict.metric.create}
        metric={null}
      />
    </main>
  );
}
