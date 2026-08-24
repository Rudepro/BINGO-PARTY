import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { joinRoom } from '../network/roomService.js';
import { useRoomStore } from '../state/roomStore.js';
import { usePlayerStore } from '../state/playerStore.js';

export default function JoinRoomScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const initialCode = query.get('code') || '';

  const [roomCode, setRoomCode] = useState(initialCode);
  const [playerName, setPlayerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = async () => {
    const code = roomCode.trim().toUpperCase();
    const name = playerName.trim();
    if (!code) { setError('Ingresa el código de la sala.'); return; }
    if (!name) { setError('Ingresa tu nombre.'); return; }

    setLoading(true); setError('');
    try {
      const { uid, cards, roomData } = await joinRoom({ roomCode: code, playerName: name });
      useRoomStore.getState().syncFromRoom(roomData, code);
      usePlayerStore.getState().setUid(uid);
      usePlayerStore.getState().setName(name);
      usePlayerStore.getState().setIsHost(false);
      usePlayerStore.getState().setCards(cards);
      
      // Update the URL to include the code so refresh works
      navigate(`/play/${code}`);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center" style={{ minHeight: '100dvh', padding: '2rem 1rem' }}>
      <div className="glass animate-fade-up" style={{ width: '100%', maxWidth: 400, padding: '2rem' }}>
        <h2 style={{ color: 'var(--green-600)', marginBottom: '1.5rem' }}>🎮 Unirse a Sala</h2>

        <div style={{ marginBottom: '1.25rem' }}>
          <label className="form-label">Código de la sala</label>
          <input className="input" placeholder="Ej: ABCDE" value={roomCode}
            onChange={e => setRoomCode(e.target.value.toUpperCase())} maxLength={6} />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label className="form-label">Tu nombre</label>
          <input className="input input-normal" placeholder="Ej: Juan" value={playerName}
            onChange={e => setPlayerName(e.target.value)} maxLength={20} />
        </div>

        {error && <p style={{ color: 'var(--red-500)', marginBottom: '1rem', fontWeight: 700 }}>{error}</p>}

        <div className="flex gap-2">
          <button className="btn btn-ghost" onClick={() => navigate('/')}>← Volver</button>
          <button className="btn btn-green btn-full" onClick={handleJoin} disabled={loading} id="btn-confirm-join">
            {loading ? '⏳ Conectando…' : 'Unirse ➔'}
          </button>
        </div>
      </div>
    </div>
  );
}
