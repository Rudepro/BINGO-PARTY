/**
 * gameStateMachine.js — Máquina de estados del juego.
 * Estados: lobby → playing → paused → verifying → finished
 */

export const GAME_STATES = {
  LOBBY:      'lobby',
  PLAYING:    'playing',
  PAUSED:     'paused',
  VERIFYING:  'verifying',
  FINISHED:   'finished',
  CANCELLED:  'cancelled',
};

export const GAME_EVENTS = {
  START:        'START',
  PAUSE:        'PAUSE',
  RESUME:       'RESUME',
  BINGO_CLAIM:  'BINGO_CLAIM',
  BINGO_VALID:  'BINGO_VALID',
  BINGO_INVALID:'BINGO_INVALID',
  END_GAME:     'END_GAME',
  CANCEL_GAME:  'CANCEL_GAME',
  RESET:        'RESET',
};

/** Transiciones válidas: { [currentState]: { [event]: nextState } } */
const TRANSITIONS = {
  [GAME_STATES.LOBBY]: {
    [GAME_EVENTS.START]: GAME_STATES.PLAYING,
  },
  [GAME_STATES.PLAYING]: {
    [GAME_EVENTS.PAUSE]:       GAME_STATES.PAUSED,
    [GAME_EVENTS.BINGO_CLAIM]: GAME_STATES.VERIFYING,
    [GAME_EVENTS.END_GAME]:    GAME_STATES.FINISHED,
    [GAME_EVENTS.CANCEL_GAME]: GAME_STATES.CANCELLED,
  },
  [GAME_STATES.PAUSED]: {
    [GAME_EVENTS.RESUME]:   GAME_STATES.PLAYING,
    [GAME_EVENTS.END_GAME]: GAME_STATES.FINISHED,
    [GAME_EVENTS.CANCEL_GAME]: GAME_STATES.CANCELLED,
  },
  [GAME_STATES.VERIFYING]: {
    [GAME_EVENTS.BINGO_VALID]:   GAME_STATES.FINISHED,
    [GAME_EVENTS.BINGO_INVALID]: GAME_STATES.PLAYING,
    [GAME_EVENTS.CANCEL_GAME]:   GAME_STATES.CANCELLED,
  },
  [GAME_STATES.FINISHED]: {
    [GAME_EVENTS.RESET]: GAME_STATES.LOBBY,
  },
};

/**
 * Calcula el siguiente estado dado el estado actual y un evento.
 * @param {string} currentState
 * @param {string} event
 * @returns {string} Nuevo estado (igual al actual si la transición no es válida)
 */
export function transition(currentState, event) {
  const next = TRANSITIONS[currentState]?.[event];
  if (!next) {
    console.warn(`[StateMachine] Transición inválida: ${currentState} + ${event}`);
    return currentState;
  }
  return next;
}

/**
 * Verifica si una transición es válida.
 */
export function canTransition(currentState, event) {
  return !!TRANSITIONS[currentState]?.[event];
}
