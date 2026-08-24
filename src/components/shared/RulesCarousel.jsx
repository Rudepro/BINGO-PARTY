import React, { useState } from 'react';

const SLIDES = [
  {
    icon: '🎱',
    title: '¿Cómo se juega?',
    body: 'El host extrae bolas numeradas del 1 al 75. Cada bola tiene una letra: B·I·N·G·O. Marca los números en tu cartón cuando sean cantados.',
  },
  {
    icon: '📋',
    title: 'Tu Cartón',
    body: 'Tu cartón es una cuadrícula 5×5. Cada columna tiene números de un rango fijo:\nB: 1–15 · I: 16–30 · N: 31–45 · G: 46–60 · O: 61–75\nLa casilla central es un ESPACIO LIBRE — ¡ya está marcada!',
  },
  {
    icon: '✏️',
    title: 'Marcado Manual',
    body: 'Toca una casilla de tu cartón para marcarla cuando el número sea cantado. ¡Presta atención al tablero de números llamados para no perderte ninguno!',
  },
  {
    icon: '🏆',
    title: 'Patrones de Victoria',
    body: 'Debes completar el patrón configurado por el host:\n• Línea horizontal o vertical\n• Diagonal\n• Cuatro esquinas\n• Patrón en X\n• ¡Cartón lleno (Blackout)!',
  },
  {
    icon: '📢',
    title: '¡BINGO!',
    body: 'Cuando completes el patrón, presiona el botón ¡BINGO! El sistema verifica tu cartón automáticamente. Si es válido, ¡ganaste! Si no, quedas eliminado, así que ¡asegúrate antes de cantar!',
  },
];

export default function RulesCarousel({ onClose }) {
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];

  return (
    <div className="carousel-overlay" onClick={onClose}>
      <div className="carousel-box glass animate-fade-up" onClick={e => e.stopPropagation()}>
        {/* Skip */}
        <button
          className="btn btn-ghost btn-sm"
          style={{ position: 'absolute', top: '1rem', right: '1rem' }}
          onClick={onClose}
        >
          Saltar ✕
        </button>

        {/* Content */}
        <div className="flex flex-col items-center gap-2 text-center" style={{ minHeight: 220 }}>
          <span style={{ fontSize: '3.5rem' }}>{slide.icon}</span>
          <h3 style={{ fontSize: '1.4rem', color: 'var(--gold-400)' }}>{slide.title}</h3>
          <p style={{ whiteSpace: 'pre-line', fontSize: '.95rem' }}>{slide.body}</p>
        </div>

        {/* Dots */}
        <div className="carousel-dots">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              className={`carousel-dot${i === index ? ' active' : ''}`}
              onClick={() => setIndex(i)}
              style={{ border: 'none', cursor: 'pointer', padding: 0 }}
            />
          ))}
        </div>

        {/* Nav */}
        <div className="flex gap-2" style={{ marginTop: '1.25rem', justifyContent: 'space-between' }}>
          <button
            className="btn btn-ghost"
            onClick={() => setIndex(i => Math.max(0, i - 1))}
            disabled={index === 0}
          >← Anterior</button>

          {index < SLIDES.length - 1 ? (
            <button className="btn btn-gold" onClick={() => setIndex(i => i + 1)}>
              Siguiente →
            </button>
          ) : (
            <button className="btn btn-green" onClick={onClose}>
              ¡Entendido! ✓
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
