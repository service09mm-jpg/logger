import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * Клієнт Prisma, один на процес.
 *
 * Створюється не при завантаженні модуля, а при першому справжньому запиті.
 * Це важливо для сторінок, які до бази не ходять узагалі: вхід у застосунок
 * має рендеритись і тоді, коли `DATABASE_URL` не налаштовано, — інакше збірка
 * падала б там, де база взагалі не потрібна.
 *
 * У режимі розробки клієнт зберігається в глобальній змінній: Next.js
 * перезавантажує модулі на кожну правку, і без цього кожна правка відкривала б
 * ще одне з'єднання.
 */
export function getPrismaClient(): PrismaClient {
  if (globalForPrisma.prisma !== undefined) {
    return globalForPrisma.prisma;
  }

  const adapter = new PrismaNeon({
    connectionString: process.env.DATABASE_URL,
  });
  const client = new PrismaClient({ adapter });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
    return client;
  }

  globalForPrisma.prisma = client;
  return client;
}
