import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { getPrismaClient } from "./prisma";

/**
 * Налаштування Auth.js. Єдиний провайдер — Google: паролів, скидання пароля й
 * поштового провайдера в застосунку немає взагалі.
 *
 * Ключі беруться з env-змінних `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` і
 * `AUTH_SECRET` — Auth.js знаходить їх за назвою сам, передавати не треба.
 *
 * Сесії зберігаються в базі (таблиця `Session`), а не в JWT: вихід із акаунта
 * тоді справді завершує сесію, а не чекає, поки протухне токен.
 *
 * Про пастку з edge-рантаймом: у Next.js 16 middleware перейменовано на
 * `proxy` і він виконується в Node.js. Ми до того ж не використовуємо ні
 * middleware, ні proxy — кожна сторінка сама питає `auth()`, — тому ділити
 * конфіг надвоє, як радять гайди, тут не потрібно.
 */
export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(getPrismaClient()),
  providers: [Google],
  session: { strategy: "database" },
  // Auth.js за замовчуванням не довіряє заголовку Host і на будь-якому домені,
  // крім Vercel, відмовляється працювати з помилкою UntrustedHost — зокрема на
  // localhost. Адреси, куди Google може повернути юзера, все одно обмежені
  // списком у самому Google, тому довіряти хосту тут безпечно.
  trustHost: true,
  pages: {
    signIn: "/login",
  },
});
