import React from 'react';

/**
 * BingoButton — botón circular pulsante para cantar BINGO.
 * Props:
 *   onBingo   {() => void}
 *   disabled  {boolean}
 *   status    {'playing'|'eliminated'|'winner'}
 */
export default function BingoButton({ onBingo, disabled, status }) {
  const label =
    status === 'winner'     ? '🏆 ¡GANASTE!' :
    status === 'eliminated' ? '❌ Eliminado' :
    '¡BINGO!';

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        className="bingo-btn"
        onClick={onBingo}
        disabled={disabled || status === 'eliminated' || status === 'winner'}
        id="bingo-claim-btn"
      >
        {label}
      </button>
      {status === 'eliminated' && (
        <p style={{ color: 'var(--red-500)', fontSize: '.8rem', fontWeight: 700 }}>
          Canto inválido — sigues observando
        </p>
      )}
    </div>
  );
}
