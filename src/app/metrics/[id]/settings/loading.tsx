import { FormLoading } from "@/shared/ui/Skeleton";

/** Кістяк налаштувань метрики — та сама форма, що й при створенні. */
export default function MetricSettingsLoading(): React.ReactElement {
  return <FormLoading fields={6} />;
}
