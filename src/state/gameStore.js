/**
 * gameStore.js — Estado global del juego (bolas, patrón, estado de partida).
 * Zustand store.
 */

import { create } from 'zustand';
import { GAME_STATES } from '../core/gameStateMachine.js';

export const useGameStore = create((set, get) => ({
  // Estado de la partida
  gameState:    GAME_STATES.LOBBY,
  calledCount:  0,
  ballSequence: [],
  currentBall:  null,   // { number, letter }
  activePatterns: [],   // Array de IDs de patrones activos

  // Alertas de BINGO
  bingoAlert: null,     // { uid, name, valid } mientras se verifica

  // Ganadores
  winners: [],

  // ─── Actions ───────────────────────────────────────────────────────────────

  setGameState:    (s)    => set({ gameState: s }),
  setCalledCount:  (n)    => set({ calledCount: n }),
  setBallSequence: (seq)  => set({ ballSequence: seq }),
  setCurrentBall:  (ball) => set({ currentBall: ball }),
  setActivePatterns: (p)  => set({ activePatterns: p }),
  setBingoAlert:   (a)    => set({ bingoAlert: a }),
  setWinners:      (w)    => set({ winners: w }),

  /** Sincroniza todo el estado desde un snapshot de Firestore */
  syncFromRoom: (roomData) => {
    set({
      gameState:      roomData.state,
      calledCount:    roomData.calledCount,
      ballSequence:   roomData.ballSequence ?? [],
      currentBall:    roomData.currentBall ?? null,
      activePatterns: roomData.config?.patterns ?? [],
      winners:        roomData.winners ?? [],
    });
  },

  reset: () => set({
    gameState: GAME_STATES.LOBBY,
    calledCount: 0,
    ballSequence: [],
    currentBall: null,
    activePatterns: [],
    bingoAlert: null,
    winners: [],
  }),
}));
