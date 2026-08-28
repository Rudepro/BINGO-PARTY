/**
 * playerStore.js — Cartones y estado del jugador local.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const usePlayerStore = create(
  persist(
    (set, get) => ({
      uid:         null,
      name:        null,
      isHost:      false,
      cards:       [],          // number[][][] → [cardIdx][col][row]
      markedCells: [],          // boolean[][][] → [cardIdx][row][col]
      status:      'waiting',   // 'waiting' | 'playing' | 'eliminated'
      wins:        0,           // cuántos patrones ganados en esta partida
      hostCardsVisible: true,   // toggle Esconder/Mostrar Cartas (solo host)

  setUid:    (uid) => set({ uid }),
  setName:   (n)   => set({ name: n }),
  setIsHost: (v)   => set({ isHost: v }),
  setCards:  (c)   => set({ cards: c }),
  setMarkedCells: (m) => set({ markedCells: m }),
  setStatus: (s)   => set({ status: s }),
  setWins:   (w)   => set({ wins: w }),
  toggleHostCards: () => set(state => ({ hostCardsVisible: !state.hostCardsVisible })),

  /** Marca/desmarca una celda de forma local (optimistic update) */
  toggleCell: (cardIdx, row, col) => {
    const prev = get().markedCells;
    // Impedir desmarcar el FREE SPACE (row=2, col=2)
    if (row === 2 && col === 2) return;
    const next = prev.map((card, ci) =>
      ci !== cardIdx
        ? card
        : card.map((r, ri) =>
            ri !== row ? r : r.map((cell, ci2) => (ci2 === col ? !cell : cell))
          )
    );
    set({ markedCells: next });
  },

  syncFromPlayer: (playerData) => {
    set({
      uid:         playerData.uid,
      name:        playerData.name,
      isHost:      playerData.isHost,
      cards:       playerData.cards,
      markedCells: playerData.markedCells,
      status:      playerData.status,
      wins:        playerData.wins ?? 0,
    });
  },

  reset: () => set({
    uid: null, name: null, isHost: false,
    cards: [], markedCells: [], status: 'waiting', wins: 0, hostCardsVisible: true,
  }),
    }),
    {
      name: 'bingo-player-storage',
      partialize: (state) => ({
        uid: state.uid,
        name: state.name,
        isHost: state.isHost,
      }),
    }
  )
);
