import React from 'react';

const STATUS_LABEL = { waiting: 'Esperando', playing: 'Jugando', eliminated: 'Eliminado', winner: '¡Ganador!' };
const STATUS_BADGE = { waiting: 'badge-gray', playing: 'badge-green', eliminated: 'badge-red', winner: 'badge-gold' };

/**
 * PlayersPanel — lista de jugadores con alertas de BINGO.
 * Props:
 *   players        {Array}
 *   bingoAlert     {{ uid, name } | null}  jugador que cantó BINGO
 *   onValidate     {(uid, valid) => void}  host acepta/rechaza
 *   isVerifying    {boolean}
 */
export default function PlayersPanel({ players = [], bingoAlert, onValidate, isVerifying }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="form-label" style={{ margin: 0 }}>Jugadores ({players.length})</p>

      {/* BINGO Alert */}
      {isVerifying && bingoAlert && (
        <div className="glass animate-fade-up" style={{
          padding: '1rem', borderRadius: 'var(--radius-md)',
          border: '2px solid var(--gold-400)',
          boxShadow: '0 0 24px rgba(251,191,36,.5)',
        }}>
          <p style={{ fontWeight: 900, color: 'var(--gold-400)', marginBottom: '.5rem' }}>
            📢 ¡{bingoAlert.name} cantó BINGO!
          </p>
          <div className="flex gap-2">
            <button className="btn btn-green btn-sm" onClick={() => onValidate(bingoAlert.uid, true)}>
              ✓ Válido
            </button>
            <button className="btn btn-red btn-sm" onClick={() => onValidate(bingoAlert.uid, false)}>
              ✕ Inválido
            </button>
          </div>
        </div>
      )}

      {/* Player list */}
      {players.map((p, i) => (
        <div key={p.uid ?? i} className="player-row">
          <div className="player-avatar">{(p.name?.[0] ?? '?').toUpperCase()}</div>
          <div style={{ flex: 1 }}>
            <span style={{ fontWeight: 700 }}>{p.name}</span>
            {p.isHost && <span style={{ color: 'var(--gold-400)', fontSize: '.75rem', marginLeft: '.35rem' }}>👑</span>}
          </div>
          <span className={`badge ${STATUS_BADGE[p.status] ?? 'badge-gray'}`}>
            {STATUS_LABEL[p.status] ?? p.status}
          </span>
        </div>
      ))}
    </div>
  );
}
