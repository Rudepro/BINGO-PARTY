/**
 * colorPalette.js — Colores de marcado por cartón y columna BINGO.
 */

/** Color de acento para cada cartón (índice 0, 1, 2) */
export const CARD_COLORS = [
  { name: 'Rojo',    accent: '#ef4444', light: '#fca5a5', bg: '#450a0a' },
  { name: 'Azul',    accent: '#3b82f6', light: '#93c5fd', bg: '#172554' },
  { name: 'Amarillo',accent: '#f59e0b', light: '#fcd34d', bg: '#451a03' },
];

/** Color de bola por columna BINGO */
export const COLUMN_COLORS = {
  B: { bg: '#7c3aed', text: '#fff' }, // Violeta
  I: { bg: '#0891b2', text: '#fff' }, // Cyan
  N: { bg: '#15803d', text: '#fff' }, // Verde
  G: { bg: '#b45309', text: '#fff' }, // Naranja/Dorado
  O: { bg: '#be185d', text: '#fff' }, // Rosa
};

/** Colores de estado de jugador */
export const STATUS_COLORS = {
  waiting:    '#6b7280',
  playing:    '#22c55e',
  eliminated: '#ef4444',
  winner:     '#f59e0b',
};

export function getCardColor(index) {
  return CARD_COLORS[index % CARD_COLORS.length];
}

export function getColumnColor(letter) {
  return COLUMN_COLORS[letter] ?? { bg: '#374151', text: '#fff' };
}
