/**
 * realtimeSync.js — Listeners de Firestore en tiempo real.
 * Suscripción al estado de sala y jugadores.
 */

import { doc, collection, onSnapshot } from 'firebase/firestore';
import { db } from './firebaseClient.js';

/**
 * Suscribe al documento de sala en tiempo real.
 * @param {string}   roomCode
 * @param {Function} onUpdate - Recibe el objeto de datos de la sala.
 * @returns {Function} Unsuscribe function
 */
export function subscribeToRoom(roomCode, onUpdate) {
  return onSnapshot(doc(db, 'rooms', roomCode), (snap) => {
    if (snap.exists()) onUpdate(snap.data());
  });
}

/**
 * Suscribe a la colección de jugadores de una sala en tiempo real.
 * @param {string}   roomCode
 * @param {Function} onUpdate - Recibe array de datos de jugadores.
 * @returns {Function} Unsuscribe function
 */
export function subscribeToPlayers(roomCode, onUpdate) {
  return onSnapshot(collection(db, 'rooms', roomCode, 'players'), (snap) => {
    const players = snap.docs.map(d => {
      const data = d.data();
      if (typeof data.cards === 'string') data.cards = JSON.parse(data.cards);
      if (typeof data.markedCells === 'string') data.markedCells = JSON.parse(data.markedCells);
      return { id: d.id, ...data };
    });
    onUpdate(players);
  });
}

/**
 * Suscribe al documento de un jugador específico.
 * @param {string}   roomCode
 * @param {string}   uid
 * @param {Function} onUpdate
 * @returns {Function} Unsuscribe function
 */
export function subscribeToPlayer(roomCode, uid, onUpdate) {
  return onSnapshot(doc(db, 'rooms', roomCode, 'players', uid), (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      if (typeof data.cards === 'string') data.cards = JSON.parse(data.cards);
      if (typeof data.markedCells === 'string') data.markedCells = JSON.parse(data.markedCells);
      onUpdate(data);
    }
  });
}
