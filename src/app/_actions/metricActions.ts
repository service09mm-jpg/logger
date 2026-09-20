"use server";

import { revalidatePath } from "next/cache";
import { redirect, RedirectType } from "next/navigation";
import {
  archiveMetric,
  createMetric,
  DEFAULT_METRIC_COLOR,
  findMetricTemplate,
  isAggregation,
  isMetricColor,
  isTargetDirection,
  isTargetPeriod,
  updateMetric,
} from "@/features/metrics";
import type { MetricInput } from "@/features/metrics";
import { getDictionary } from "@/shared/i18n";
import { getSessionUser } from "../_lib/requestContext";

/**
 * Серверні дії для метрик.
 *
 * Усе, що приходить з форми, — рядки, і жодному з них не можна вірити на
 * слово: форму можна підмінити. Тому кожне значення проходить через перевірку
 * з domain/, а невідоме відкидається на заздалегідь відомий варіант.
 *
 * Кожен `redirect` тут явно просить `RedirectType.replace`. Причина в тому, що
 * `redirect` поводиться по-різному залежно від місця виклику: скрізь він за
 * замовчуванням замінює поточний запис в історії, а **в серверних діях —
 * додає новий**. Для нас це завжди не те: дія означає, що крок відпрацював,
 * і повертатись на заповнену форму вже створеної метрики немає сенсу.
 * Без `replace` кнопка «назад» після створення метрики веде не на головну, а
 * назад у майстер створення.
 */

/** Збирає метрику з полів форми, підставляючи безпечні значення за замовчуванням. */
function readMetricInput(formData: FormData): MetricInput | null {
  const name = String(formData.get("name") ?? "").trim();
  if (name.length === 0) {
    return null;
  }

  const aggregation = String(formData.get("aggregation") ?? "");
  const direction = String(formData.get("targetDirection") ?? "");
  const period = String(formData.get("targetPeriod") ?? "");
  const color = String(formData.get("color") ?? "");
  const rawTarget = String(formData.get("targetValue") ?? "").trim();

  const targetValue = rawTarget.length === 0 ? null : Number(rawTarget);
  if (targetValue !== null && !Number.isFinite(targetValue)) {
    return null;
  }

  return {
    name: name.slice(0, 60),
    unit: String(formData.get("unit") ?? "").trim().slice(0, 20),
    aggregation: isAggregation(aggregation) ? aggregation : "SUM",
    targetValue,
    targetDirection: isTargetDirection(direction) ? direction : "AT_LEAST",
    targetPeriod: isTargetPeriod(period) ? period : "DAY",
    color: isMetricColor(color) ? color : DEFAULT_METRIC_COLOR,
  };
}

/** Створення метрики з галереї — один тап, без жодної форми. */
export async function createFromTemplateAction(
  formData: FormData
): Promise<void> {
  const user = await getSessionUser();
  if (user === null) {
    redirect("/login", RedirectType.replace);
  }

  const template = findMetricTemplate(String(formData.get("templateId") ?? ""));
  if (template === null) {
    redirect("/metrics/new", RedirectType.replace);
  }

  // Назва й одиниця виміру залежать від мови, тому беруться зі словника юзера
  // і далі живуть як звичайний текст, який він може переписати.
  const dict = getDictionary(user.locale);
  const texts = dict.templates[template.id];

  await createMetric(user.id, {
    name: texts.name,
    unit: texts.unit,
    aggregation: template.aggregation,
    targetValue: template.suggestedTarget,
    targetDirection: template.targetDirection,
    targetPeriod: template.targetPeriod,
    color: template.color,
  });

  revalidatePath("/");
  redirect("/", RedirectType.replace);
}

export async function createMetricAction(formData: FormData): Promise<void> {
  const user = await getSessionUser();
  if (user === null) {
    redirect("/login", RedirectType.replace);
  }

  const input = readMetricInput(formData);
  if (input === null) {
    redirect("/metrics/new/custom", RedirectType.replace);
  }

  await createMetric(user.id, input);

  revalidatePath("/");
  redirect("/", RedirectType.replace);
}

export async function updateMetricAction(formData: FormData): Promise<void> {
  const user = await getSessionUser();
  if (user === null) {
    redirect("/login", RedirectType.replace);
  }

  const metricId = String(formData.get("metricId") ?? "");
  const input = readMetricInput(formData);
  if (input === null || metricId.length === 0) {
    redirect("/", RedirectType.replace);
  }

  await updateMetric(user.id, metricId, input);

  revalidatePath("/", "layout");
  redirect(`/metrics/${metricId}`, RedirectType.replace);
}

export async function archiveMetricAction(formData: FormData): Promise<void> {
  const user = await getSessionUser();
  if (user === null) {
    redirect("/login", RedirectType.replace);
  }

  const metricId = String(formData.get("metricId") ?? "");
  if (metricId.length > 0) {
    await archiveMetric(user.id, metricId);
  }

  revalidatePath("/", "layout");
  redirect("/", RedirectType.replace);
}
