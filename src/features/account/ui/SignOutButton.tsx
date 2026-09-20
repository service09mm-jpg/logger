import { Button } from "@/shared/ui/Button";
import { FormPending } from "@/shared/ui/FormPending";

export function SignOutButton({
  label,
  signOutAction,
}: {
  label: string;
  signOutAction: () => Promise<void>;
}): React.ReactElement {
  return (
    <form action={signOutAction}>
      <FormPending>
        <Button type="submit" variant="secondary">
          {label}
        </Button>
      </FormPending>
    </form>
  );
}
