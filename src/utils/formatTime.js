/**
 * Converte segundos em "mm:ss" (ex.: 185 -> "3:05")
 */
export function formatTime(seconds) {
  if (!seconds || seconds < 0 || Number.isNaN(seconds)) return '0:00';

  const total = Math.floor(seconds);
  const minutes = Math.floor(total / 60);
  const rest = total % 60;

  return `${minutes}:${rest < 10 ? '0' : ''}${rest}`;
}