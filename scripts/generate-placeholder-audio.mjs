/**
 * Gera músicas de exemplo (silenciosas, mas com .mp3 válido) em assets/audio/.
 *
 * Por que isso existe: o Metro precisa que o arquivo exista no momento de gerar
 * o bundle. Sem um .mp3 real no projeto, o `require()` em src/data/playlist.js
 * quebra com "Unable to resolve ...mp3".
 *
 * >>> ESTES ARQUIVOS SÃO PLACEHOLDERS. TROQUE PELAS SUAS MÚSICAS DE VERDADE. <<<
 *
 * Uso:  npm run audio:placeholder
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

/* ───────────── Parâmetros do MPEG-1 Layer III ─────────────
   44100 Hz · 128 kbps · estéreo (sem CRC) */
const SAMPLE_RATE = 44100;
const BITRATE = 128000;
const SAMPLES_PER_FRAME = 1152; // um frame por camada 3
const CHANNELS = 2;
const FRAME_SIZE = Math.floor((SAMPLES_PER_FRAME / 8) * BITRATE / SAMPLE_RATE); // 417 bytes

/**
 * Monta um frame MPEG-1 Layer III "mudo".
 * O cabeçalho diz 128 kbps / 44100 Hz / estéreo e o side info fica zerado,
 * com part2_3_length = 0 — ou seja, o frame decodifica como silêncio.
 */
function makeSilentFrame(withXing) {
  const frame = Buffer.alloc(FRAME_SIZE);

  // ── Cabeçalho do frame (4 bytes) ──
  frame[0] = 0xff; // sync (11 bits)
  frame[1] = 0xfb; // MPEG-1 · Layer III · sem CRC
  frame[2] = 0x90; // 128 kbps · 44100 Hz · sem padding
  frame[3] = 0x00; // estéreo

  // ── Side info (32 bytes para MPEG-1 estéreo), já zerado = silêncio ──
  // main_data_begin(9) + private_bits(3) + scfsi(4×2) + part2_3_length(4×4)

  if (withXing) {
    // Escreve a tag "Info" logo após o side info para gravar a contagem de frames.
    // Sem isso, alguns players demoram a descobrir a duração do arquivo.
    const infoOffset = 4 + 32;
    frame.write('Info', infoOffset, 'ascii');
    // flags: bit0 = número de frames presente
    frame.writeUInt32BE(0x00000001, infoOffset + 4);
    return frame;
  }

  return frame;
}

/** Patch do cabeçalho Info: grava o total de frames (offsets 36..39). */
function patchInfoHeader(frame, totalFrames) {
  const infoOffset = 4 + 32;
  const bytesPerFrame = FRAME_SIZE;
  frame.writeUInt32BE(totalFrames, infoOffset + 8); // nº de frames
  frame.writeUInt32BE(totalFrames * bytesPerFrame, infoOffset + 12); // tamanho em bytes
  return frame;
}

/** Cria um .mp3 mudo com a duração pedida (em segundos). */
export function makeSilentMp3(seconds) {
  const totalFrames = Math.max(1, Math.round((seconds * SAMPLE_RATE) / SAMPLES_PER_FRAME));

  // Primeiro frame com a tag Info (metadados de duração)
  const header = patchInfoHeader(makeSilentFrame(true), totalFrames);
  // Restante dos frames: silêncio puro
  const rest = makeSilentFrame(false);

  const parts = [header];
  for (let i = 1; i < totalFrames; i++) parts.push(rest);

  return Buffer.concat(parts);
}

/* ─────────────────────────── Gera os arquivos ─────────────────────────── */

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, '..', 'assets', 'audio');
mkdirSync(outDir, { recursive: true });

// Durações variadas só para a barra de progresso mostrar algo diferente em cada faixa.
const tracks = [
  { file: 'henriqueejulianooficial-desbeijar-minha-boca-c2f932ee.mp3', seconds: 157 },
  { file: 'henriqueejulianooficial-lembranca-boa-9a51e0fc.mp3', seconds: 178 },
  { file: 'henriqueejulianooficial-quem-pegou-pegou-b0f3933d.mp3', seconds: 183 },
  { file: 'hungriahiphop-amor-e-fe-a4c807bb.mp3', seconds: 322},
  { file: 'hungriahiphop-coracao-de-aco-wwwpalcomp3comdjmixer-djmixeroficial-7f241d60.mp3', seconds: 244 },
];

for (const { file, seconds } of tracks) {
  const mp3 = makeSilentMp3(seconds);
  writeFileSync(join(outDir, file), mp3);
  console.log(`ok -> assets/audio/${file} (${seconds}s, ${mp3.length} bytes)`);
}

console.log('\nATENÇÃO: estes .mp3 são silenciosos. Substitua pelos seus.');