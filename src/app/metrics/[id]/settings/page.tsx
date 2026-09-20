import { notFound } from "next/navigation";
import { getMetric, MetricForm } from "@/features/metrics";
import { getDictionary } from "@/shared/i18n";
import { BackLink } from "@/shared/ui/BackLink";
import { Button } from "@/shared/ui/Button";
import {
  archiveMetricAction,
  updateMetricAction,
} from "../../../_actions/metricActions";
import { requireUser } from "../../../_lib/requestContext";

export default async function MetricSettingsPage(
  props: PageProps<"/metrics/[id]/settings">
): Promise<React.ReactElement> {
  const { id } = await props.params;
  const user = await requireUser();
  const dict = getDictionary(user.locale);

  const metric = await getMetric(user.id, id);
  if (metric === null) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-6">
      <header className="mb-5 flex items-baseline justify-between">
        <h1 className="text-xl font-semibold">{dict.metric.settingsTitle}</h1>
        <BackLink href={`/metrics/${metric.id}`} label={dict.common.back} />
      </header>

      <MetricForm
        dict={dict}
        action={updateMetricAction}
        submitLabel={dict.common.save}
        metric={metric}
      />

      <section className="mt-10 border-t border-line pt-6">
        <p className="mb-3 text-sm text-muted">{dict.metric.archiveHint}</p>
        <form action={archiveMetricAction}>
          <input type="hidden" name="metricId" value={metric.id} />
          <Button type="submit" variant="danger">
            {dict.metric.archive}
          </Button>
        </form>
      </section>
    </main>
  );
}
