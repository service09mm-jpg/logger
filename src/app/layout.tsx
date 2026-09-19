import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getCurrentUser } from "@/features/account";
import { DEFAULT_LOCALE } from "@/shared/i18n";
import { TimeZoneSync } from "./_components/TimeZoneSync";
import { getTimeZone, TIME_ZONE_COOKIE } from "./_lib/requestContext";
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
};

/**
 * Кореневий макет. Тут визначається лише мова документа й надсилається
 * таймзона — усе інше малюють самі сторінки.
 */
export default async function RootLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();
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
