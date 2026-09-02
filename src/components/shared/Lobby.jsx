import React, { useState } from 'react';
import { PATTERNS, PATTERN_LIST } from '../../core/patterns.js';

const STATUS_LABEL = {
  waiting:    'Esperando',
  playing:    'Jugando',
  eliminated: 'Eliminado',
  winner:     '¡Ganador!',
};

const STATUS_BADGE = {
  waiting:    'badge-gray',
  playing:    'badge-green',
  eliminated: 'badge-red',
  winner:     'badge-gold',
};

export default function Lobby({ players, roomCode, isHost, onStart, roomConfig, onUpdateConfig }) {
  const canStart = isHost && players.length >= 2;
  const [showSettings, setShowSettings] = useState(false);

  const selectedPatterns = roomConfig?.patterns ?? ['ROW_ANY'];
  const cardsPerPlayer = roomConfig?.cardsPerPlayer ?? 1;
  const autoCallInterval = roomConfig?.autoCallInterval ?? 0;
  const maxPlayers = roomConfig?.maxPlayers ?? 6;

  const handleTogglePattern = (patId) => {
    if (!onUpdateConfig) return;
    let next;
    if (selectedPatterns.includes(patId)) {
      if (selectedPatterns.length <= 1) return; // al menos un patrón
      next = selectedPatterns.filter(id => id !== patId);
    } else {
      next = [...selectedPatterns, patId];
    }
    onUpdateConfig({ patterns: next });
  };

  const handleSetCards = (count) => {
    if (onUpdateConfig) onUpdateConfig({ cardsPerPlayer: count });
  };

  const handleSetInterval = (interval) => {
    if (onUpdateConfig) onUpdateConfig({ autoCallInterval: interval });
  };

  const handleSetMaxPlayers = (max) => {
    if (onUpdateConfig) onUpdateConfig({ maxPlayers: max });
  };

  return (
    <div className="flex flex-col gap-3" style={{ width: '100%', maxWidth: 460 }}>
      {/* Resumen de configuración de la sala */}
      <div className="glass" style={{ padding: '1rem', borderRadius: 'var(--radius-md)' }}>
        <div className="flex items-center" style={{ justifyContent: 'space-between', marginBottom: '.6rem' }}>
          <span style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--gold-400)', textTransform: 'uppercase', letterSpacing: '.5px' }}>
            ⚙️ Configuración de Partida
          </span>
          {isHost && (
            <button
              className="btn btn-ghost btn-sm"
              style={{ padding: '.2rem .6rem', fontSize: '.75rem', color: 'var(--gold-400)' }}
              onClick={() => setShowSettings(!showSettings)}
            >
              {showSettings ? '▲ Cerrar Ajustes' : '▼ Modificar Ajustes'}
            </button>
          )}
        </div>

        {/* Vista colapsable de ajustes para el host */}
        {showSettings && isHost ? (
          <div className="flex flex-col gap-3 animate-fade-up" style={{ marginTop: '.75rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '.75rem' }}>
            {/* Cartones por jugador */}
            <div>
              <label className="form-label" style={{ fontSize: '.8rem' }}>Cartones por jugador</label>
              <div className="flex gap-2" style={{ marginTop: '.25rem' }}>
                {[1, 2, 3].map(n => (
                  <button
                    key={n}
                    className={`btn ${cardsPerPlayer === n ? 'btn-gold' : 'btn-ghost'}`}
                    style={{ flex: 1, padding: '.35rem' }}
                    onClick={() => handleSetCards(n)}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Modo de sorteo */}
            <div>
              <label className="form-label" style={{ fontSize: '.8rem' }}>Modo de sorteo</label>
              <div className="flex gap-2" style={{ marginTop: '.25rem' }}>
                <button
                  className={`btn ${autoCallInterval === 0 ? 'btn-gold' : 'btn-ghost'}`}
                  style={{ flex: 1, padding: '.35rem', fontSize: '.8rem' }}
                  onClick={() => handleSetInterval(0)}
                >
                  Manual
                </button>
                {[5, 10, 15].map(s => (
                  <button
                    key={s}
                    className={`btn ${autoCallInterval === s ? 'btn-gold' : 'btn-ghost'}`}
                    style={{ flex: 1, padding: '.35rem', fontSize: '.8rem' }}
                    onClick={() => handleSetInterval(s)}
                  >
                    {s}s
                  </button>
                ))}
              </div>
            </div>

            {/* Máx jugadores */}
            <div>
              <div className="flex" style={{ justifyContent: 'space-between' }}>
                <label className="form-label" style={{ fontSize: '.8rem' }}>Máx. jugadores</label>
                <strong style={{ color: 'var(--gold-400)', fontSize: '.85rem' }}>{maxPlayers}</strong>
              </div>
              <input
                type="range" min={2} max={10} value={maxPlayers}
                onChange={e => handleSetMaxPlayers(+e.target.value)}
                style={{ width: '100%', accentColor: 'var(--gold-400)', marginTop: '.2rem' }}
              />
            </div>

            {/* Patrones de victoria */}
            <div>
              <label className="form-label" style={{ fontSize: '.8rem' }}>Patrones de victoria</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.4rem', marginTop: '.3rem' }}>
                {PATTERN_LIST.map(p => {
                  const active = selectedPatterns.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => handleTogglePattern(p.id)}
                      style={{
                        padding: '.4rem .6rem',
                        borderRadius: 'var(--radius-xs)',
                        border: active ? '1px solid var(--gold-400)' : '1px solid rgba(255,255,255,0.08)',
                        background: active ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.04)',
                        color: active ? 'var(--gold-400)' : 'var(--gray-300)',
                        fontSize: '.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      {active ? '✓ ' : ''}{p.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Resumen de configuración no expandido */
          <div className="flex flex-col gap-1" style={{ fontSize: '.8rem', color: 'var(--gray-300)' }}>
            <div className="flex items-center" style={{ justifyContent: 'space-between' }}>
              <span>🃏 Cartones:</span>
              <strong style={{ color: 'var(--gold-400)' }}>{cardsPerPlayer} por jugador</strong>
            </div>
            <div className="flex items-center" style={{ justifyContent: 'space-between' }}>
              <span>⏱️ Sorteo:</span>
              <strong style={{ color: 'var(--gold-400)' }}>{autoCallInterval === 0 ? 'Manual' : `Automático (${autoCallInterval}s)`}</strong>
            </div>
            <div className="flex items-center" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '.25rem' }}>
              <span>🎯 Patrones:</span>
              <div className="flex gap-1" style={{ flexWrap: 'wrap' }}>
                {selectedPatterns.map(pid => (
                  <span key={pid} className="badge badge-gold" style={{ fontSize: '.7rem', padding: '.1rem .4rem' }}>
                    {PATTERNS[pid]?.label ?? pid}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Player count */}
      <div className="flex items-center" style={{ justifyContent: 'space-between' }}>
        <span style={{ color: 'var(--gray-400)', fontSize: '.9rem' }}>Jugadores conectados</span>
        <span style={{ fontWeight: 700, color: 'var(--gold-400)' }}>
          {players.length} / {maxPlayers}
        </span>
      </div>

      {/* Player list */}
      <div className="flex flex-col gap-1">
        {players.map((p, i) => (
          <div key={p.uid ?? i} className="player-row">
            <div className="player-avatar">
              {(p.name?.[0] ?? '?').toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700 }}>
                {p.name}
                {p.isHost && <span style={{ color: 'var(--gold-400)', fontSize: '.8rem', marginLeft: '.4rem' }}>👑 Host</span>}
              </div>
            </div>
            <span className={`badge ${STATUS_BADGE[p.status] ?? 'badge-gray'}`}>
              {STATUS_LABEL[p.status] ?? p.status}
            </span>
          </div>
        ))}

        {players.length === 0 && (
          <p style={{ color: 'var(--gray-400)', textAlign: 'center', padding: '1rem' }}>
            Esperando jugadores…
          </p>
        )}
      </div>

      {/* Start button (host only) */}
      {isHost && (
        <button
          className="btn btn-green btn-lg btn-full"
          disabled={!canStart}
          onClick={onStart}
          style={{ marginTop: '.5rem' }}
        >
          {canStart ? '🎮 Iniciar Partida' : `Esperando más jugadores (mín. 2)`}
        </button>
      )}

      {!isHost && (
        <div className="glass text-center" style={{ padding: '1rem', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '.3rem' }}>⏳</div>
          <p style={{ color: 'var(--gray-400)', fontSize: '.9rem' }}>
            Esperando a que el host inicie la partida…
          </p>
        </div>
      )}
    </div>
  );
}

