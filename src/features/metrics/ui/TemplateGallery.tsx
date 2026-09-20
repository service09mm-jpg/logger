import Link from "next/link";
import type { Dictionary } from "@/shared/i18n";
import { FormPending } from "@/shared/ui/FormPending";
import { LinkPending } from "@/shared/ui/LinkPending";
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
          <FormPending>
            <button
              type="submit"
              className="flex w-full flex-col gap-1 rounded-xl border border-line bg-surface px-4 py-3.5 text-left transition duration-100 select-none hover:border-foreground/30 active:scale-[0.97] disabled:opacity-50 disabled:active:scale-100"
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
          </FormPending>
        </form>
      ))}

      <Link
        href="/metrics/new/custom"
        replace
        className="flex flex-col justify-end gap-1 rounded-xl border border-dashed border-line px-4 py-3.5 text-sm font-medium transition duration-100 hover:border-foreground/30 active:scale-[0.97]"
      >
        <span className="flex items-center gap-2">
          {dict.metric.custom}
          <LinkPending />
        </span>
      </Link>
    </div>
  );
}
