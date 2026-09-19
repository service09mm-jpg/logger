import { Button } from "@/shared/ui/Button";

export function SignOutButton({
  label,
  signOutAction,
}: {
  label: string;
  signOutAction: () => Promise<void>;
}): React.ReactElement {
  return (
    <form action={signOutAction}>
      <Button type="submit" variant="secondary">
        {label}
      </Button>
    </form>
  );
}
