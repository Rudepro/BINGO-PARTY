import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRoom } from '../network/roomService.js';
import { PATTERN_LIST } from '../core/patterns.js';
import { useRoomStore } from '../state/roomStore.js';
import { usePlayerStore } from '../state/playerStore.js';

export default function CreateRoomScreen() {
  const navigate = useNavigate();
  const [hostName,       setHostName]       = useState('');
  const [maxPlayers,     setMaxPlayers]     = useState(6);
  const [cardsPerPlayer, setCardsPerPlayer] = useState(1);
  const [selectedPats,   setSelectedPats]   = useState(['ROW_ANY']);
  const [autoInterval,   setAutoInterval]   = useState(0);
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState('');

  const togglePattern = id => {
    setSelectedPats(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleCreate = async () => {
    if (!hostName.trim()) { setError('Ingresa tu nombre.'); return; }
    if (!selectedPats.length) { setError('Selecciona al menos un patrón.'); return; }
    setLoading(true); setError('');
    try {
      const { roomCode, uid } = await createRoom({
        hostName: hostName.trim(),
        maxPlayers, cardsPerPlayer,
        patterns: selectedPats,
        autoCallInterval: autoInterval,
      });
      useRoomStore.getState().setRoomCode(roomCode);
      usePlayerStore.getState().setUid(uid);
      usePlayerStore.getState().setName(hostName.trim());
      usePlayerStore.getState().setIsHost(true);
      navigate(`/host/${roomCode}`);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center" style={{ minHeight: '100dvh', padding: '2rem 1rem' }}>
      <div className="glass animate-fade-up" style={{ width: '100%', maxWidth: 480, padding: '2rem' }}>
        <h2 style={{ color: 'var(--gold-400)', marginBottom: '1.5rem' }}>🏠 Crear Sala</h2>

        {/* Host name */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label className="form-label">Tu nombre (Host)</label>
          <input className="input input-normal" placeholder="Ej: María" value={hostName}
            onChange={e => setHostName(e.target.value)} maxLength={20} />
        </div>

        {/* Max players */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label className="form-label">Máximo de jugadores: {maxPlayers}</label>
          <input type="range" min={2} max={6} value={maxPlayers}
            onChange={e => setMaxPlayers(+e.target.value)}
            style={{ width: '100%', accentColor: 'var(--gold-400)' }} />
          <div className="flex" style={{ justifyContent: 'space-between', fontSize: '.75rem', color: 'var(--gray-400)' }}>
            <span>2</span><span>6</span>
          </div>
        </div>

        {/* Cards per player */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label className="form-label">Cartones por jugador</label>
          <div className="flex gap-2">
            {[1,2,3].map(n => (
              <button key={n}
                className={`btn ${cardsPerPlayer === n ? 'btn-gold' : 'btn-ghost'}`}
                style={{ flex: 1 }}
                onClick={() => setCardsPerPlayer(n)}>
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Auto interval */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label className="form-label">Modo de sorteo</label>
          <div className="flex gap-2">
            <button className={`btn ${autoInterval === 0 ? 'btn-gold' : 'btn-ghost'}`} style={{ flex: 1 }} onClick={() => setAutoInterval(0)}>
              Manual
            </button>
            {[5, 10, 15].map(s => (
              <button key={s} className={`btn ${autoInterval === s ? 'btn-gold' : 'btn-ghost'}`} style={{ flex: 1 }} onClick={() => setAutoInterval(s)}>
                {s}s
              </button>
            ))}
          </div>
        </div>

        {/* Patterns */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label className="form-label">Patrones de victoria (puedes seleccionar varios)</label>
          <div className="flex flex-col gap-2">
            {PATTERN_LIST.map(p => (
              <button key={p.id}
                className={`btn ${selectedPats.includes(p.id) ? 'btn-green' : 'btn-ghost'}`}
                style={{ justifyContent: 'flex-start', textAlign: 'left' }}
                onClick={() => togglePattern(p.id)}>
                {selectedPats.includes(p.id) ? '✓ ' : '  '}{p.icon} {p.label}
                <span style={{ fontSize: '.75rem', opacity: .7, marginLeft: 'auto' }}>{p.description}</span>
              </button>
            ))}
          </div>
        </div>

        {error && <p style={{ color: 'var(--red-500)', marginBottom: '1rem', fontWeight: 700 }}>{error}</p>}

        <div className="flex gap-2">
          <button className="btn btn-ghost" onClick={() => navigate('/')}>← Volver</button>
          <button className="btn btn-gold btn-full" onClick={handleCreate} disabled={loading} id="btn-confirm-create">
            {loading ? '⏳ Creando…' : '🎲 Crear Sala'}
          </button>
        </div>
      </div>
    </div>
  );
}
