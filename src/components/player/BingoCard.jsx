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
    <div className="bingo-card-wrapper">
      <div
        className="bingo-card"
        style={{
          borderColor: color.accent + '44',
          boxShadow: `0 0 32px ${color.accent}28, 0 8px 40px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.12)`,
        }}
      >
        {/* Header B I N G O */}
        <div className="bingo-card-header">
          {LETTERS.map(l => {
            const col = getColumnColor(l);
            return (
              <div
                key={l}
                className="bingo-header-cell"
                style={{
                  background: `linear-gradient(180deg, ${col.bg}ee 0%, ${col.bg}bb 100%)`,
                  color: col.text,
                }}
              >
                {l}
              </div>
            );
          })}
        </div>

        {/* Cells */}
        <div className="bingo-cells-grid">
          {display.map((row, ri) =>
            row.map((num, ci) => {
              const isFree    = num === 0;
              const isMarked  = markedCells?.[ri]?.[ci] ?? false;
              const isCalled  = calledNumbers.has(num);
              const colColor  = getColumnColor(LETTERS[ci]);

              let cellStyle = {};
              if (isMarked) {
                cellStyle = {
                  background: `linear-gradient(145deg, ${color.accent}ee 0%, ${color.accent}bb 100%)`,
                  color: '#fff',
                  boxShadow: `0 0 14px ${color.accent}88, inset 0 1px 0 rgba(255,255,255,.25)`,
                };
              } else if (isFree) {
                cellStyle = {};
              } else if (isCalled) {
                cellStyle = {
                  background: `${colColor.bg}33`,
                  borderColor: `${colColor.bg}88`,
                  color: '#fff',
                };
              }

              return (
                <div
                  key={`${ri}-${ci}`}
                  className={`bingo-cell${isFree ? ' free' : ''}${isMarked ? ' marked' : ''}${isCalled && !isMarked ? ' called' : ''}`}
                  style={cellStyle}
                  onClick={() => !disabled && !isFree && onCellClick?.(ri, ci)}
                >
                  {isFree ? '⭐ FREE' : num}
                  {isMarked && !isFree && (
                    <span className="bingo-stamp">✓</span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

