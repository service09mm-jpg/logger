import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getPrismaClient } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { isValidEmail, normalizeEmail } from "../domain/credentials";

/**
 * Налаштування Auth.js: вхід за поштою й паролем.
 *
 * Провайдер `Credentials` не вміє зберігати сесію в базі — Auth.js це
 * забороняє навмисно, — тому сесія їде в підписаному кукі (стратегія `jwt`).
 * Підписує її `AUTH_SECRET`: без цієї змінної оточення застосунок не
 * запрацює взагалі.
 *
 * `authorize` — єдине місце, де перевіряється пароль. Воно повертає або
 * юзера, або `null`; жодних повідомлень про те, що саме не зійшлось, звідси
 * не виходить: за різницею між «такої пошти немає» і «пароль не той» можна
 * перебирати, хто зареєстрований.
 */
export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  // Auth.js за замовчуванням не довіряє заголовку Host і поза Vercel падає з
  // помилкою UntrustedHost — зокрема на localhost.
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "email", type: "email" },
        password: { label: "password", type: "password" },
      },
      async authorize(credentials) {
        const email = asString(credentials.email);
        const password = asString(credentials.password);

        if (!isValidEmail(email) || password.length === 0) {
          return null;
        }

        const user = await getPrismaClient().user.findUnique({
          where: { email: normalizeEmail(email) },
          select: { id: true, email: true, name: true, passwordHash: true },
        });

        if (user === null) {
          return null;
        }

        const passwordMatches = await verifyPassword(password, user.passwordHash);
        if (!passwordMatches) {
          return null;
        }

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  callbacks: {
    // У токені за замовчуванням лежить лише те, що поклали при вході. Ці два
    // колбеки переносять id юзера з токена в сесію, щоб решта застосунку
    // читала його звично — через `session.user.id`.
    jwt({ token, user }) {
      if (user !== undefined && user.id !== undefined) {
        token.sub = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (token.sub !== undefined) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});

/** Поля форми приходять як `unknown` — усе, що не рядок, вважаємо порожнім. */
function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}
