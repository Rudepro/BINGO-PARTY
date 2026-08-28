import React from 'react';
import PATTERNS from '../../core/patterns.js';

/**
 * PatternIndicator — mini diagrama 5×5 del patrón activo.
 * Props:
 *   patternId {string}  ID del patrón actual en juego
 */
export default function PatternIndicator({ patternId }) {
  if (!patternId) return null;

  const pattern = PATTERNS[patternId];
  if (!pattern) return null;
  // Usar la primera variante como preview
  const matrix = pattern.matrices[0];

  return (
    <div className="flex flex-col gap-2">
      <p className="form-label" style={{ margin: 0 }}>Patrón actual</p>
      <div className="flex justify-center w-full">
        <div className="flex flex-col items-center gap-1 glass"
          style={{ padding: '.5rem .75rem', borderRadius: 'var(--radius-md)' }}>
          <div className="pattern-grid">
            {matrix.map((row, ri) =>
              row.map((cell, ci) => (
                <div
                  key={`${ri}-${ci}`}
                  className={`pattern-cell${cell ? ' active' : ''}${ri === 2 && ci === 2 ? ' free' : ''}`}
                />
              ))
            )}
          </div>
          <span style={{ fontSize: '.75rem', color: 'var(--gold-400)', fontWeight: 700, marginTop: '.25rem' }}>
            {pattern.icon} {pattern.label}
          </span>
        </div>
      </div>
    </div>
  );
}
