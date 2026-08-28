/**
 * bingoValidator.js — Verificación automática de BINGO.
 * Capa Core: sin dependencias de UI ni red. Testeable en Node puro.
 *
 * Usa los números oficialmente cantados (calledSet) para determinar
 * si un jugador tiene un patrón válido — sin depender del marcado manual.
 */

import { PATTERNS } from './patterns.js';
import { gridToDisplay } from './cardGenerator.js';

/**
 * Verifica si alguno de los cartones del jugador completa alguno de los
 * patrones activos usando únicamente los números oficialmente cantados.
 *
 * @param {number[][][]} cards       - Cartones [cardIdx][col][row]
 * @param {Set<number>}  calledSet   - Números oficialmente cantados
 * @param {string[]}     patternIds  - IDs de patrones activos de la sala
 * @param {string[]}     wonPatternIds - IDs de patrones ya ganados (para no repetir)
 * @returns {{ valid: boolean, matchedPatternId: string|null, matchedPatternLabel: string|null }}
 */
export function checkBingo(cards, calledSet, patternIds, wonPatternIds = []) {
  const wonSet = new Set(wonPatternIds);

  for (const card of cards) {
    const display = gridToDisplay(card); // display[row][col]

    for (const patternId of patternIds) {
      // Saltar patrones que ya fueron ganados en esta sesión
      if (wonSet.has(patternId)) continue;

      const pattern = PATTERNS[patternId];
      if (!pattern) continue;

      // Un patrón puede tener varias matrices (ej. ROW_ANY tiene 5 filas)
      for (const matrix of pattern.matrices) {
        let matched = true;

        outerLoop:
        for (let row = 0; row < 5; row++) {
          for (let col = 0; col < 5; col++) {
            if (!matrix[row][col]) continue; // celda no requerida por este patrón
            const num = display[row][col];
            if (num === 0) continue;          // FREE SPACE → siempre válido
            if (!calledSet.has(num)) {
              matched = false;
              break outerLoop;
            }
          }
        }

        if (matched) {
          return {
            valid: true,
            matchedPatternId: patternId,
            matchedPatternLabel: pattern.label,
          };
        }
      }
    }
  }

  return { valid: false, matchedPatternId: null, matchedPatternLabel: null };
}
