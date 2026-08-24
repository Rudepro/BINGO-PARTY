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
      
      {/* Header Mobile: Current Ball + Bingo Btn */}
      <div className="flex items-center glass" style={{ padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', justifyContent: 'space-between' }}>
        <div className="flex items-center gap-2">
          {currentBall ? (
            <div style={{ background: 'var(--gold-400)', color: '#000', width: 60, height: 60, borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>
              <span style={{ fontSize: '.8rem' }}>{currentBall.letter}</span>
              <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>{currentBall.number}</span>
            </div>
          ) : (
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,.1)' }} />
          )}
          <div className="flex flex-col">
            <span style={{ fontSize: '.8rem', color: 'var(--gray-400)' }}>Última bola</span>
            <span style={{ fontWeight: 700, color: 'var(--gold-400)' }}>{calledCount}/75</span>
          </div>
        </div>

        <BingoButton onBingo={handleBingo} disabled={isFinished || status === 'waiting'} status={status} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Left: Cards */}
        <div className="flex flex-col gap-3 items-center">
          {isFinished && (
            <div className="glass text-center w-full" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '2px solid var(--gold-400)' }}>
              <h2 style={{ color: 'var(--gold-400)' }}>PARTIDA FINALIZADA</h2>
              {status === 'winner' ? <p>¡Felicitaciones, ganaste!</p> : <p>Sigue intentando en la próxima.</p>}
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
