/**
 * roomStore.js — Info de sala y jugadores conectados.
 */

import { create } from 'zustand';

export const useRoomStore = create((set) => ({
  roomCode:    null,
  roomConfig:  null,   // { maxPlayers, cardsPerPlayer, patterns, autoCallInterval }
  hostUid:     null,
  hostName:    null,
  players:     [],     // Array de documentos de jugadores

  setRoomCode:   (c)  => set({ roomCode: c }),
  setRoomConfig: (cfg)=> set({ roomConfig: cfg }),
  setHostUid:    (uid)=> set({ hostUid: uid }),
  setHostName:   (n)  => set({ hostName: n }),
  setPlayers:    (p)  => set({ players: p }),

  syncFromRoom: (roomData, roomCode) => {
    set({
      roomCode,
      roomConfig: roomData.config,
      hostUid:    roomData.hostUid,
      hostName:   roomData.hostName,
    });
  },

  reset: () => set({
    roomCode: null,
    roomConfig: null,
    hostUid: null,
    hostName: null,
    players: [],
  }),
}));
