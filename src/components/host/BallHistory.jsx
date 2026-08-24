import React from 'react';
import { getColumnColor } from '../../utils/colorPalette.js';

/**
 * BallHistory — últimas N bolas cantadas.
 * Props:
 *   balls {Array<{ number, letter }>}  orden: más reciente primero
 */
export default function BallHistory({ balls = [] }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="form-label" style={{ margin: 0 }}>Últimas bolas</p>
      <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
        {balls.length === 0 && (
          <span style={{ color: 'var(--gray-400)', fontSize: '.85rem' }}>Sin bolas aún</span>
        )}
        {balls.map((b, i) => {
          const c = getColumnColor(b.letter);
          const size = i === 0 ? 52 : 38;
          return (
            <div key={`${b.number}-${i}`}
              style={{
                width: size, height: size, borderRadius: '50%',
                background: c.bg, color: c.text,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                fontWeight: 900,
                fontSize: i === 0 ? '.9rem' : '.7rem',
                opacity: 1 - i * 0.18,
                transition: 'all .3s ease',
                boxShadow: i === 0 ? `0 0 14px ${c.bg}` : 'none',
              }}
            >
              <span style={{ fontSize: i === 0 ? '.6rem' : '.5rem', opacity: .8 }}>{b.letter}</span>
              <span>{b.number}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
