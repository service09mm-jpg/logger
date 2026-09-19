import { CredentialsForm } from "@/features/account";
import { DEFAULT_LOCALE, getDictionary } from "@/shared/i18n";
import { signInAction } from "../_actions/accountActions";

/** Сторінка входу. Єдина сторінка застосунку, яка нічого не знає про юзера. */
export default function LoginPage(): React.ReactElement {
  // Мову тут узяти нізвідки: юзер ще не увійшов.
  const dict = getDictionary(DEFAULT_LOCALE);

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-4 py-16">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">{dict.auth.appName}</h1>
        <p className="mt-2 text-sm text-muted">{dict.auth.tagline}</p>
      </div>

      <CredentialsForm
        dict={dict}
        action={signInAction}
        submitLabel={dict.auth.signIn}
        isRegistration={false}
        footer={{
          question: dict.auth.noAccount,
          linkLabel: dict.auth.signUp,
          href: "/register",
        }}
      />
    </main>
  );
}
