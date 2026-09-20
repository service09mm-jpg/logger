import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("hashPassword", () => {
  it("не зберігає пароль у відкритому вигляді", async () => {
    const hash = await hashPassword("correct horse battery staple");
    expect(hash).not.toContain("correct horse battery staple");
  });

  it("дає різні хеші для однакових паролів — сіль щоразу нова", async () => {
    const first = await hashPassword("однаковий-пароль");
    const second = await hashPassword("однаковий-пароль");
    expect(first).not.toBe(second);
  });
});

describe("verifyPassword", () => {
  it("приймає правильний пароль", async () => {
    const hash = await hashPassword("правильний-пароль");
    await expect(verifyPassword("правильний-пароль", hash)).resolves.toBe(true);
  });

  it("відхиляє неправильний пароль", async () => {
    const hash = await hashPassword("правильний-пароль");
    await expect(verifyPassword("неправильний", hash)).resolves.toBe(false);
  });

  it("розрізняє регістр", async () => {
    const hash = await hashPassword("Пароль");
    await expect(verifyPassword("пароль", hash)).resolves.toBe(false);
  });

  it("не падає на зіпсованому хеші, а просто не пускає", async () => {
    await expect(verifyPassword("будь-що", "")).resolves.toBe(false);
    await expect(verifyPassword("будь-що", "без-двокрапки")).resolves.toBe(false);
    await expect(verifyPassword("будь-що", "сіль:не-шістнадцятковий")).resolves.toBe(
      false
    );
    await expect(verifyPassword("будь-що", "сіль:aabbcc")).resolves.toBe(false);
  });

  it("працює з паролем із пробілами й не-латиницею", async () => {
    const hash = await hashPassword("  пароль з пробілами  ");
    await expect(verifyPassword("  пароль з пробілами  ", hash)).resolves.toBe(
      true
    );
    await expect(verifyPassword("пароль з пробілами", hash)).resolves.toBe(false);
  });
});
