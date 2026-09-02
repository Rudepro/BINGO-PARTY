import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  subscribeToRoom, subscribeToPlayers, subscribeToPlayer
} from '../network/realtimeSync.js';
import {
  startGame, callNextBall, pauseGame, resumeGame, 
  claimBingo, autoValidateBingo, cancelGame, reinstatePlayer,
  clearFalseAlarm, resetRoom, updateMarkedCells, updateRoomConfig 
} from '../network/roomService.js';
import { useRoomStore } from '../state/roomStore.js';
import { useGameStore } from '../state/gameStore.js';
import { usePlayerStore } from '../state/playerStore.js';
import { GAME_STATES } from '../core/gameStateMachine.js';
import { PATTERNS } from '../core/patterns.js';

import Lobby from '../components/shared/Lobby.jsx';
import RoomCodeDisplay from '../components/shared/RoomCodeDisplay.jsx';
import RouletteAnimation from '../components/host/RouletteAnimation.jsx';
import BallHistory from '../components/host/BallHistory.jsx';
import PlayersPanel from '../components/host/PlayersPanel.jsx';
import PatternIndicator from '../components/player/PatternIndicator.jsx';
import BingoCard from '../components/player/BingoCard.jsx';
import BingoButton from '../components/player/BingoButton.jsx';
import CalledNumbersBoard from '../components/player/CalledNumbersBoard.jsx';
import BingoAlertOverlay from '../components/shared/BingoAlertOverlay.jsx';
import { getLastBalls } from '../core/numberCaller.js';

export default function HostGameScreen() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  // Stores
  const roomStore   = useRoomStore();
  const gameStore   = useGameStore();
  const playerStore = usePlayerStore();

  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [isValidating, setIsValidating] = useState(false);

  // Sincronizar sala y jugadores
  useEffect(() => {
    if (!playerStore.uid || !playerStore.isHost) {
      navigate('/'); return;
    }

    const unsubRoom = subscribeToRoom(roomId, (data) => {
      roomStore.syncFromRoom(data, roomId);
      gameStore.syncFromRoom(data);
      setLoading(false);
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

    // Suscribir al jugador host
    const unsubPlayer = subscribeToPlayer(roomId, playerStore.uid, (data) => {
      playerStore.syncFromPlayer(data);
    });

    return () => {
      unsubRoom(); unsubPlayers(); unsubPlayer();
    };
  }, [roomId, playerStore.uid, playerStore.isHost, navigate]);

  // Sync de markedCells locales del host a Firestore debounced
  useEffect(() => {
    if (!playerStore.uid || loading) return;
    const timeoutId = setTimeout(() => {
      updateMarkedCells(roomId, playerStore.uid, playerStore.markedCells);
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [playerStore.markedCells, roomId, playerStore.uid, loading]);

  const handleStart    = () => startGame(roomId);
  const handleCallNext = () => callNextBall(roomId, gameStore.ballSequence, gameStore.calledCount);
  const handleToggleCards = () => playerStore.toggleHostCards();

  const handleBingo = async () => {
    if (isValidating || gameState === GAME_STATES.FINISHED || playerStore.status === 'eliminated') return;
    setIsValidating(true);
    try {
      await updateMarkedCells(roomId, playerStore.uid, playerStore.markedCells);
      await claimBingo(roomId, playerStore.uid, playerStore.name);
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

  if (loading) return <div className="text-center p-8">Cargando sala...</div>;
  if (error)   return <div className="text-center p-8 color-red-500">{error}</div>;

  const { gameState, calledCount, currentBall, ballSequence, bingoAlert, currentPatternId, winners, falseAlarm } = gameStore;
  const { players, roomConfig } = roomStore;
  const { hostCardsVisible, cards, markedCells, status, wins } = playerStore;

  const isLobby     = gameState === GAME_STATES.LOBBY;
  const isPlaying   = gameState === GAME_STATES.PLAYING;
  const isPaused    = gameState === GAME_STATES.PAUSED;
  const isVerifying = !!bingoAlert;
  const isFinished  = gameState === GAME_STATES.FINISHED;
  const isCancelled = gameState === GAME_STATES.CANCELLED;

  const history = getLastBalls(ballSequence, calledCount, 5);

  const handleCancelGame = async () => {
    if (window.confirm('¿Estás seguro de que quieres cancelar la partida? Esto mandará a todos al menú principal.')) {
      await cancelGame(roomId);
    }
  };

  const handleReinstate = async (uid) => {
    await reinstatePlayer(roomId, uid);
  };

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      
      <BingoAlertOverlay
        bingoAlert={bingoAlert}
        falseAlarm={falseAlarm}
        onFalseAlarmDismiss={() => clearFalseAlarm(roomId)}
      />

      {isCancelled ? (
        <div className="flex flex-col items-center gap-4 glass animate-fade-up text-center" style={{ padding: '3rem 1rem', marginTop: '2rem' }}>
          <div style={{ fontSize: '3rem' }}>🚫</div>
          <h1 style={{ color: 'var(--red-400)', margin: 0 }}>Partida Cancelada</h1>
          <p style={{ color: 'var(--gray-300)' }}>El host ha cancelado esta sala.</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>Volver al Inicio</button>
        </div>
      ) : isLobby ? (
        <div className="flex flex-col items-center gap-3">
          <h2 style={{ color: 'var(--gold-400)' }}>👑 Panel de Control (Host)</h2>
          <RoomCodeDisplay roomCode={roomId} />
          <Lobby
            players={players}
            roomCode={roomId}
            isHost={true}
            onStart={handleStart}
            roomConfig={roomConfig}
            onUpdateConfig={(cfg) => updateRoomConfig(roomId, cfg)}
          />
        </div>
      ) : (
        <div className="game-layout">

          {/* Main content (Left) */}
          <div className="flex flex-col gap-3">
            <div className="glass flex items-center" style={{ padding: '1rem', justifyContent: 'space-between', borderRadius: 'var(--radius-md)' }}>
              <div>
                <h2 style={{ color: 'var(--gold-400)', margin: 0 }}>Sala: {roomId}</h2>
                <div className="flex items-center gap-2" style={{ marginTop: '.5rem' }}>
                  <span className="badge badge-gold">Vista de Host</span>
                  <button 
                    className="btn btn-ghost btn-sm" 
                    style={{ padding: '0.1rem 0.5rem', fontSize: '0.75rem', color: 'var(--red-400)' }}
                    onClick={handleCancelGame}
                  >
                    Cancelar Partida
                  </button>
                </div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={handleToggleCards}>
                {hostCardsVisible ? '👁 Ocultar Cartones' : '👁 Mostrar Cartones'}
              </button>
            </div>

            {isFinished ? (
              <div className="glass animate-fade-up text-center" style={{ padding: '3rem 1rem' }}>
                <h1 style={{ color: 'var(--gold-400)', marginBottom: '1.5rem' }}>🎉 ¡PARTIDA FINALIZADA! 🎉</h1>

                {/* Tabla de ganadores por patrón */}
                <div style={{ marginBottom: '2rem' }}>
                  <p style={{ color: 'var(--gray-400)', fontSize: '.85rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '.5px' }}>
                    Ganadores por patrón
                  </p>
                  {winners.map((w, i) => {
                    const playerName = players.find(p => p.uid === w.uid)?.name ?? 'Jugador';
                    const patternLabel = w.matchedPatternLabel
                      ?? PATTERNS[w.matchedPatternId]?.label
                      ?? w.matchedPatternId
                      ?? 'Bingo';
                    return (
                      <div key={i} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '1rem',
                        padding: '.6rem 1rem',
                        margin: '.3rem auto',
                        maxWidth: 320,
                        borderRadius: 'var(--radius-sm)',
                        background: 'rgba(251,191,36,.08)',
                        border: '1px solid rgba(251,191,36,.2)',
                      }}>
                        <span style={{ fontSize: '1.1rem' }}>🏆</span>
                        <span style={{ fontWeight: 700, flex: 1, textAlign: 'left' }}>{playerName}</span>
                        <span style={{ color: 'var(--gold-400)', fontSize: '.85rem' }}>{patternLabel}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Tabla de copas por jugador */}
                <div style={{ marginBottom: '2rem' }}>
                  <p style={{ color: 'var(--gray-400)', fontSize: '.85rem', marginBottom: '.75rem', textTransform: 'uppercase', letterSpacing: '.5px' }}>
                    Copas totales
                  </p>
                  {players
                    .filter(p => (p.wins ?? 0) > 0)
                    .sort((a, b) => (b.wins ?? 0) - (a.wins ?? 0))
                    .map((p, i) => (
                      <div key={p.uid ?? i} style={{ display: 'flex', justifyContent: 'center', gap: '.75rem', alignItems: 'center', margin: '.25rem 0' }}>
                        <span style={{ fontWeight: 700 }}>{p.name}</span>
                        <span>
                          {Array.from({ length: p.wins ?? 0 }).map((_, wi) => (
                            <span key={wi} style={{ fontSize: '.9rem' }}>🏆</span>
                          ))}
                        </span>
                      </div>
                    ))
                  }
                </div>

                <div className="flex gap-2 justify-center" style={{ flexWrap: 'wrap' }}>
                  <button className="btn btn-gold" onClick={async () => { await resetRoom(roomId); }}>
                    🔄 Volver a Jugar
                  </button>
                  <button className="btn btn-ghost" onClick={() => navigate('/')}>Salir al Inicio</button>
                </div>
              </div>
            ) : (
              <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-md)' }}>
                <RouletteAnimation
                  currentBall={currentBall}
                  calledCount={calledCount}
                  onCallNext={handleCallNext}
                  onPause={() => pauseGame(roomId)}
                  onResume={() => resumeGame(roomId)}
                  isPaused={isPaused}
                  isVerifying={isVerifying}
                  autoInterval={roomConfig?.autoCallInterval}
                />
              </div>
            )}

            {hostCardsVisible && (
              <div className="animate-fade-up">
                <div className="flex items-center gap-4" style={{ marginBottom: '1rem', flexWrap: 'wrap' }}>
                  <h3 style={{ color: 'var(--gold-400)', margin: 0 }}>Tus Cartones</h3>
                  <BingoButton
                    onBingo={handleBingo}
                    disabled={isFinished || status === 'eliminated' || isValidating}
                    status={status}
                    wins={wins}
                    isValidating={isValidating}
                    compact={true}
                  />
                </div>
                <div className="flex gap-2" style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
                  {cards.map((card, i) => (
                    <BingoCard
                      key={i}
                      cardData={card}
                      markedCells={markedCells[i]}
                      calledNumbers={new Set(ballSequence.slice(0, calledCount))}
                      colorIndex={i}
                      onCellClick={(r, c) => playerStore.toggleCell(i, r, c)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar (Right) */}
          <div className="flex flex-col gap-3">
            <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
              <PatternIndicator patternId={currentPatternId} />
            </div>

            <div className="glass" style={{ padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <CalledNumbersBoard calledNumbers={new Set(ballSequence.slice(0, calledCount))} currentBall={currentBall} />
            </div>

            <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
              <BallHistory balls={history} />
            </div>

            <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
              <PlayersPanel
                players={players}
                bingoAlert={bingoAlert}
                isVerifying={isVerifying}
                onReinstate={handleReinstate}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
