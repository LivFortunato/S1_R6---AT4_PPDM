/**
 * Ajuda a identificar as músicas que ainda são de exemplo.
 *
 * No início do projeto os arquivos em assets/audio/ são .mp3 silenciosos
 * (gerados por scripts/generate-placeholder-audio.mjs) só para o app
 * conseguir rodar. Quando você colocar as suas músicas de verdade,
 * apague a linha `placeholder: true` de cada música em playlist.js
 * (ou apague o arquivo inteiro, se quiser o comportamento padrão = false).
 */

/** true se a música ainda é de exemplo (não tem som de verdade). */
export function isPlaceholder(track) {
  return Boolean(track?.placeholder);
}