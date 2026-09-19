// Публічний API фічі «акаунт»: хто зараз у сесії та якою мовою з ним говорити.

export { getCurrentUser, updateUserLocale } from "./data/currentUser";
export type { CurrentUser } from "./data/currentUser";
export { LocalePicker } from "./ui/LocalePicker";
export { SignInButton } from "./ui/SignInButton";
export { SignOutButton } from "./ui/SignOutButton";
