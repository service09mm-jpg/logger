import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Межі архітектури. Описані в docs/architecture.md; тут вони стають машинними,
// щоб порушення валило CI, а не тонуло в рев'ю.
//
// УВАГА до порядку: у flat-config пізніший блок ПОВНІСТЮ перезаписує однойменне
// правило, а не доповнює його. Тому спільна заборона глибоких імпортів
// повторюється в кожному блоці — інакше вона зникає для тих файлів, які мають
// власний, вужчий набір патернів.

/** Між фічами — тільки через публічний index.ts кожної фічі. */
const crossFeature = {
  group: ["@/features/*/*"],
  message:
    'Глибокий імпорт у чужу фічу заборонений. Бери те, що вона експортує: import { … } from "@/features/<назва>".',
};

const restrict = (...patterns) => ({
  "no-restricted-imports": ["error", { patterns: [crossFeature, ...patterns] }],
});

const architectureBoundaries = defineConfig([
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: restrict(),
  },
  {
    // domain/ — чистий TypeScript. Ні фреймворку, ні бази, ні сусідніх шарів.
    files: ["src/features/*/domain/**/*.{ts,tsx}"],
    rules: restrict(
      {
        group: [
          "react",
          "react-dom",
          "react/*",
          "next",
          "next/*",
          "@prisma/client",
          "@neondatabase/*",
          "@/lib/*",
          "@/app/*",
        ],
        message:
          "domain/ мусить лишатись чистим TypeScript: без React, Next і Prisma. Логіка, залежна від фреймворку, належить до data/ або ui/.",
      },
      {
        group: ["../data/*", "../ui/*", "../../*/data/*", "../../*/ui/*"],
        message:
          "domain/ не знає про шари над собою. Правило залежностей: app → ui → data → domain.",
      },
    ),
  },
  {
    // data/ — єдине місце, де фіча торкається Prisma. React сюди не ходить.
    files: ["src/features/*/data/**/*.{ts,tsx}"],
    rules: restrict({
      group: ["react", "react-dom", "react/*", "../ui/*"],
      message:
        "data/ не рендерить. Компоненти належать до ui/ відповідної фічі.",
    }),
  },
  {
    // app/ тонкий: дістає юзера, кличе фічу, рендерить. Без прямого доступу до БД.
    files: ["src/app/**/*.{ts,tsx}"],
    rules: restrict({
      group: ["@prisma/client", "@/lib/prisma", "@neondatabase/*"],
      message:
        "Роути й Server Actions не звертаються до Prisma напряму — тільки через data/ відповідної фічі.",
    }),
  },
]);

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  ...architectureBoundaries,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
