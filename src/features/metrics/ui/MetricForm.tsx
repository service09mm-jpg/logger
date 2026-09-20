import type { Dictionary } from "@/shared/i18n";
import { Button } from "@/shared/ui/Button";
import { FormPending } from "@/shared/ui/FormPending";
import { Field, FIELD_CLASSES } from "@/shared/ui/Field";
import { METRIC_COLORS } from "../domain/metricColors";
import {
  listAggregations,
  listTargetDirections,
  listTargetPeriods,
} from "../domain/metricGuards";
import type { Metric } from "../domain/metricTypes";

/**
 * Форма метрики — та сама для створення і для налаштувань.
 *
 * Серверний компонент: це звичайна HTML-форма, яка віддає дані серверній дії.
 * Ніякого стану в браузері тут немає, тому й клієнтським їй бути не треба.
 */
export function MetricForm({
  dict,
  action,
  submitLabel,
  metric,
}: {
  dict: Dictionary;
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
  /** Заповнені поля для режиму редагування. `null` — створення нової метрики. */
  metric: Metric | null;
}): React.ReactElement {
  return (
    <form action={action} className="flex flex-col gap-4">
      {metric === null ? null : (
        <input type="hidden" name="metricId" value={metric.id} />
      )}

      <Field label={dict.metric.name}>
        <input
          name="name"
          required
          maxLength={60}
          defaultValue={metric?.name ?? ""}
          placeholder={dict.metric.namePlaceholder}
          className={FIELD_CLASSES}
        />
      </Field>

      <Field label={dict.metric.unit}>
        <input
          name="unit"
          maxLength={20}
          defaultValue={metric?.unit ?? ""}
          placeholder={dict.metric.unitPlaceholder}
          className={FIELD_CLASSES}
        />
      </Field>

      <Field label={dict.metric.aggregation}>
        <select
          name="aggregation"
          defaultValue={metric?.aggregation ?? "SUM"}
          className={FIELD_CLASSES}
        >
          {listAggregations().map((aggregation) => (
            <option key={aggregation} value={aggregation}>
              {dict.aggregation[aggregation]}
            </option>
          ))}
        </select>
      </Field>

      <Field label={dict.metric.target} hint={dict.metric.targetPlaceholder}>
        <input
          name="targetValue"
          type="number"
          step="any"
          defaultValue={metric?.targetValue ?? ""}
          className={FIELD_CLASSES}
        />
      </Field>

      <Field label={dict.metric.targetDirection}>
        <select
          name="targetDirection"
          defaultValue={metric?.targetDirection ?? "AT_LEAST"}
          className={FIELD_CLASSES}
        >
          {listTargetDirections().map((direction) => (
            <option key={direction} value={direction}>
              {dict.targetDirection[direction]}
            </option>
          ))}
        </select>
      </Field>

      <Field label={dict.metric.targetPeriod}>
        <select
          name="targetPeriod"
          defaultValue={metric?.targetPeriod ?? "DAY"}
          className={FIELD_CLASSES}
        >
          {listTargetPeriods().map((period) => (
            <option key={period} value={period}>
              {dict.targetPeriod[period]}
            </option>
          ))}
        </select>
      </Field>

      <fieldset className="flex flex-col gap-1.5">
        <legend className="text-sm font-medium">{dict.metric.color}</legend>
        <div className="flex flex-wrap gap-2 pt-1">
          {METRIC_COLORS.map((color) => (
            <label key={color} className="cursor-pointer">
              {/* Перемикач кольору — звичайні radio-кнопки: колір видно, а
                  самого кружечка інтерфейсу не потрібно, тому input схований. */}
              <input
                type="radio"
                name="color"
                value={color}
                defaultChecked={(metric?.color ?? METRIC_COLORS[0]) === color}
                className="peer sr-only"
              />
              <span
                className="block h-7 w-7 rounded-full border-2 border-transparent peer-checked:border-foreground"
                style={{ backgroundColor: color }}
              />
            </label>
          ))}
        </div>
      </fieldset>

      <FormPending>
        <Button type="submit" variant="primary" className="mt-2">
          {submitLabel}
        </Button>
      </FormPending>
    </form>
  );
}
