import React from 'react';
import { getColumnColor } from '../../utils/colorPalette.js';

const LETTERS = ['B', 'I', 'N', 'G', 'O'];

/**
 * CalledNumbersBoard — grilla 1–75 con números llamados destacados.
 * Props:
 *   calledNumbers {Set<number>}
 *   currentBall   {{ number, letter } | null}
 */
export default function CalledNumbersBoard({ calledNumbers = new Set(), currentBall }) {
  return (
    <div className="flex flex-col gap-2" style={{ width: '100%' }}>
      {/* Header count */}
      <div className="flex items-center" style={{ justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 700, color: 'var(--gray-400)', fontSize: '.85rem' }}>
          NÚMEROS LLAMADOS
        </span>
        <span style={{ fontWeight: 900, color: 'var(--gold-400)', fontSize: '1rem' }}>
          {calledNumbers.size}/75
        </span>
      </div>

      {/* Column headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 3, marginBottom: 2 }}>
        {LETTERS.map(l => {
          const c = getColumnColor(l);
          return (
            <div key={l} style={{
              background: c.bg, color: c.text,
              textAlign: 'center', borderRadius: 4,
              padding: '2px 0', fontWeight: 900, fontSize: '.8rem',
            }}>
              {l}
            </div>
          );
        })}
      </div>

      {/* Numbers grid: 5 columns × 15 rows */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 3 }}>
        {LETTERS.map((letter, colIdx) => {
          const min = colIdx * 15 + 1;
          const colColor = getColumnColor(letter);
          return Array.from({ length: 15 }, (_, i) => {
            const num    = min + i;
            const called = calledNumbers.has(num);
            const isCur  = currentBall?.number === num;
            return (
              <div
                key={num}
                className="called-number"
                style={
                  isCur
                    ? { background: colColor.bg, color: colColor.text, transform: 'scale(1.15)', zIndex: 1, boxShadow: `0 0 8px ${colColor.bg}` }
                    : called
                    ? { background: colColor.bg + 'bb', color: '#fff', fontWeight: 900 }
                    : {}
                }
              >
                {num}
              </div>
            );
          });
        })}
      </div>
    </div>
  );
}
