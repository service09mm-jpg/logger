import { Button } from "@/shared/ui/Button";

/**
 * Кнопка входу. Серверний компонент: це звичайна форма, яка викликає серверну
 * дію, тому вхід працює навіть без JavaScript.
 */
export function SignInButton({
  label,
  signInAction,
}: {
  label: string;
  signInAction: () => Promise<void>;
}): React.ReactElement {
  return (
    <form action={signInAction}>
      <Button type="submit" variant="primary">
        {label}
      </Button>
    </form>
  );
}
