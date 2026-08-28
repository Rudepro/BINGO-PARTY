import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { subscribeToRoom, subscribeToPlayer, subscribeToPlayers } from '../network/realtimeSync.js';
import { claimBingo, autoValidateBingo, updateMarkedCells } from '../network/roomService.js';
import { useRoomStore } from '../state/roomStore.js';
import { useGameStore } from '../state/gameStore.js';
import { usePlayerStore } from '../state/playerStore.js';
import { GAME_STATES } from '../core/gameStateMachine.js';
import { getColumnColor } from '../utils/colorPalette.js';

import Lobby from '../components/shared/Lobby.jsx';
import PatternIndicator from '../components/player/PatternIndicator.jsx';
import BingoCard from '../components/player/BingoCard.jsx';
import BingoButton from '../components/player/BingoButton.jsx';
import CalledNumbersBoard from '../components/player/CalledNumbersBoard.jsx';
import BingoAlertOverlay from '../components/shared/BingoAlertOverlay.jsx';

export default function PlayerGameScreen() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const roomStore   = useRoomStore();
  const gameStore   = useGameStore();
  const playerStore = usePlayerStore();

  const [loading,      setLoading]      = useState(true);
  const [overlayBall,  setOverlayBall]  = useState(null);
  const [isValidating, setIsValidating] = useState(false); // guard durante auto-validación

  // Sincronizar sala y jugador local
  useEffect(() => {
    if (!playerStore.uid) {
      navigate(`/join?code=${roomId}`); return;
    }

    const unsubRoom = subscribeToRoom(roomId, (data) => {
      roomStore.syncFromRoom(data, roomId);
      gameStore.syncFromRoom(data);
      setLoading(false);
    });

    const unsubPlayer = subscribeToPlayer(roomId, playerStore.uid, (data) => {
      playerStore.syncFromPlayer(data);
    });

    const unsubPlayers = subscribeToPlayers(roomId, (players) => {
      roomStore.setPlayers(players);
      // Detectar si alguien está validando su BINGO (bingoAlert en tránsito)
      const alertPlayer = players.find(p => p.bingoAlert?.claimed);
      if (alertPlayer) {
        gameStore.setBingoAlert(alertPlayer.bingoAlert);
      } else {
        gameStore.setBingoAlert(null);
      }
    });

    return () => { unsubRoom(); unsubPlayer(); unsubPlayers(); };
  }, [roomId, playerStore.uid, navigate]);

  // Sync de markedCells locales a Firestore debounced
  useEffect(() => {
    if (!playerStore.uid || loading) return;
    const timeoutId = setTimeout(() => {
      updateMarkedCells(roomId, playerStore.uid, playerStore.markedCells);
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [playerStore.markedCells, roomId, playerStore.uid, loading]);

  // Mostrar overlay de bola cuando llegue una nueva
  useEffect(() => {
    const ball = gameStore.currentBall;
    if (!ball) return;
    setOverlayBall(ball);
    const t = setTimeout(() => setOverlayBall(null), 2500);
    return () => clearTimeout(t);
  }, [gameStore.currentBall?.number]);

  // ── Cantar BINGO (validación automática con delay para animación) ─────────────────────────────────
  const handleBingo = async () => {
    if (isValidating || isFinished || status === 'eliminated') return;
    setIsValidating(true);
    try {
      // 1. Reclamar (escribe en Firestore y dispara la animación para todos)
      await claimBingo(roomId, playerStore.uid, playerStore.name);
      
      // 2. Esperar 3.5s para que la animación termine
      setTimeout(async () => {
        try {
          await autoValidateBingo(roomId, playerStore.uid);
        } finally {
          setIsValidating(false);
        }
      }, 3500);
      
    } catch (e) {
      console.error(e);
      setIsValidating(false);
    }
  };

  const handleCellClick = (cardIdx, r, c) => {
    playerStore.toggleCell(cardIdx, r, c);
  };

  if (loading) return <div className="text-center p-8">Conectando...</div>;

  const { gameState, calledCount, currentBall, ballSequence, currentPatternId, bingoAlert } = gameStore;
  const { players, roomConfig } = roomStore;
  const { cards, markedCells, status, wins } = playerStore;

  const isLobby    = gameState === GAME_STATES.LOBBY;
  const isFinished = gameState === GAME_STATES.FINISHED;
  const isCancelled = gameState === GAME_STATES.CANCELLED;
  const calledSet  = new Set(ballSequence.slice(0, calledCount));
  const ballColor  = currentBall ? getColumnColor(currentBall.letter) : null;

  // El cartón solo se bloquea si el jugador fue eliminado o la partida terminó
  const cardDisabled = isFinished || status === 'eliminated';
  // El botón BINGO solo se bloquea si está eliminado, la partida terminó, o está validando
  const bingoDisabled = isFinished || status === 'eliminated';

  if (isCancelled) {
    return (
      <div className="container" style={{ padding: '2rem 1rem' }}>
        <div className="flex flex-col items-center gap-4 glass animate-fade-up text-center" style={{ padding: '3rem 1rem', marginTop: '2rem' }}>
          <div style={{ fontSize: '3rem' }}>🚫</div>
          <h1 style={{ color: 'var(--red-400)', margin: 0 }}>Partida Cancelada</h1>
          <p style={{ color: 'var(--gray-300)' }}>El host ha cancelado esta sala.</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>Volver al Inicio</button>
        </div>
      </div>
    );
  }

  if (isLobby) {
    return (
      <div className="flex flex-col items-center" style={{ padding: '2rem 1rem' }}>
        <h2 style={{ color: 'var(--green-600)', margin: '0 0 1rem 0' }}>Sala {roomId}</h2>
        <Lobby players={players} roomCode={roomId} isHost={false} roomConfig={roomConfig} />
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '1rem 0' }}>

      {/* Overlay de BINGO (Global) */}
      <BingoAlertOverlay bingoAlert={bingoAlert} />

      {/* Ball overlay — aparece en cada bola nueva */}
      {overlayBall && (() => {
        const oc = getColumnColor(overlayBall.letter);
        return (
          <div className="ball-overlay" onClick={() => setOverlayBall(null)}>
            <div className="ball-overlay-content">
              <span className="ball-overlay-label">¡Nueva bola!</span>
              <div
                className="roulette-ball"
                style={{
                  background: `radial-gradient(circle at 35% 30%, ${oc.bg}dd 0%, ${oc.bg} 100%)`,
                  color: oc.text,
                  width: 'clamp(150px, 40vw, 220px)',
                  height: 'clamp(150px, 40vw, 220px)',
                }}
              >
                <span className="ball-letter">{overlayBall.letter}</span>
                <span className="ball-number">{overlayBall.number}</span>
              </div>
              <span className="ball-overlay-count">{calledCount} / 75 cantadas</span>
              <span style={{ fontSize: '.75rem', color: 'var(--gray-400)' }}>Toca para cerrar</span>
            </div>
          </div>
        );
      })()}

      {/* Header Mobile: Current Ball + Bingo Btn */}
      <div className="flex items-center glass" style={{ padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', justifyContent: 'space-between' }}>
        <div className="flex items-center gap-2">
          {currentBall && ballColor ? (
            <div
              className="mini-ball"
              style={{
                background: `radial-gradient(circle at 35% 30%, ${ballColor.bg}dd 0%, ${ballColor.bg} 100%)`,
                color: ballColor.text,
              }}
            >
              <span style={{ fontSize: '.6rem', fontWeight: 900, opacity: .9, letterSpacing: '1px' }}>{currentBall.letter}</span>
              <span style={{ fontSize: '1.3rem', fontWeight: 900, lineHeight: 1 }}>{currentBall.number}</span>
            </div>
          ) : (
            <div className="mini-ball" style={{ background: 'rgba(255,255,255,.08)' }}>
              <span style={{ fontSize: '1.5rem', opacity: .4 }}>🎱</span>
            </div>
          )}
          <div className="flex flex-col">
            <span style={{ fontSize: '.75rem', color: 'var(--gray-400)', fontWeight: 600, letterSpacing: '.5px', textTransform: 'uppercase' }}>Última bola</span>
            <span style={{ fontWeight: 900, color: 'var(--gold-400)', fontSize: '1.1rem' }}>
              {calledCount}<span style={{ color: 'var(--gray-400)', fontWeight: 400 }}>/75</span>
            </span>
          </div>
        </div>

        <BingoButton
          onBingo={handleBingo}
          disabled={bingoDisabled}
          status={status}
          wins={wins}
          isValidating={isValidating}
        />
      </div>

      <div className="game-layout">

        {/* Left: Cards */}
        <div className="flex flex-col gap-3 items-center">
          {isFinished && (
            <div className="glass-gold text-center w-full animate-fade-up" style={{ padding: '1.5rem' }}>
              <h2 style={{ color: 'var(--gold-400)', marginBottom: '.5rem' }}>🎉 PARTIDA FINALIZADA</h2>
              {wins > 0
                ? <p style={{ color: 'var(--green-400)', fontWeight: 700 }}>
                    ¡Ganaste {wins} {wins === 1 ? 'copa' : 'copas'}! 🏆
                  </p>
                : <p>Sigue intentando en la próxima.</p>
              }
            </div>
          )}

          <div className="flex gap-2 justify-center" style={{ flexWrap: 'wrap', width: '100%' }}>
            {cards.map((card, i) => (
              <BingoCard
                key={i}
                cardData={card}
                markedCells={markedCells[i]}
                calledNumbers={calledSet}
                colorIndex={i}
                onCellClick={(r, c) => handleCellClick(i, r, c)}
                disabled={cardDisabled}
              />
            ))}
          </div>
        </div>

        {/* Right: Board & Patterns */}
        <div className="flex flex-col gap-3">
          <div className="glass" style={{ padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <PatternIndicator patternId={currentPatternId} />
          </div>

          <div className="glass" style={{ padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <CalledNumbersBoard calledNumbers={calledSet} currentBall={currentBall} />
          </div>
        </div>

      </div>
    </div>
  );
}
