/**
 * Gera os ícones do app (icon.png, adaptive-icon.png, splash-icon.png, favicon.png)
 * sem precisar de nenhuma biblioteca externa: escreve o PNG na mão
 * usando apenas o `zlib` que já vem com o Node.
 *
 * Uso:  node scripts/generate-icons.mjs
 */

import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

/* ─────────────────────────── PNG (escrita à mão) ─────────────────────────── */

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buffer) {
  let crc = -1;
  for (let i = 0; i < buffer.length; i++) {
    crc = CRC_TABLE[(crc ^ buffer[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ -1) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData), 0);
  return Buffer.concat([length, typeAndData, crc]);
}

/** Cria um buffer RGBA (vazio/transparente) com `size` x `size` pixels. */
function createCanvas(size) {
  return { size, pixels: new Uint8Array(size * size * 4) };
}

/** "src over" dst: pinta a cor `color` com a opacidade `alpha`. */
function blend(canvas, x, y, color, alpha) {
  if (alpha <= 0) return;
  const i = (y * canvas.size + x) * 4;
  const px = canvas.pixels;
  const srcA = Math.min(Math.max(alpha, 0), 1);
  const dstA = px[i + 3] / 255;
  const outA = srcA + dstA * (1 - srcA);
  if (outA === 0) return;

  for (let c = 0; c < 3; c++) {
    const src = color[c];
    const dst = px[i + c];
    px[i + c] = Math.round((src * srcA + dst * dstA * (1 - srcA)) / outA);
  }
  px[i + 3] = Math.round(outA * 255);
}

/**
 * Pinta a forma em todo pixel onde `sdf(x, y) < 0`.
 * A borda fica suave (antialias) usando o valor da distância.
 */
function fill(canvas, sdf, color) {
  for (let y = 0; y < canvas.size; y++) {
    for (let x = 0; x < canvas.size; x++) {
      const d = sdf(x + 0.5, y + 0.5);
      if (d < 0.5) blend(canvas, x, y, color, 0.5 - d);
    }
  }
}

function save(canvas, file) {
  const { size, pixels } = canvas;

  // Cada linha do PNG começa com o byte do filtro (0 = sem filtro)
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    Buffer.from(pixels.buffer, y * size * 4, size * 4).copy(raw, y * (size * 4 + 1) + 1);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // 8 bits por canal
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);

  writeFileSync(file, png);
  console.log(`ok -> ${file} (${size}x${size}, ${png.length} bytes)`);
}

/* ─────────────────────────── Formas (distância) ─────────────────────────── */

/** Distância até um retângulo com cantos arredondados. */
function sdRoundRect(px, py, cx, cy, hw, hh, r) {
  const qx = Math.abs(px - cx) - (hw - r);
  const qy = Math.abs(py - cy) - (hh - r);
  return (
    Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r
  );
}

/** Distância até um segmento de reta com pontas arredondadas (pílula). */
function sdCapsule(px, py, ax, ay, bx, by, r) {
  const pax = px - ax;
  const pay = py - ay;
  const bax = bx - ax;
  const bay = by - ay;
  const h = Math.min(Math.max((pax * bax + pay * bay) / (bax * bax + bay * bay || 1), 0), 1);
  return Math.hypot(pax - bax * h, pay - bay * h) - r;
}

/* ─────────────────────────── O desenho do ícone ─────────────────────────── */

const GREEN = [29, 185, 84];
const BLACK = [11, 11, 11];

// 4 barras com alturas diferentes (visual de "equalizador" de música)
const HEIGHTS = [0.42, 0.72, 0.55, 0.86];
const BAR_RATIO = 0.105; // largura da barra / tamanho da imagem
const GAP_RATIO = 0.045; // espaço entre as barras / tamanho da imagem

/** Desenha as 4 barras centralizadas. */
function drawBars(canvas, color, scale, centerY) {
  const size = canvas.size;
  const barW = size * BAR_RATIO;
  const gap = size * GAP_RATIO;
  const totalW = barW * HEIGHTS.length + gap * (HEIGHTS.length - 1);
  const maxH = size * scale;
  const r = barW / 2;

  HEIGHTS.forEach((h, i) => {
    const x = (size - totalW) / 2 + i * (barW + gap) + barW / 2;
    const barH = maxH * h;
    fill(
      canvas,
      (px, py) => sdCapsule(px, py, x, centerY - barH / 2 + r, x, centerY + barH / 2 - r, r),
      color
    );
  });
}

/** Fundo verde de cantos arredondados (formato do ícone do app). */
function drawBackground(canvas, color) {
  const size = canvas.size;
  fill(canvas, (px, py) => sdRoundRect(px, py, size / 2, size / 2, size / 2, size / 2, size * 0.2), color);
}

/* ─────────────────────────── Gera os arquivos ─────────────────────────── */

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, '..', 'assets', 'images');
mkdirSync(outDir, { recursive: true });

// 1) Ícone do app: fundo verde + barras pretas
const icon = createCanvas(1024);
drawBackground(icon, GREEN);
drawBars(icon, BLACK, 0.52, 512);
save(icon, join(outDir, 'icon.png'));

// 2) Ícone adaptativo do Android: só as barras (o fundo é #121212)
const adaptive = createCanvas(1024);
drawBars(adaptive, GREEN, 0.4, 512);
save(adaptive, join(outDir, 'adaptive-icon.png'));

// 3) Ícone da tela de abertura
const splash = createCanvas(512);
drawBars(splash, GREEN, 0.62, 256);
save(splash, join(outDir, 'splash-icon.png'));

// 4) Favicon do site
const favicon = createCanvas(96);
drawBackground(favicon, GREEN);
drawBars(favicon, BLACK, 0.52, 48);
save(favicon, join(outDir, 'favicon.png'));