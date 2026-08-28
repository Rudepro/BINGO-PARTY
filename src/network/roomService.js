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
 *     winners: []               ← [{ uid, matchedPatternId, matchedPatternLabel }]
 *
 *   /rooms/{roomCode}/players/{uid}
 *     name: string
 *     uid: string
 *     isHost: boolean
 *     cards: number[][][]        ← grid[card][col][row]
 *     markedCells: boolean[][][] ← [card][row][col]
 *     status: PlayerStatus       ← 'waiting'|'playing'|'eliminated' (winner=sigue jugando)
 *     wins: number               ← cuántos patrones ha ganado en esta partida
 *     bingoAlert: { claimed, claimedAt } | null
 *     joinedAt: Timestamp
 */

import {
  doc, setDoc, getDoc, updateDoc,
  collection, serverTimestamp, increment,
} from 'firebase/firestore';
import { db, ensureAnonymousAuth } from './firebaseClient.js';
import { generateRoomCode }        from '../utils/idGenerator.js';
import { generatePlayerCards, initialMarkedCells } from '../core/cardGenerator.js';
import { createBallSequence }      from '../core/numberCaller.js';
import { GAME_STATES }             from '../core/gameStateMachine.js';
import { checkBingo }              from '../core/bingoValidator.js';

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
    wins: 0,
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

  // Generar cartones únicos para el nuevo jugador
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
    wins: 0,
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

export async function callNextBall(roomCode, ballSequence, _localCalledCount) {
  // Leer el calledCount real desde Firestore para evitar repetición por race condition
  const roomSnap = await getDoc(doc(db, ROOMS, roomCode));
  if (!roomSnap.exists()) return null;
  const calledCount = roomSnap.data().calledCount ?? 0;

  if (calledCount >= 75) return null;
  const number = ballSequence[calledCount];
  const letter = ['B','I','N','G','O'][Math.floor((number - 1) / 15)];
  await updateDoc(doc(db, ROOMS, roomCode), {
    calledCount: increment(1),
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

export async function cancelGame(roomCode) {
  await updateDoc(doc(db, ROOMS, roomCode), { state: GAME_STATES.CANCELLED });
}

// ─── Bingo! ───────────────────────────────────────────────────────────────────

/** El jugador reclama BINGO — solo escribe la alerta en Firestore para la animación */
export async function claimBingo(roomCode, uid, playerName) {
  await updateDoc(doc(db, ROOMS, roomCode, PLAYERS, uid), {
    bingoAlert: { claimed: true, name: playerName, claimedAt: serverTimestamp() },
  });
}

/**
 * Valida automáticamente un BINGO leyendo los datos oficiales de Firestore.
 * No requiere intervención del host.
 * @param {string} roomCode
 * @param {string} uid
 * @returns {{ valid: boolean, matchedPatternId: string|null, matchedPatternLabel: string|null }}
 */
export async function autoValidateBingo(roomCode, uid) {
  // Leer datos oficiales desde Firestore en paralelo
  const [roomSnap, playerSnap] = await Promise.all([
    getDoc(doc(db, ROOMS, roomCode)),
    getDoc(doc(db, ROOMS, roomCode, PLAYERS, uid)),
  ]);
  if (!roomSnap.exists() || !playerSnap.exists()) {
    return { valid: false, matchedPatternId: null, matchedPatternLabel: null };
  }

  const roomData   = roomSnap.data();
  const playerData = playerSnap.data();

  // Datos del sorteo
  const ballSequence = roomData.ballSequence ?? [];
  const calledCount  = roomData.calledCount  ?? 0;
  const patternIds   = roomData.config?.patterns ?? [];
  const calledSet    = new Set(ballSequence.slice(0, calledCount));

  // Determinar patrón actual cronológico
  const currentWinners  = roomData.winners ?? [];
  const wonPatternIds   = new Set(currentWinners.map(w => w.matchedPatternId).filter(Boolean));
  const currentPatternId = patternIds.find(p => !wonPatternIds.has(p));

  // Cartones del jugador
  const rawCards = typeof playerData.cards === 'string'
    ? JSON.parse(playerData.cards)
    : playerData.cards ?? [];

  if (!currentPatternId) {
    return { valid: false, matchedPatternId: null, matchedPatternLabel: null };
  }

  // Verificación pura (solo contra el patrón actual)
  const result = checkBingo(rawCards, calledSet, [currentPatternId], []);

  if (result.valid) {
    await _confirmValid(roomCode, uid, result.matchedPatternId, result.matchedPatternLabel, patternIds.length);
  } else {
    // BINGO inválido → se elimina al jugador
    await updateDoc(doc(db, ROOMS, roomCode, PLAYERS, uid), {
      status: 'eliminated',
      bingoAlert: null,
    });
  }

  return result;
}

/**
 * Confirma un BINGO válido internamente:
 * - El jugador sigue con status 'playing' (cartón activo)
 * - Se incrementa su contador de victorias (wins)
 * - Se comprueba si todos los patrones han sido ganados para finalizar o continuar
 */
async function _confirmValid(roomCode, uid, matchedPatternId, matchedPatternLabel, totalPatternsCount = 1) {
  // Leer winners actuales (lectura fresca para evitar race conditions)
  const roomSnap   = await getDoc(doc(db, ROOMS, roomCode));
  const roomData   = roomSnap.data();
  const currentWinners  = roomData.winners ?? [];
  const configPatterns  = roomData.config?.patterns ?? [];
  const totalPatterns   = totalPatternsCount || configPatterns.length || 1;

  // Añadir ganador al registro (un jugador puede aparecer varias veces con distintos patrones)
  const updatedWinners = [
    ...currentWinners,
    { uid, matchedPatternId, matchedPatternLabel },
  ];

  // Cuántos patrones únicos han sido ganados
  const wonPatterns  = new Set(updatedWinners.map(w => w.matchedPatternId));
  const allPatternsWon = wonPatterns.size >= totalPatterns;
  const nextState    = allPatternsWon ? GAME_STATES.FINISHED : GAME_STATES.PLAYING;

  await Promise.all([
    // El jugador gana una copa pero SIGUE JUGANDO (cartón activo)
    updateDoc(doc(db, ROOMS, roomCode, PLAYERS, uid), {
      status: 'playing',       // ← sigue activo
      wins: increment(1),      // ← contador de copas
      bingoAlert: null,
    }),
    updateDoc(doc(db, ROOMS, roomCode), {
      state: nextState,
      winners: updatedWinners,
    }),
  ]);
}

/** Confirma un BINGO válido — versión pública para uso externo si se necesita */
export async function confirmBingoValid(roomCode, uid, matchedPatternId, matchedPatternLabel, totalPatternsCount = 1) {
  return _confirmValid(roomCode, uid, matchedPatternId, matchedPatternLabel, totalPatternsCount);
}

/** El host rechaza un BINGO inválido → jugador eliminado */
export async function confirmBingoInvalid(roomCode, uid, shouldFinishGame = false) {
  await Promise.all([
    updateDoc(doc(db, ROOMS, roomCode, PLAYERS, uid), {
      status: 'eliminated',
      bingoAlert: null,
    }),
    updateDoc(doc(db, ROOMS, roomCode), {
      state: shouldFinishGame ? GAME_STATES.FINISHED : GAME_STATES.PLAYING,
    }),
  ]);
}

/** El jugador actualiza su marcado manual */
export async function updateMarkedCells(roomCode, uid, markedCells) {
  await updateDoc(doc(db, ROOMS, roomCode, PLAYERS, uid), { markedCells: JSON.stringify(markedCells) });
}

/** El host revive a un jugador eliminado */
export async function reinstatePlayer(roomCode, uid) {
  await updateDoc(doc(db, ROOMS, roomCode, PLAYERS, uid), { status: 'playing' });
}
