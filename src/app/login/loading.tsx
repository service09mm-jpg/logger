import { FormLoading } from "@/shared/ui/Skeleton";

// Без власного файлу сторінка входу показувала б кістяк головної: `loading`
// з кореня застосунку діє на всі вкладені сторінки, які не мають свого.
export default function LoginLoading(): React.ReactElement {
  return <FormLoading fields={2} />;
}
