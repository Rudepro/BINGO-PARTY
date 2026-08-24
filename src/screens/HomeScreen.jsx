import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RulesCarousel from '../components/shared/RulesCarousel.jsx';

export default function HomeScreen() {
  const navigate = useNavigate();
  const [showRules, setShowRules] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center" style={{ minHeight: '100dvh', padding: '2rem 1rem' }}>
      {showRules && <RulesCarousel onClose={() => setShowRules(false)} />}

      {/* Logo */}
      <div className="text-center animate-fade-up" style={{ marginBottom: '2.5rem' }}>
        <img src="./logo.png" alt="Bingo Party Logo" style={{ maxWidth: '280px', width: '100%' }} />
        <p style={{ color: 'var(--gray-400)', marginTop: '.5rem', fontSize: '1.1rem' }}>
          Multijugador en tiempo real · Hasta 6 jugadores
        </p>
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-3 animate-fade-up" style={{ width: '100%', maxWidth: 340, animationDelay: '.1s' }}>
        <button className="btn btn-gold btn-lg btn-full" onClick={() => navigate('/create')} id="btn-create-room">
          🏠 Crear Sala
        </button>
        <button className="btn btn-green btn-lg btn-full" onClick={() => navigate('/join')} id="btn-join-room">
          🎮 Unirse a una Sala
        </button>
        <button className="btn btn-ghost btn-full" onClick={() => setShowRules(true)} id="btn-rules">
          📖 Ver Reglas
        </button>
      </div>

      {/* Footer */}
      <p style={{ marginTop: '3rem', color: 'var(--gray-400)', fontSize: '.75rem' }}>
        Bingo americano de 75 bolas · 100% gratuito
      </p>
    </div>
  );
}
