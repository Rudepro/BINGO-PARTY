/**
 * idGenerator.js — Generación de códigos de sala únicos.
 */

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Sin O, 0, I, 1 para evitar confusión

/**
 * Genera un código de sala alfanumérico de `length` caracteres.
 * @param {number} length
 * @returns {string}
 */
export function generateRoomCode(length = 6) {
  return Array.from(
    { length },
    () => CHARS[Math.floor(Math.random() * CHARS.length)]
  ).join('');
}

/**
 * Genera un ID de jugador único (base UUID simple).
 * @returns {string}
 */
export function generatePlayerId() {
  return 'p_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}
