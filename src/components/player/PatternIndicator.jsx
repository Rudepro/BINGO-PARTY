import React from 'react';
import PATTERNS from '../../core/patterns.js';

/**
 * PatternIndicator — mini diagrama 5×5 de los patrones activos.
 * Props:
 *   patternIds {string[]}  IDs de patrones activos
 */
export default function PatternIndicator({ patternIds = [] }) {
  if (!patternIds.length) return null;

  return (
    <div className="flex flex-col gap-2">
      <p className="form-label" style={{ margin: 0 }}>Patrones activos</p>
      <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
        {patternIds.map(id => {
          const pattern = PATTERNS[id];
          if (!pattern) return null;
          // Usar la primera variante como preview
          const matrix = pattern.matrices[0];

          return (
            <div key={id} className="flex flex-col items-center gap-1 glass"
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
              <span style={{ fontSize: '.65rem', color: 'var(--gold-400)', fontWeight: 700 }}>
                {pattern.icon} {pattern.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
