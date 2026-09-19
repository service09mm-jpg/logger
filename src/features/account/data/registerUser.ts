import { hashPassword } from "@/lib/password";
import { getPrismaClient } from "@/lib/prisma";
import { isValidEmail, isValidPassword, normalizeEmail } from "../domain/credentials";

/**
 * Чим закінчилась реєстрація.
 *
 * Не виняток, а звичайне значення: «таку пошту вже зайнято» — це не поломка,
 * а нормальний хід подій, який треба показати юзеру.
 */
export type RegistrationResult =
  | { status: "created"; email: string }
  | { status: "invalid-email" }
  | { status: "weak-password" }
  | { status: "email-taken" };

/** Створює юзера з паролем. Пароль у базу потрапляє лише як хеш. */
export async function registerUser(
  email: string,
  password: string
): Promise<RegistrationResult> {
  if (!isValidEmail(email)) {
    return { status: "invalid-email" };
  }
  if (!isValidPassword(password)) {
    return { status: "weak-password" };
  }

  const normalizedEmail = normalizeEmail(email);

  const existingUser = await getPrismaClient().user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  });

  if (existingUser !== null) {
    return { status: "email-taken" };
  }

  await getPrismaClient().user.create({
    data: {
      email: normalizedEmail,
      passwordHash: await hashPassword(password),
    },
    select: { id: true },
  });

  return { status: "created", email: normalizedEmail };
}
