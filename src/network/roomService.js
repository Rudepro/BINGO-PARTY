/**
 * roomService.js — Creación, unión y gestión de salas.
 * Estructura Firestore:
 *   /rooms/{roomCode}
 *     config: { maxPlayers, cardsPerPlayer, patterns[], autoCallInterval }
 *     hostUid: string
 *     hostName: string
 *     ballSequence: number[]     ← solo el host puede escribir esto
 *     calledCount: number
 *     currentBall: { number, letter } | null
 *     state: GameState
 *     createdAt: Timestamp
 *     winners: []
 *
 *   /rooms/{roomCode}/players/{uid}
 *     name: string
 *     uid: string
 *     isHost: boolean
 *     cards: number[][][]        ← grid[card][col][row]
 *     markedCells: boolean[][][] ← [card][row][col]
 *     status: PlayerStatus
 *     bingoAlert: { claimed, claimedAt } | null
 *     joinedAt: Timestamp
 */

import {
  doc, setDoc, getDoc, updateDoc,
  collection, addDoc, serverTimestamp, deleteDoc,
} from 'firebase/firestore';
import { db, ensureAnonymousAuth } from './firebaseClient.js';
import { generateRoomCode }        from '../utils/idGenerator.js';
import { generatePlayerCards, initialMarkedCells } from '../core/cardGenerator.js';
import { createBallSequence }      from '../core/numberCaller.js';
import { GAME_STATES }             from '../core/gameStateMachine.js';

const ROOMS = 'rooms';
const PLAYERS = 'players';

// ─── Crear sala ───────────────────────────────────────────────────────────────

/**
 * Crea una nueva sala en Firestore.
 * @param {{ hostName, maxPlayers, cardsPerPlayer, patterns, autoCallInterval }} config
 * @returns {{ roomCode, uid }}
 */
export async function createRoom({ hostName, maxPlayers = 6, cardsPerPlayer = 1, patterns, autoCallInterval = 5 }) {
  const uid = await ensureAnonymousAuth();

  // Generar código único (reintentar si ya existe)
  let roomCode;
  let exists = true;
  while (exists) {
    roomCode = generateRoomCode(6);
    const snap = await getDoc(doc(db, ROOMS, roomCode));
    exists = snap.exists();
  }

  const ballSequence = createBallSequence();
  const usedSignatures = new Set();
  const hostCards = generatePlayerCards(cardsPerPlayer, usedSignatures);
  const hostMarked = hostCards.map(() => initialMarkedCells());

  // Documento de la sala
  await setDoc(doc(db, ROOMS, roomCode), {
    config: { maxPlayers, cardsPerPlayer, patterns, autoCallInterval },
    hostUid: uid,
    hostName,
    ballSequence,
    calledCount: 0,
    currentBall: null,
    state: GAME_STATES.LOBBY,
    createdAt: serverTimestamp(),
    winners: [],
    usedSignatures: [...usedSignatures],
  });

  // Documento del host como jugador
  await setDoc(doc(db, ROOMS, roomCode, PLAYERS, uid), {
    name: hostName,
    uid,
    isHost: true,
    cards: JSON.stringify(hostCards),
    markedCells: JSON.stringify(hostMarked),
    status: 'waiting',
    bingoAlert: null,
    joinedAt: serverTimestamp(),
  });

  return { roomCode, uid };
}

// ─── Unirse a sala ────────────────────────────────────────────────────────────

/**
 * Un jugador se une a una sala existente.
 * @param {{ roomCode, playerName }} params
 * @returns {{ uid, cards, roomData }}
 */
export async function joinRoom({ roomCode, playerName }) {
  const uid = await ensureAnonymousAuth();
  const roomRef = doc(db, ROOMS, roomCode);
  const roomSnap = await getDoc(roomRef);

  if (!roomSnap.exists()) throw new Error('La sala no existe. Verifica el código.');
  const roomData = roomSnap.data();

  if (roomData.state !== GAME_STATES.LOBBY) throw new Error('La partida ya comenzó. No puedes unirte ahora.');

  // Verificar jugadores actuales
  const playersSnap = await getDoc(doc(db, ROOMS, roomCode, PLAYERS, uid));
  if (playersSnap.exists()) {
    // Reconexión: devolver datos existentes
    const pd = playersSnap.data();
    const existingCards = typeof pd.cards === 'string' ? JSON.parse(pd.cards) : pd.cards;
    return { uid, cards: existingCards, roomData };
  }

  // Contar jugadores actuales
  const { cardsPerPlayer } = roomData.config;
  const usedSigs = new Set(roomData.usedSignatures || []);
  const cards = generatePlayerCards(cardsPerPlayer, usedSigs);
  const markedCells = cards.map(() => initialMarkedCells());

  // Actualizar firmas usadas en la sala
  await updateDoc(roomRef, { usedSignatures: [...usedSigs] });

  await setDoc(doc(db, ROOMS, roomCode, PLAYERS, uid), {
    name: playerName,
    uid,
    isHost: false,
    cards: JSON.stringify(cards),
    markedCells: JSON.stringify(markedCells),
    status: 'waiting',
    bingoAlert: null,
    joinedAt: serverTimestamp(),
  });

  return { uid, cards, roomData };
}

// ─── Control del juego (solo host) ───────────────────────────────────────────

export async function startGame(roomCode) {
  await updateDoc(doc(db, ROOMS, roomCode), { state: GAME_STATES.PLAYING });
  // Actualizar estado de todos los jugadores a 'playing' se hace en el listener del host
}

export async function callNextBall(roomCode, ballSequence, calledCount) {
  if (calledCount >= 75) return null;
  const number = ballSequence[calledCount];
  const letter = ['B','I','N','G','O'][Math.floor((number - 1) / 15)];
  await updateDoc(doc(db, ROOMS, roomCode), {
    calledCount: calledCount + 1,
    currentBall: { number, letter },
  });
  return { number, letter };
}

export async function pauseGame(roomCode) {
  await updateDoc(doc(db, ROOMS, roomCode), { state: GAME_STATES.PAUSED });
}

export async function resumeGame(roomCode) {
  await updateDoc(doc(db, ROOMS, roomCode), { state: GAME_STATES.PLAYING });
}

// ─── Bingo! ───────────────────────────────────────────────────────────────────

/** El jugador reclama BINGO — solo escribe la alerta, el host valida */
export async function claimBingo(roomCode, uid) {
  await updateDoc(doc(db, ROOMS, roomCode, PLAYERS, uid), {
    bingoAlert: { claimed: true, claimedAt: serverTimestamp() },
  });
}

/** El host confirma un BINGO válido */
export async function confirmBingoValid(roomCode, uid, matchedPattern) {
  const batch = [
    updateDoc(doc(db, ROOMS, roomCode, PLAYERS, uid), {
      status: 'winner',
      bingoAlert: null,
    }),
    updateDoc(doc(db, ROOMS, roomCode), {
      state: GAME_STATES.FINISHED,
      winners: [{ uid, matchedPattern }],
    }),
  ];
  await Promise.all(batch);
}

/** El host rechaza un BINGO inválido → jugador eliminado */
export async function confirmBingoInvalid(roomCode, uid) {
  await updateDoc(doc(db, ROOMS, roomCode, PLAYERS, uid), {
    status: 'eliminated',
    bingoAlert: null,
  });
  await updateDoc(doc(db, ROOMS, roomCode), { state: GAME_STATES.PLAYING });
}

/** El jugador actualiza su marcado manual */
export async function updateMarkedCells(roomCode, uid, markedCells) {
  await updateDoc(doc(db, ROOMS, roomCode, PLAYERS, uid), { markedCells: JSON.stringify(markedCells) });
}
