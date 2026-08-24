import React from 'react';
import { gridToDisplay } from '../../core/cardGenerator.js';
import { getCardColor, getColumnColor } from '../../utils/colorPalette.js';

const LETTERS = ['B', 'I', 'N', 'G', 'O'];

/**
 * BingoCard — cartón 5×5 con marcado manual.
 *
 * Props:
 *   cardData      {number[][]}   grid[col][row]
 *   markedCells   {boolean[][]}  [row][col]
 *   calledNumbers {Set<number>}  números oficialmente llamados
 *   colorIndex    {number}       0=rojo 1=azul 2=amarillo
 *   onCellClick   {(row,col)=>void}
 *   disabled      {boolean}
 */
export default function BingoCard({ cardData, markedCells, calledNumbers = new Set(), colorIndex = 0, onCellClick, disabled = false }) {
  const display = gridToDisplay(cardData); // display[row][col]
  const color   = getCardColor(colorIndex);

  return (
    <div
      className="bingo-card"
      style={{ borderColor: color.accent + '55', boxShadow: `0 0 18px ${color.accent}33` }}
    >
      {/* Header B I N G O */}
      <div className="bingo-card-header">
        {LETTERS.map(l => {
          const col = getColumnColor(l);
          return (
            <div
              key={l}
              className="bingo-header-cell"
              style={{ background: col.bg, color: col.text }}
            >
              {l}
            </div>
          );
        })}
      </div>

      {/* Cells */}
      {display.map((row, ri) =>
        row.map((num, ci) => {
          const isFree    = num === 0;
          const isMarked  = markedCells?.[ri]?.[ci] ?? false;
          const isCalled  = calledNumbers.has(num);
          const colColor  = getColumnColor(LETTERS[ci]);

          return (
            <div
              key={`${ri}-${ci}`}
              className={`bingo-cell${isFree ? ' free' : ''}${isMarked ? ' marked' : ''}${isCalled && !isMarked ? ' called' : ''}`}
              style={
                isMarked
                  ? { background: color.accent, color: '#000', borderColor: color.accent }
                  : isFree
                  ? { background: 'rgba(251,191,36,.15)', borderColor: 'var(--gold-500)', color: 'var(--gold-400)' }
                  : {}
              }
              onClick={() => !disabled && !isFree && onCellClick?.(ri, ci)}
            >
              {isFree ? 'FREE' : num}
              {isMarked && !isFree && (
                <span style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.4em', opacity: .25, pointerEvents: 'none',
                }}>✓</span>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
