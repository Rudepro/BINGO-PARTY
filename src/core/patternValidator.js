/**
 * patternValidator.js — Verificación de patrones de victoria.
 * Capa Core: sin dependencias de UI ni red. Testeable en Node puro.
 *
 * La verificación es la fuente de verdad del juego.
 * Nunca confiar en el estado del cliente; siempre validar contra
 * el registro de bolas llamadas Y el cartón almacenado en el servidor.
 */

import { letterForNumber } from './cardGenerator.js';

// ─── Función principal ────────────────────────────────────────────────────────

/**
 * Verifica si un cartón cumple AL MENOS UNO de los patrones activos.
 *
 * La verificación es independiente del marcado del cliente:
 * recalcula qué celdas deberían estar marcadas dado el conjunto
 * oficial de bolas llamadas.
 *
 * @param {number[][]} grid      - Cartón: grid[col][row], 0 = FREE SPACE.
 * @param {number[]}   calledBalls - Números oficialmente llamados por el host.
 * @param {Object[]}   patterns  - Array de patrones activos (cada uno tiene `matrices`).
 * @returns {{ valid: boolean, matchedPattern: string|null, verifiedMarked: boolean[][] }}
 */
export function validateCard(grid, calledBalls, patterns) {
  const calledSet = new Set(calledBalls);

  // Calcular matriz de marcado verificada (ignorando el marcado local del cliente)
  // marked[row][col]
  const verifiedMarked = Array.from({ length: 5 }, (_, row) =>
    Array.from({ length: 5 }, (_, col) => {
      const num = grid[col][row];
      return num === 0 || calledSet.has(num); // 0 = FREE SPACE (siempre marcado)
    })
  );

  // Comprobar cada patrón activo
  for (const pattern of patterns) {
    for (const matrix of pattern.matrices) {
      if (checkMatrix(verifiedMarked, matrix)) {
        return { valid: true, matchedPattern: pattern.id, verifiedMarked };
      }
    }
  }

  return { valid: false, matchedPattern: null, verifiedMarked };
}

/**
 * Comprueba si la matriz de marcado satisface una matriz de patrón.
 *
 * @param {boolean[][]} marked  - marked[row][col]
 * @param {boolean[][]} matrix  - matrix[row][col] del patrón
 * @returns {boolean}
 */
function checkMatrix(marked, matrix) {
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      if (matrix[row][col] && !marked[row][col]) return false;
    }
  }
  return true;
}

/**
 * Valida si un jugador ha ganado comprobando TODOS sus cartones.
 * Retorna el primer cartón válido encontrado.
 *
 * @param {number[][][]} cards       - Array de cartones del jugador (grid[col][row]).
 * @param {number[]}     calledBalls - Bolas llamadas oficialmente.
 * @param {Object[]}     patterns    - Patrones activos.
 * @returns {{ valid: boolean, cardIndex: number|null, matchedPattern: string|null }}
 */
export function validatePlayerBingo(cards, calledBalls, patterns) {
  for (let i = 0; i < cards.length; i++) {
    const result = validateCard(cards[i], calledBalls, patterns);
    if (result.valid) {
      return { valid: true, cardIndex: i, matchedPattern: result.matchedPattern };
    }
  }
  return { valid: false, cardIndex: null, matchedPattern: null };
}

/**
 * Calcula el progreso de un cartón para un patrón dado.
 * Útil para mostrar el indicador de progreso en la UI.
 *
 * @param {number[][]} grid
 * @param {number[]}   calledBalls
 * @param {Object}     pattern
 * @returns {{ filled: number, total: number, pct: number }} porcentaje de avance
 */
export function cardProgress(grid, calledBalls, pattern) {
  const calledSet = new Set(calledBalls);
  let filled = 0;
  let total = 0;

  // Usar la primera matriz del patrón como referencia
  const matrix = pattern.matrices[0];
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      if (!matrix[row][col]) continue;
      total++;
      const num = grid[col][row];
      if (num === 0 || calledSet.has(num)) filled++;
    }
  }

  return { filled, total, pct: total === 0 ? 0 : Math.round((filled / total) * 100) };
}

export { letterForNumber };
