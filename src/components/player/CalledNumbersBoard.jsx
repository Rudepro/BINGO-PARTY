import React from 'react';
import { getColumnColor } from '../../utils/colorPalette.js';

const LETTERS = ['B', 'I', 'N', 'G', 'O'];

/**
 * CalledNumbersBoard — grilla 5×15 con números llamados destacados.
 * Props:
 *   calledNumbers {Set<number>}
 *   currentBall   {{ number, letter } | null}
 */
export default function CalledNumbersBoard({ calledNumbers = new Set(), currentBall }) {
  return (
    <div className="flex flex-col gap-2" style={{ width: '100%' }}>
      {/* Header count */}
      <div className="flex items-center" style={{ justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 700, color: 'var(--gray-400)', fontSize: '.8rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
          Números llamados
        </span>
        <span style={{ fontWeight: 900, color: 'var(--gold-400)', fontSize: '1rem' }}>
          {calledNumbers.size}/75
        </span>
      </div>

      {/* Grid: 5 columns, each with header + 15 numbers */}
      <div className="called-board">
        {/* Column headers */}
        {LETTERS.map(l => {
          const c = getColumnColor(l);
          return (
            <div key={`hdr-${l}`} className="called-col-header" style={{ background: c.bg, color: c.text }}>
              {l}
            </div>
          );
        })}

        {/* Numbers: columns B→O, rows 1→15 */}
        {Array.from({ length: 15 }, (_, rowIdx) =>
          LETTERS.map((letter, colIdx) => {
            const num    = colIdx * 15 + rowIdx + 1;
            const called = calledNumbers.has(num);
            const isCur  = currentBall?.number === num;
            const colColor = getColumnColor(letter);
            return (
              <div
                key={num}
                className={`called-number${isCur ? ' called-current' : called ? ' called-active' : ''}`}
                style={
                  isCur
                    ? { background: colColor.bg, color: colColor.text, boxShadow: `0 0 10px ${colColor.bg}` }
                    : called
                    ? { background: `${colColor.bg}bb`, color: '#fff' }
                    : {}
                }
              >
                {num}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}





