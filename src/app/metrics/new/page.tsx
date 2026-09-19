import Link from "next/link";
import { TemplateGallery } from "@/features/metrics";
import { getDictionary } from "@/shared/i18n";
import { createFromTemplateAction } from "../../_actions/metricActions";
import { requireUser } from "../../_lib/requestContext";

/** Галерея шаблонів: створення метрики в один тап. */
export default async function NewMetricPage(): Promise<React.ReactElement> {
  const user = await requireUser();
  const dict = getDictionary(user.locale);

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-6">
      <header className="mb-5 flex items-baseline justify-between">
        <h1 className="text-xl font-semibold">{dict.metric.newTitle}</h1>
        <Link href="/" className="text-sm text-muted hover:text-foreground">
          {dict.common.back}
        </Link>
      </header>

      <p className="mb-4 text-sm text-muted">{dict.metric.templatesHint}</p>

      <TemplateGallery
        dict={dict}
        createFromTemplateAction={createFromTemplateAction}
      />
    </main>
  );
}
