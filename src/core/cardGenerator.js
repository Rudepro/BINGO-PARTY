/**
 * cardGenerator.js — Generador de cartones de Bingo americano (75 bolas).
 * Capa Core: sin dependencias de UI ni red. Testeable en Node puro.
 *
 * Distribución de columnas:
 *   B: 1–15   I: 16–30   N: 31–45   G: 46–60   O: 61–75
 * La celda central N[2][2] (fila 3, columna N) siempre es el FREE SPACE (0).
 */

const COLUMN_RANGES = [
  { letter: 'B', min: 1,  max: 15  }, // col 0
  { letter: 'I', min: 16, max: 30  }, // col 1
  { letter: 'N', min: 31, max: 45  }, // col 2
  { letter: 'G', min: 46, max: 60  }, // col 3
  { letter: 'O', min: 61, max: 75  }, // col 4
];

const FREE_ROW = 2;
const FREE_COL = 2;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Genera un array de enteros [min, max] barajado con Fisher-Yates */
function shuffledRange(min, max) {
  const arr = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Devuelve la letra BINGO correspondiente a un número (1–75) */
export function letterForNumber(n) {
  if (n >= 1  && n <= 15) return 'B';
  if (n >= 16 && n <= 30) return 'I';
  if (n >= 31 && n <= 45) return 'N';
  if (n >= 46 && n <= 60) return 'G';
  if (n >= 61 && n <= 75) return 'O';
  return '?';
}

// ─── Generación de un cartón ──────────────────────────────────────────────────

/**
 * Genera un cartón de Bingo válido.
 *
 * Estructura del cartón: matriz 5×5 de números.
 * - Cada columna tiene 5 números únicos dentro de su rango.
 * - La celda central (fila 2, col 2) es 0 → FREE SPACE.
 *
 * @param {Set<string>} usedSignatures - Firmas de cartones ya generados en la sala.
 *   Se usa para garantizar cartones únicos entre jugadores.
 * @returns {{ grid: number[][], signature: string }}
 */
export function generateCard(usedSignatures = new Set()) {
  let grid, signature;
  let attempts = 0;

  do {
    grid = [];
    for (let col = 0; col < 5; col++) {
      const { min, max } = COLUMN_RANGES[col];
      const nums = shuffledRange(min, max).slice(0, 5);
      grid.push(nums); // grid[col][row]
    }
    // Marcar FREE SPACE
    grid[FREE_COL][FREE_ROW] = 0;

    // La firma es el string serializado de todos los números (por columna)
    signature = grid.map(col => col.join(',')).join('|');
    attempts++;

    if (attempts > 1000) {
      throw new Error('No se pudo generar un cartón único después de 1000 intentos.');
    }
  } while (usedSignatures.has(signature));

  return { grid, signature };
}

/**
 * Genera múltiples cartones únicos para un jugador.
 *
 * @param {number} count - Número de cartones (1–3).
 * @param {Set<string>} usedSignatures - Firmas ya usadas en la sala (se modifica in-place).
 * @returns {number[][][]} Array de `count` cartones (cada uno es grid[col][row]).
 */
export function generatePlayerCards(count, usedSignatures = new Set()) {
  const cards = [];
  for (let i = 0; i < count; i++) {
    const { grid, signature } = generateCard(usedSignatures);
    usedSignatures.add(signature);
    cards.push(grid);
  }
  return cards;
}

/**
 * Convierte el grid interno [col][row] al formato de display [row][col]
 * para renderizar la cuadrícula visualmente correcta (B I N G O por columnas).
 *
 * @param {number[][]} grid - grid[col][row]
 * @returns {number[][]} display[row][col]
 */
export function gridToDisplay(grid) {
  return Array.from({ length: 5 }, (_, row) =>
    Array.from({ length: 5 }, (_, col) => grid[col][row])
  );
}

/**
 * Crea la matriz de celdas marcadas inicial para un cartón.
 * Solo el FREE SPACE (fila 2, col 2) está premarcado.
 *
 * @returns {boolean[][]} marked[row][col]
 */
export function initialMarkedCells() {
  return Array.from({ length: 5 }, (_, row) =>
    Array.from({ length: 5 }, (_, col) => row === FREE_ROW && col === FREE_COL)
  );
}

export { COLUMN_RANGES, FREE_ROW, FREE_COL };
