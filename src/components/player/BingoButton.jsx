import React from 'react';

/**
 * BingoButton — botón circular pulsante para cantar BINGO.
 * Props:
 *   onBingo    {() => void}
 *   disabled   {boolean}
 *   status     {'playing'|'eliminated'}
 *   wins       {number}   cuántos patrones ha ganado ya
 *   isValidating {boolean}  mientras se procesa la validación automática
 *   compact      {boolean}
 */
export default function BingoButton({ onBingo, disabled, status, wins = 0, isValidating = false, compact = false }) {
  const isEliminated = status === 'eliminated';

  // Etiqueta dinámica según el estado
  const label = isValidating
    ? '⏳ Validando...'
    : isEliminated
      ? '❌ Eliminado'
      : wins > 0
        ? `¡BINGO de nuevo!`
        : '¡BINGO!';

  const isDisabled = disabled || isEliminated || isValidating;

  return (
    <div className="flex flex-col items-center gap-2">
      <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        <button
          className={compact ? "btn btn-gold" : "bingo-btn"}
          onClick={onBingo}
          disabled={isDisabled}
          id="bingo-claim-btn"
          style={{
            opacity: isDisabled ? 0.55 : 1,
            cursor: isDisabled ? 'not-allowed' : 'pointer',
          }}
        >
          {label}
        </button>

        {/* Contador de copas — aparece como badge sobre el botón */}
        {wins > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-6px',
              right: '-6px',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: '#1a1a1a',
              fontWeight: 900,
              fontSize: '.75rem',
              borderRadius: '999px',
              padding: '2px 8px',
              boxShadow: '0 0 10px rgba(251,191,36,.6)',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
            }}
          >
            🏆 ×{wins}
          </span>
        )}
      </div>

      {isEliminated && !compact && (
        <p style={{ color: 'var(--red-500)', fontSize: '.8rem', fontWeight: 700 }}>
          Canto inválido — sigues observando
        </p>
      )}

      {!isEliminated && wins > 0 && !isValidating && !compact && (
        <p style={{ color: 'var(--gold-400)', fontSize: '.78rem', fontWeight: 700, textAlign: 'center' }}>
          ¡Tienes {wins} {wins === 1 ? 'copa' : 'copas'}! Sigue jugando para ganar más
        </p>
      )}
    </div>
  );
}
