import { SignInButton } from "@/features/account";
import { DEFAULT_LOCALE, getDictionary } from "@/shared/i18n";
import { signInAction } from "../_actions/accountActions";

/**
 * Сторінка входу. Єдина сторінка застосунку, яка нічого не знає про юзера, —
 * і єдина, з якої можна почати.
 */
export default function LoginPage(): React.ReactElement {
  // Мову юзера тут узяти нізвідки: він ще не увійшов. Тому — мова за
  // замовчуванням.
  const dict = getDictionary(DEFAULT_LOCALE);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6 px-4 py-16">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">{dict.auth.appName}</h1>
        <p className="mt-2 text-sm text-muted">{dict.auth.tagline}</p>
      </div>
      <SignInButton
        label={dict.auth.signInWithGoogle}
        signInAction={signInAction}
      />
    </main>
  );
}
