import { LocalePicker, SignOutButton } from "@/features/account";
import { getDictionary } from "@/shared/i18n";
import { BackLink } from "@/shared/ui/BackLink";
import { setLocaleAction, signOutAction } from "../_actions/accountActions";
import { requireUser } from "../_lib/requestContext";

export default async function SettingsPage(): Promise<React.ReactElement> {
  const user = await requireUser();
  const dict = getDictionary(user.locale);

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-6">
      <header className="mb-5 flex items-baseline justify-between">
        <h1 className="text-xl font-semibold">{dict.settings.title}</h1>
        <BackLink href="/" label={dict.common.back} />
      </header>

      <section className="mb-8">
        <h2 className="mb-2.5 text-sm font-medium">{dict.settings.language}</h2>
        <LocalePicker
          current={user.locale}
          dict={dict}
          setLocaleAction={setLocaleAction}
        />
      </section>

      <section>
        <h2 className="mb-2.5 text-sm font-medium">{dict.settings.account}</h2>
        <p className="mb-3 text-sm text-muted">{user.email}</p>
        <SignOutButton label={dict.auth.signOut} signOutAction={signOutAction} />
      </section>
    </main>
  );
}
