import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { DEFAULT_LOCALE } from "@/shared/i18n";
import { TimeZoneSync } from "./_components/TimeZoneSync";
import {
  getSessionUser,
  getTimeZone,
  TIME_ZONE_COOKIE,
} from "./_lib/requestContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Logger",
  description: "Трекер довільних метрик",
  // Safari читає `display: "standalone"` з манифеста не в усіх версіях, тому
  // для iPhone лишається ще й старий спосіб сказати те саме. Next.js
  // перетворює це на теги `apple-mobile-web-app-*`, які Safari розуміє давно.
  appleWebApp: {
    capable: true,
    title: "Logger",
    statusBarStyle: "default",
  },
};

/**
 * Колір системної смуги над застосунком.
 *
 * Окремий експорт, а не поле `metadata`: у Next.js 16 усе, що стосується
 * області перегляду, живе тут. Два значення — щоб смуга збігалася з фоном і в
 * світлій, і в темній темі, інакше вона світитиме чужим кольором.
 */
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

/**
 * Кореневий макет. Тут визначається лише мова документа й надсилається
 * таймзона — усе інше малюють самі сторінки.
 */
export default async function RootLayout({ children }: LayoutProps<"/">) {
  const user = await getSessionUser();
  const timeZone = await getTimeZone();

  return (
    <html
      lang={user?.locale ?? DEFAULT_LOCALE}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <TimeZoneSync cookieName={TIME_ZONE_COOKIE} currentValue={timeZone} />
        {children}
      </body>
    </html>
  );
}
