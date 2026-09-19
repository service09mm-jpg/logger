# Logger

Трекер довільних метрик: юзер сам визначає, що рахувати, і логує значення.
Що будуємо — `docs/spec.md`, як будуємо — `docs/architecture.md`.

## Що треба налаштувати перед першим запуском

Застосунок не працюватиме, поки в оточенні (локально — `.env.local`, на
Vercel — Settings → Environment Variables) не з'являться три змінні. Їхній
перелік і коментарі — у `.env.example`.

1. **`DATABASE_URL` і `DIRECT_URL`** — уже є, якщо база підключена через
   Vercel Storage.
2. **`AUTH_SECRET`** — ним підписується кукі сесії. Згенерувати можна
   командою `npx auth secret`, або взяти будь-який довгий випадковий рядок.

Вхід — за поштою й паролем, жодних зовнішніх провайдерів і жодних інших
ключів не потрібно. Реєстрація відкрита: хто знає адресу застосунку, той
може створити акаунт. Це свідомо — застосунок для автора й кількох
знайомих, і запрошень у ньому немає.

Скидання пароля поки немає. Якщо пароль забуто, його можна замінити лише
руками в базі (Neon SQL editor), поклавши туди новий хеш.

Далі — стандартна довідка `create-next-app`.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
