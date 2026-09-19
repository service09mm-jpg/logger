import { CredentialsForm } from "@/features/account";
import { DEFAULT_LOCALE, getDictionary } from "@/shared/i18n";
import { registerAction } from "../_actions/accountActions";

/** Реєстрація: пошта й пароль, більше нічого. Підтвердження адреси немає. */
export default function RegisterPage(): React.ReactElement {
  const dict = getDictionary(DEFAULT_LOCALE);

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-4 py-16">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">{dict.auth.registerTitle}</h1>
        <p className="mt-2 text-sm text-muted">{dict.auth.tagline}</p>
      </div>

      <CredentialsForm
        dict={dict}
        action={registerAction}
        submitLabel={dict.auth.signUp}
        isRegistration
        footer={{
          question: dict.auth.haveAccount,
          linkLabel: dict.auth.signIn,
          href: "/login",
        }}
      />
    </main>
  );
}
