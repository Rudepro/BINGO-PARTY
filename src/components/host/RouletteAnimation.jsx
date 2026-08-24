import React, { useEffect, useRef, useState } from 'react';
import { getColumnColor } from '../../utils/colorPalette.js';

/**
 * RouletteAnimation — bolillero animado con la bola actual.
 * Props:
 *   currentBall   {{ number, letter } | null}
 *   calledCount   {number}
 *   onCallNext    {() => void}   extrae la siguiente bola
 *   onPause       {() => void}
 *   onResume      {() => void}
 *   isPaused      {boolean}
 *   isVerifying   {boolean}
 *   autoInterval  {number}       segundos entre bolas (0 = manual)
 */
export default function RouletteAnimation({
  currentBall, calledCount, onCallNext,
  onPause, onResume, isPaused, isVerifying, autoInterval = 0,
}) {
  const [spinning, setSpinning] = useState(false);
  const timerRef = useRef(null);
  const ballKey  = currentBall?.number ?? 'none';
  const colColor = currentBall ? getColumnColor(currentBall.letter) : { bg: '#374151', text: '#9ca3af' };

  // Auto-llamado
  useEffect(() => {
    if (autoInterval <= 0 || isPaused || isVerifying) {
      clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      if (calledCount < 75) onCallNext();
    }, autoInterval * 1000);
    return () => clearInterval(timerRef.current);
  }, [autoInterval, isPaused, isVerifying, calledCount]);

  const handleManual = () => {
    if (calledCount >= 75 || isVerifying || spinning) return;
    setSpinning(true);
    setTimeout(() => { setSpinning(false); onCallNext(); }, 500);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Ball */}
      <div
        key={ballKey}
        className="roulette-ball"
        style={{
          background: `radial-gradient(circle at 35% 35%, ${colColor.bg}dd, ${colColor.bg})`,
          color: colColor.text,
          animation: spinning
            ? 'spin .5s linear'
            : 'ballPop .4s cubic-bezier(.36,1.56,.64,1) both',
        }}
      >
        {currentBall ? (
          <>
            <span className="ball-letter">{currentBall.letter}</span>
            <span className="ball-number">{currentBall.number}</span>
          </>
        ) : (
          <span style={{ fontSize: '2rem', opacity: .4 }}>🎱</span>
        )}
      </div>

      {/* Counter */}
      <p style={{ color: 'var(--gold-400)', fontWeight: 900, fontSize: '1.1rem' }}>
        {calledCount}/75 CANTADAS
      </p>

      {/* Controls */}
      <div className="flex gap-2">
        {autoInterval > 0 ? (
          isPaused
            ? <button className="btn btn-green" onClick={onResume} disabled={isVerifying}>▶ Reanudar</button>
            : <button className="btn btn-ghost" onClick={onPause}  disabled={isVerifying}>⏸ Pausar</button>
        ) : (
          <button
            className="btn btn-gold"
            onClick={handleManual}
            disabled={calledCount >= 75 || isVerifying || spinning}
          >
            {calledCount >= 75 ? '🎯 Fin' : '🎱 Siguiente bola'}
          </button>
        )}
      </div>
    </div>
  );
}
