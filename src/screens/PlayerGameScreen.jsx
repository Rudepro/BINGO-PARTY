import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  subscribeToRoom, subscribeToPlayer, subscribeToPlayers
} from '../network/realtimeSync.js';
import { claimBingo, updateMarkedCells } from '../network/roomService.js';
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

export default function PlayerGameScreen() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const roomStore = useRoomStore();
  const gameStore = useGameStore();
  const playerStore = usePlayerStore();
  
  const [loading, setLoading] = useState(true);
  const [overlayBall, setOverlayBall] = useState(null);

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

  const handleBingo = () => {
    claimBingo(roomId, playerStore.uid);
  };

  const handleCellClick = (cardIdx, r, c) => {
    playerStore.toggleCell(cardIdx, r, c);
  };

  if (loading) return <div className="text-center p-8">Conectando...</div>;

  const { gameState, calledCount, currentBall, ballSequence, activePatterns } = gameStore;
  const { players, roomConfig } = roomStore;
  const { cards, markedCells, status } = playerStore;

  const isLobby = gameState === GAME_STATES.LOBBY;
  const isFinished = gameState === GAME_STATES.FINISHED;
  const calledSet = new Set(ballSequence.slice(0, calledCount));
  const ballColor = currentBall ? getColumnColor(currentBall.letter) : null;

  if (isLobby) {
    return (
      <div className="flex flex-col items-center" style={{ padding: '2rem 1rem' }}>
        <h2 style={{ color: 'var(--green-600)', marginBottom: '1rem' }}>Sala {roomId}</h2>
        <Lobby players={players} roomCode={roomId} isHost={false} roomConfig={roomConfig} />
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '1rem 0' }}>

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

        <BingoButton onBingo={handleBingo} disabled={isFinished || status === 'waiting'} status={status} />
      </div>

      <div className="game-layout">
        
        {/* Left: Cards */}
        <div className="flex flex-col gap-3 items-center">
          {isFinished && (
            <div className="glass-gold text-center w-full animate-fade-up" style={{ padding: '1.5rem' }}>
              <h2 style={{ color: 'var(--gold-400)', marginBottom: '.5rem' }}>🎉 PARTIDA FINALIZADA</h2>
              {status === 'winner'
                ? <p style={{ color: 'var(--green-400)', fontWeight: 700 }}>¡Felicitaciones, ganaste! 🏆</p>
                : <p>Sigue intentando en la próxima.</p>}
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
                disabled={isFinished || status === 'eliminated'}
              />
            ))}
          </div>
        </div>

        {/* Right: Board & Patterns */}
        <div className="flex flex-col gap-3">
          <div className="glass" style={{ padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <PatternIndicator patternIds={activePatterns} />
          </div>
          
          <div className="glass" style={{ padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <CalledNumbersBoard calledNumbers={calledSet} currentBall={currentBall} />
          </div>
        </div>

      </div>
    </div>
  );
}
