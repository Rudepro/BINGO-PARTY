import React from 'react';

/**
 * BingoAlertOverlay — Animación global que se muestra cuando alguien canta BINGO.
 * Props:
 *   bingoAlert: { name: string, claimed: boolean, claimedAt: ... } | null
 */
export default function BingoAlertOverlay({ bingoAlert }) {
  if (!bingoAlert) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      className="animate-fade-in"
    >
      <div
        className="glass-gold text-center animate-zoom-in"
        style={{
          padding: '3rem 2rem',
          maxWidth: '500px',
          width: '100%',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 0 40px rgba(251, 191, 36, 0.6)',
          border: '3px solid var(--gold-400)',
        }}
      >
        <div style={{ fontSize: '4rem', lineHeight: 1, marginBottom: '1rem' }} className="animate-bounce">
          🚨
        </div>
        
        <h1
          style={{
            color: 'var(--gold-400)',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            marginBottom: '1rem',
            fontSize: '2rem',
          }}
        >
          ¡BINGO!
        </h1>
        
        <p style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: '#fff' }}>
          <span style={{ color: 'var(--green-400)', fontSize: '1.5rem' }}>{bingoAlert.name}</span> acaba de cantar BINGO.
        </p>

        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
          <p style={{ margin: 0, color: 'var(--gray-300)', fontWeight: 600 }}>
            ⏳ Verificando cartones en sistema...
          </p>
        </div>
        
        <p style={{ marginTop: '1.5rem', fontSize: '.9rem', color: 'var(--gray-400)' }}>
          ¿Tienes tú también? ¡Cántala!
        </p>
      </div>
    </div>
  );
}
