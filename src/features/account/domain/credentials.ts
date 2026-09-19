/**
 * Правила для пошти й пароля.
 *
 * Чистий TypeScript: ці ж перевірки потрібні і при реєстрації, і при вході,
 * і їх можна прочитати, не знаючи ні Next.js, ні Prisma.
 */

/** Коротший пароль не приймається. */
export const MIN_PASSWORD_LENGTH = 8;

/** Довший — теж: дуже довгий рядок робить хешування дорогим без користі. */
export const MAX_PASSWORD_LENGTH = 200;

// Навмисно проста перевірка: повна граматика поштових адрес зі стандарту
// пропускає такі рідкісні форми, що користі від неї нуль, а помилок багато.
// Реальну адресу все одно підтверджує лише лист, якого ми не шлемо.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Пошта в тому вигляді, в якому вона лягає в базу: без пробілів і в нижньому регістрі. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(normalizeEmail(email));
}

export function isValidPassword(password: string): boolean {
  return (
    password.length >= MIN_PASSWORD_LENGTH &&
    password.length <= MAX_PASSWORD_LENGTH
  );
}
