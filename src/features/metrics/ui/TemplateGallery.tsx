import Link from "next/link";
import type { Dictionary } from "@/shared/i18n";
import { METRIC_TEMPLATES } from "../domain/metricTemplates";

/**
 * Галерея шаблонів: тап по плитці одразу створює метрику з готовими
 * одиницею, агрегацією й кольором. Це серверний компонент — кожна плитка є
 * звичайною формою, тому галерея працює навіть до того, як завантажиться JS.
 */
export function TemplateGallery({
  dict,
  createFromTemplateAction,
}: {
  dict: Dictionary;
  createFromTemplateAction: (formData: FormData) => Promise<void>;
}): React.ReactElement {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {METRIC_TEMPLATES.map((template) => (
        <form key={template.id} action={createFromTemplateAction}>
          <input type="hidden" name="templateId" value={template.id} />
          <button
            type="submit"
            className="flex w-full flex-col gap-1 rounded-xl border border-line bg-surface px-4 py-3.5 text-left hover:border-foreground/30"
          >
            <span
              aria-hidden
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: template.color }}
            />
            <span className="text-sm font-medium">
              {dict.templates[template.id].name}
            </span>
            <span className="text-xs text-muted">
              {dict.templates[template.id].unit}
            </span>
          </button>
        </form>
      ))}

      <Link
        href="/metrics/new/custom"
        className="flex flex-col justify-end gap-1 rounded-xl border border-dashed border-line px-4 py-3.5 text-sm font-medium hover:border-foreground/30"
      >
        {dict.metric.custom}
      </Link>
    </div>
  );
}
