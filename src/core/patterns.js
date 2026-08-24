/**
 * patterns.js — Definición de patrones de victoria como matrices booleanas 5×5.
 * Capa Core: sin dependencias de UI ni red. Testeable en Node puro.
 *
 * Una celda `true` significa que esa posición debe estar marcada para cumplir el patrón.
 * La celda central [2][2] siempre está libre (FREE SPACE) y se considera marcada.
 */

// ─── Tipos de patrón ───────────────────────────────────────────────────────────
export const PATTERN_IDS = {
  ROW_ANY: 'ROW_ANY',
  COL_ANY: 'COL_ANY',
  DIAG_ANY: 'DIAG_ANY',
  FOUR_CORNERS: 'FOUR_CORNERS',
  X_PATTERN: 'X_PATTERN',
  BLACKOUT: 'BLACKOUT',
};

// ─── Generadores de matrices 5×5 ─────────────────────────────────────────────

/** Crea una matriz 5×5 inicializada en false */
const empty = () => Array.from({ length: 5 }, () => Array(5).fill(false));

/** Las 5 matrices de filas horizontales */
const horizontalRows = Array.from({ length: 5 }, (_, r) => {
  const m = empty();
  for (let c = 0; c < 5; c++) m[r][c] = true;
  return m;
});

/** Las 5 matrices de columnas verticales */
const verticalCols = Array.from({ length: 5 }, (_, c) => {
  const m = empty();
  for (let r = 0; r < 5; r++) m[r][c] = true;
  return m;
});

/** Diagonal principal (↘) */
const diagMain = (() => {
  const m = empty();
  for (let i = 0; i < 5; i++) m[i][i] = true;
  return m;
})();

/** Diagonal anti (↗) */
const diagAnti = (() => {
  const m = empty();
  for (let i = 0; i < 5; i++) m[i][4 - i] = true;
  return m;
})();

/** Cuatro esquinas */
const fourCorners = (() => {
  const m = empty();
  m[0][0] = m[0][4] = m[4][0] = m[4][4] = true;
  return m;
})();

/** Patrón en X (ambas diagonales) */
const xPattern = (() => {
  const m = empty();
  for (let i = 0; i < 5; i++) {
    m[i][i] = true;
    m[i][4 - i] = true;
  }
  return m;
})();

/** Blackout / Cartón completo */
const blackout = Array.from({ length: 5 }, () => Array(5).fill(true));

// ─── Catálogo de patrones ─────────────────────────────────────────────────────

/**
 * Cada entrada del catálogo:
 *   id       → identificador único
 *   label    → nombre legible para la UI
 *   matrices → array de matrices 5×5; el jugador gana si cumple ALGUNA de ellas
 *   icon     → emoji representativo para la UI
 */
export const PATTERNS = {
  [PATTERN_IDS.ROW_ANY]: {
    id: PATTERN_IDS.ROW_ANY,
    label: 'Línea Horizontal',
    icon: '➖',
    matrices: horizontalRows,
    description: 'Completa cualquiera de las 5 filas horizontales.',
  },
  [PATTERN_IDS.COL_ANY]: {
    id: PATTERN_IDS.COL_ANY,
    label: 'Línea Vertical',
    icon: '|',
    matrices: verticalCols,
    description: 'Completa cualquiera de las 5 columnas verticales.',
  },
  [PATTERN_IDS.DIAG_ANY]: {
    id: PATTERN_IDS.DIAG_ANY,
    label: 'Diagonal',
    icon: '╲╱',
    matrices: [diagMain, diagAnti],
    description: 'Completa cualquiera de las 2 diagonales.',
  },
  [PATTERN_IDS.FOUR_CORNERS]: {
    id: PATTERN_IDS.FOUR_CORNERS,
    label: 'Cuatro Esquinas',
    icon: '⬛',
    matrices: [fourCorners],
    description: 'Marca las 4 esquinas del cartón.',
  },
  [PATTERN_IDS.X_PATTERN]: {
    id: PATTERN_IDS.X_PATTERN,
    label: 'Patrón en X',
    icon: '✖️',
    matrices: [xPattern],
    description: 'Completa ambas diagonales formando una X.',
  },
  [PATTERN_IDS.BLACKOUT]: {
    id: PATTERN_IDS.BLACKOUT,
    label: 'Cartón Lleno',
    icon: '🎱',
    matrices: [blackout],
    description: 'Marca todas las 25 casillas del cartón.',
  },
};

/** Array ordenado para mostrar en la UI de configuración */
export const PATTERN_LIST = Object.values(PATTERNS);

export default PATTERNS;
