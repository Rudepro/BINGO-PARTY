import React from 'react';
import { STATUS_COLORS } from '../../utils/colorPalette.js';

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

export default function Lobby({ players, roomCode, isHost, onStart, roomConfig }) {
  const canStart = isHost && players.length >= 2;

  return (
    <div className="flex flex-col gap-3" style={{ width: '100%', maxWidth: 420 }}>
      {/* Player count */}
      <div className="flex items-center" style={{ justifyContent: 'space-between' }}>
        <span style={{ color: 'var(--gray-400)', fontSize: '.9rem' }}>Jugadores</span>
        <span style={{ fontWeight: 700, color: 'var(--gold-400)' }}>
          {players.length} / {roomConfig?.maxPlayers ?? 6}
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
