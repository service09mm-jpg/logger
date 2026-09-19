import { describe, expect, it } from "vitest";
import {
  isValidEmail,
  isValidPassword,
  MIN_PASSWORD_LENGTH,
  normalizeEmail,
} from "./credentials";

describe("normalizeEmail", () => {
  it("прибирає пробіли й зводить до нижнього регістру", () => {
    expect(normalizeEmail("  Some.User@Example.COM ")).toBe(
      "some.user@example.com"
    );
  });
});

describe("isValidEmail", () => {
  it("приймає звичайну адресу", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
    expect(isValidEmail(" User@Example.com ")).toBe(true);
  });

  it("відкидає те, що адресою не є", () => {
    expect(isValidEmail("")).toBe(false);
    expect(isValidEmail("user")).toBe(false);
    expect(isValidEmail("user@example")).toBe(false);
    expect(isValidEmail("user @example.com")).toBe(false);
    expect(isValidEmail("@example.com")).toBe(false);
  });
});

describe("isValidPassword", () => {
  it("вимагає мінімальну довжину", () => {
    expect(isValidPassword("a".repeat(MIN_PASSWORD_LENGTH - 1))).toBe(false);
    expect(isValidPassword("a".repeat(MIN_PASSWORD_LENGTH))).toBe(true);
  });

  it("не приймає надмірно довгий пароль", () => {
    expect(isValidPassword("a".repeat(1000))).toBe(false);
  });

  it("не чіпає пробіли всередині пароля", () => {
    expect(isValidPassword("два слова")).toBe(true);
  });
});
