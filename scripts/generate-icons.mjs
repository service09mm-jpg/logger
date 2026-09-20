// Малює іконки застосунку й кладе їх у `public/` та `src/app/`.
//
// Запуск: `node scripts/generate-icons.mjs` (у package.json навмисно не
// прописаний — іконки перемальовуються раз на рік, а не на кожну збірку).
//
// PNG пишеться вручну, вбудованим `zlib`: заради трьох прямокутників тягнути
// графічну бібліотеку в залежності проєкту не варто. Формат простий — заголовок,
// блок IHDR з розмірами, блок IDAT зі стиснутими рядками пікселів, блок IEND.

import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Темний фон і світлий знак — ті самі кольори, що й у `globals.css`. */
const BACKGROUND = [0x18, 0x18, 0x1b];
const MARK = [0xfa, 0xfa, 0xfa];

/** Три стовпчики, що ростуть, — той самий графік, що й на картці метрики. */
const BAR_HEIGHTS = [0.235, 0.39, 0.547];
const BAR_WIDTH = 0.141;
const BAR_GAP = 0.078;
const BASELINE = 0.774;

/** Полотно `size`×`size`, залите фоном, зі стовпчиками посередині. */
function drawIcon(size) {
  const pixels = Buffer.alloc(size * size * 3);
  for (let i = 0; i < size * size; i += 1) {
    pixels[i * 3] = BACKGROUND[0];
    pixels[i * 3 + 1] = BACKGROUND[1];
    pixels[i * 3 + 2] = BACKGROUND[2];
  }

  const barWidth = Math.round(size * BAR_WIDTH);
  const gap = Math.round(size * BAR_GAP);
  const totalWidth = barWidth * 3 + gap * 2;
  const left = Math.round((size - totalWidth) / 2);
  const baseline = Math.round(size * BASELINE);

  BAR_HEIGHTS.forEach((ratio, index) => {
    const height = Math.round(size * ratio);
    const x0 = left + index * (barWidth + gap);
    for (let y = baseline - height; y < baseline; y += 1) {
      for (let x = x0; x < x0 + barWidth; x += 1) {
        const offset = (y * size + x) * 3;
        pixels[offset] = MARK[0];
        pixels[offset + 1] = MARK[1];
        pixels[offset + 2] = MARK[2];
      }
    }
  });

  return pixels;
}

/** Блок PNG: довжина даних, тип, дані, контрольна сума. */
function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k += 1) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  return c >>> 0;
});

function crc32(buffer) {
  let c = 0xffffffff;
  for (const byte of buffer) {
    c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function encodePng(size, pixels) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8; // вісім біт на канал
  header[9] = 2; // колір RGB без прозорості
  // 10, 11, 12 — стиснення, фільтр і черезрядковість: скрізь стандартний нуль.

  // Кожен рядок пікселів у PNG починається з байта фільтра; нуль означає
  // «без фільтра», тобто пікселі лежать як є.
  const rows = Buffer.alloc(size * (size * 3 + 1));
  for (let y = 0; y < size; y += 1) {
    const from = y * size * 3;
    pixels.copy(rows, y * (size * 3 + 1) + 1, from, from + size * 3);
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(rows, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// 192 і 512 — розміри, яких чекає манифест; 180 — розмір іконки для iPhone.
const TARGETS = [
  [192, "public/icon-192.png"],
  [512, "public/icon-512.png"],
  [180, "src/app/apple-icon.png"],
];

for (const [size, target] of TARGETS) {
  const path = join(ROOT, target);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, encodePng(size, drawIcon(size)));
  console.log(`${target} — ${size}×${size}`);
}
