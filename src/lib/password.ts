import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

/**
 * Хешування паролів.
 *
 * Використовується scrypt із вбудованого модуля Node — окрема бібліотека
 * (bcrypt, argon2) не потрібна. scrypt навмисно повільний і вимогливий до
 * пам'яті, тому перебір по вкраденій базі коштує дорого.
 *
 * Сіль генерується своя на кожен пароль і зберігається поруч із хешем одним
 * рядком "сіль:хеш". Однакові паролі двох юзерів дають різні хеші, тож із
 * бази не видно, що вони однакові.
 */

/** Довжина похідного ключа в байтах. */
const KEY_LENGTH = 64;
/** Довжина солі в байтах. */
const SALT_LENGTH = 16;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH).toString("hex");
  const key = await deriveKey(password, salt, KEY_LENGTH);
  return `${salt}:${key.toString("hex")}`;
}

/**
 * Чи підходить пароль до збереженого хеша.
 *
 * Порівняння йде через `timingSafeEqual`, а не через `===`: звичайне
 * порівняння рядків завершується на першому відмінному байті, і за часом
 * відповіді можна вгадувати хеш посимвольно.
 */
export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  const separatorIndex = storedHash.indexOf(":");
  if (separatorIndex === -1) {
    return false;
  }

  const salt = storedHash.slice(0, separatorIndex);
  const expected = Buffer.from(storedHash.slice(separatorIndex + 1), "hex");
  if (expected.length !== KEY_LENGTH) {
    return false;
  }

  const actual = await deriveKey(password, salt, KEY_LENGTH);
  return timingSafeEqual(expected, actual);
}

/** Обгортка над scrypt з колбеком, щоб решта файлу читалась як звичайний async. */
function deriveKey(
  password: string,
  salt: string,
  keyLength: number
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, keyLength, (error, derivedKey) => {
      if (error !== null) {
        reject(error);
        return;
      }
      resolve(derivedKey);
    });
  });
}
