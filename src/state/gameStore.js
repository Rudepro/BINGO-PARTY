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
  activePatterns: [],   // Array de IDs de patrones activos (todos los configurados)
  currentPatternId: null, // El patrón cronológico actualmente en juego

  // Alertas de BINGO
  bingoAlert: null,     // { uid, name, valid } mientras se verifica
  falseAlarm: null,     // { name, timestamp } cuando alguien canta un BINGO inválido

  // Ganadores
  winners: [],

  // ─── Actions ───────────────────────────────────────────────────────────────

  setGameState:    (s)    => set({ gameState: s }),
  setCalledCount:  (n)    => set({ calledCount: n }),
  setBallSequence: (seq)  => set({ ballSequence: seq }),
  setCurrentBall:  (ball) => set({ currentBall: ball }),
  setActivePatterns: (p)  => set({ activePatterns: p }),
  setBingoAlert:   (a)    => set({ bingoAlert: a }),
  setFalseAlarm:   (a)    => set({ falseAlarm: a }),
  setWinners:      (w)    => set({ winners: w }),

  /** Sincroniza todo el estado desde un snapshot de Firestore */
  syncFromRoom: (roomData) => {
    const patterns = roomData.config?.patterns ?? [];
    const winners = roomData.winners ?? [];
    
    // Determinar el patrón actual (el primero que no haya sido ganado)
    const wonPatternIds = new Set(winners.map(w => w.matchedPatternId).filter(Boolean));
    const currentPatternId = patterns.find(p => !wonPatternIds.has(p)) || null;

    set({
      gameState:      roomData.state,
      calledCount:    roomData.calledCount,
      ballSequence:   roomData.ballSequence ?? [],
      currentBall:    roomData.currentBall ?? null,
      activePatterns: patterns,
      currentPatternId,
      winners,
      falseAlarm:     roomData.falseAlarm ?? null,
    });
  },

  reset: () => set({
    gameState: GAME_STATES.LOBBY,
    calledCount: 0,
    ballSequence: [],
    currentBall: null,
    activePatterns: [],
    currentPatternId: null,
    bingoAlert: null,
    falseAlarm: null,
    winners: [],
  }),
}));
