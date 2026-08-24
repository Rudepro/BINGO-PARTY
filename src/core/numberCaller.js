/**
 * numberCaller.js — Lógica del sorteo de 75 bolas sin reposición.
 * Capa Core: sin dependencias de UI ni red.
 */

import { letterForNumber } from './cardGenerator.js';

/**
 * Genera el orden aleatorio de las 75 bolas con Fisher-Yates.
 * @returns {number[]} Array de 75 números (1–75) en orden aleatorio.
 */
export function createBallSequence() {
  const balls = Array.from({ length: 75 }, (_, i) => i + 1);
  for (let i = balls.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [balls[i], balls[j]] = [balls[j], balls[i]];
  }
  return balls;
}

/**
 * Dada la secuencia y cuántas ya se llamaron, devuelve la siguiente bola.
 * @param {number[]} sequence   - Secuencia completa de 75 bolas.
 * @param {number}   calledCount - Cantidad ya llamadas.
 * @returns {{ number: number, letter: string } | null} null si no quedan bolas.
 */
export function getNextBall(sequence, calledCount) {
  if (calledCount >= sequence.length) return null;
  const number = sequence[calledCount];
  return { number, letter: letterForNumber(number) };
}

/**
 * Cuántas bolas quedan por llamar.
 * @param {number[]} sequence
 * @param {number}   calledCount
 * @returns {number}
 */
export function ballsRemaining(sequence, calledCount) {
  return sequence.length - calledCount;
}

/**
 * Obtiene las últimas N bolas llamadas con su letra.
 * @param {number[]} sequence
 * @param {number}   calledCount
 * @param {number}   n
 * @returns {{ number: number, letter: string }[]}
 */
export function getLastBalls(sequence, calledCount, n = 5) {
  const start = Math.max(0, calledCount - n);
  return sequence
    .slice(start, calledCount)
    .reverse()
    .map(number => ({ number, letter: letterForNumber(number) }));
}

/**
 * Obtiene el set de todos los números llamados hasta ahora.
 * @param {number[]} sequence
 * @param {number}   calledCount
 * @returns {Set<number>}
 */
export function getCalledSet(sequence, calledCount) {
  return new Set(sequence.slice(0, calledCount));
}
