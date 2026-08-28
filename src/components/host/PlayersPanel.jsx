import React from 'react';

const STATUS_LABEL = {
  waiting:    'Esperando',
  playing:    'Jugando',
  eliminated: 'Eliminado',
};
const STATUS_BADGE = {
  waiting:    'badge-gray',
  playing:    'badge-green',
  eliminated: 'badge-red',
};

/**
 * PlayersPanel — lista de jugadores con copas de victoria.
 * Props:
 *   players     {Array}
 *   bingoAlert  {{ uid, name } | null}  jugador que cantó BINGO (informativo)
 *   isVerifying {boolean}
 */
export default function PlayersPanel({ players = [], bingoAlert, isVerifying }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="form-label" style={{ margin: 0 }}>Jugadores ({players.length})</p>

      {/* BINGO Alert — solo informativo, la validación es automática */}
      {isVerifying && bingoAlert && (
        <div className="glass animate-fade-up" style={{
          padding: '.75rem 1rem',
          borderRadius: 'var(--radius-md)',
          border: '2px solid var(--gold-400)',
          boxShadow: '0 0 18px rgba(251,191,36,.4)',
        }}>
          <p style={{ fontWeight: 700, color: 'var(--gold-400)', margin: 0, fontSize: '.9rem' }}>
            ⏳ {bingoAlert.name} está validando su BINGO...
          </p>
        </div>
      )}

      {/* Player list */}
      {players.map((p, i) => {
        const wins = p.wins ?? 0;
        return (
          <div key={p.uid ?? i} className="player-row">
            <div className="player-avatar">{(p.name?.[0] ?? '?').toUpperCase()}</div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.35rem', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {p.name}
                </span>
                {p.isHost && (
                  <span style={{ color: 'var(--gold-400)', fontSize: '.75rem' }}>👑</span>
                )}
              </div>

              {/* Copas acumuladas */}
              {wins > 0 && (
                <div style={{ display: 'flex', gap: '.2rem', marginTop: '.15rem' }}>
                  {Array.from({ length: wins }).map((_, wi) => (
                    <span
                      key={wi}
                      title={`${wins} patrón${wins !== 1 ? 'es' : ''} ganado${wins !== 1 ? 's' : ''}`}
                      style={{
                        fontSize: '.85rem',
                        filter: 'drop-shadow(0 0 4px rgba(251,191,36,.8))',
                        animation: 'pulse 2s ease-in-out infinite',
                      }}
                    >
                      🏆
                    </span>
                  ))}
                </div>
              )}
            </div>

            <span className={`badge ${STATUS_BADGE[p.status] ?? 'badge-gray'}`}>
              {STATUS_LABEL[p.status] ?? p.status}
            </span>
          </div>
        );
      })}
    </div>
  );
}
