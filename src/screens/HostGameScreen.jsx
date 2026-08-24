import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  subscribeToRoom, subscribeToPlayers, subscribeToPlayer
} from '../network/realtimeSync.js';
import { startGame, callNextBall, pauseGame, resumeGame, confirmBingoValid, confirmBingoInvalid } from '../network/roomService.js';
import { useRoomStore } from '../state/roomStore.js';
import { useGameStore } from '../state/gameStore.js';
import { usePlayerStore } from '../state/playerStore.js';
import { GAME_STATES } from '../core/gameStateMachine.js';

import Lobby from '../components/shared/Lobby.jsx';
import RoomCodeDisplay from '../components/shared/RoomCodeDisplay.jsx';
import RouletteAnimation from '../components/host/RouletteAnimation.jsx';
import BallHistory from '../components/host/BallHistory.jsx';
import PlayersPanel from '../components/host/PlayersPanel.jsx';
import PatternIndicator from '../components/player/PatternIndicator.jsx';
import BingoCard from '../components/player/BingoCard.jsx';
import BingoButton from '../components/player/BingoButton.jsx';
import { getLastBalls } from '../core/numberCaller.js';

export default function HostGameScreen() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  // Stores
  const roomStore = useRoomStore();
  const gameStore = useGameStore();
  const playerStore = usePlayerStore();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      
      // Buscar si alguien reclamó bingo y no se ha procesado
      const alertPlayer = players.find(p => p.bingoAlert?.claimed);
      if (alertPlayer) {
        gameStore.setBingoAlert(alertPlayer);
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

  const handleStart = () => startGame(roomId);
  
  const handleCallNext = () => {
    callNextBall(roomId, gameStore.ballSequence, gameStore.calledCount);
  };
  
  const handleValidate = (uid, valid) => {
    if (valid) {
      const pattern = "Validado por el host"; // Simplificado para esta versión
      confirmBingoValid(roomId, uid, pattern);
    } else {
      confirmBingoInvalid(roomId, uid);
    }
  };

  const handleToggleCards = () => playerStore.toggleHostCards();

  if (loading) return <div className="text-center p-8">Cargando sala...</div>;
  if (error) return <div className="text-center p-8 color-red-500">{error}</div>;

  const { gameState, calledCount, currentBall, ballSequence, bingoAlert, activePatterns } = gameStore;
  const { players, roomConfig } = roomStore;
  const { hostCardsVisible, cards, markedCells } = playerStore;

  const isLobby = gameState === GAME_STATES.LOBBY;
  const isPlaying = gameState === GAME_STATES.PLAYING;
  const isPaused = gameState === GAME_STATES.PAUSED;
  const isVerifying = gameState === GAME_STATES.VERIFYING || !!bingoAlert;
  const isFinished = gameState === GAME_STATES.FINISHED;

  const history = getLastBalls(ballSequence, calledCount, 5);

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      
      {isLobby ? (
        <div className="flex flex-col items-center gap-3">
          <h2 style={{ color: 'var(--gold-400)' }}>👑 Panel de Control (Host)</h2>
          <RoomCodeDisplay roomCode={roomId} />
          <Lobby players={players} roomCode={roomId} isHost={true} onStart={handleStart} roomConfig={roomConfig} />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem', alignItems: 'start' }}>
          
          {/* Main content (Left) */}
          <div className="flex flex-col gap-3">
            <div className="glass flex items-center" style={{ padding: '1rem', justifyContent: 'space-between', borderRadius: 'var(--radius-md)' }}>
              <div>
                <h2 style={{ color: 'var(--gold-400)', margin: 0 }}>Sala: {roomId}</h2>
                <span className="badge badge-gold" style={{ marginTop: '.5rem' }}>Vista de Host</span>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={handleToggleCards}>
                {hostCardsVisible ? '👁 Ocultar Cartones' : '👁 Mostrar Cartones'}
              </button>
            </div>

            {isFinished ? (
               <div className="glass animate-fade-up text-center" style={{ padding: '3rem 1rem' }}>
                 <h1 style={{ color: 'var(--gold-400)', marginBottom: '1rem' }}>🎉 ¡PARTIDA FINALIZADA! 🎉</h1>
                 <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
                   Ganador(es): {gameStore.winners.map(w => players.find(p=>p.uid===w.uid)?.name).join(', ')}
                 </p>
                 <button className="btn btn-green" onClick={() => navigate('/')}>Salir al Inicio</button>
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
                 <h3 style={{ marginBottom: '1rem', color: 'var(--gold-400)' }}>Tus Cartones</h3>
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
                 {/* El host no puede cantar BINGO en esta versión básica (se puede expandir luego) */}
               </div>
            )}

          </div>

          {/* Sidebar (Right) */}
          <div className="flex flex-col gap-3">
            <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
              <PatternIndicator patternIds={activePatterns} />
            </div>

            <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
              <BallHistory balls={history} />
            </div>

            <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
              <PlayersPanel 
                players={players} 
                bingoAlert={bingoAlert} 
                onValidate={handleValidate} 
                isVerifying={isVerifying} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
