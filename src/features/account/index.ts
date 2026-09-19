// Публічний API фічі «акаунт»: хто зараз у сесії, вхід, реєстрація й мова.
//
// Конфігурація Auth.js живе саме тут, а не в lib/: вона ходить у базу за
// юзером, а це робота шару data/ відповідної фічі.

export { auth, handlers, signIn, signOut } from "./data/auth";
export { getCurrentUser, updateUserLocale } from "./data/currentUser";
export type { CurrentUser } from "./data/currentUser";
export { registerUser } from "./data/registerUser";
export type { RegistrationResult } from "./data/registerUser";
export {
  isValidEmail,
  isValidPassword,
  MIN_PASSWORD_LENGTH,
  normalizeEmail,
} from "./domain/credentials";
export { CredentialsForm } from "./ui/CredentialsForm";
export type { CredentialsFormState } from "./ui/CredentialsForm";
export { LocalePicker } from "./ui/LocalePicker";
export { SignOutButton } from "./ui/SignOutButton";
