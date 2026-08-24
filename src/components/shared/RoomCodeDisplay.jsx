import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

export default function RoomCodeDisplay({ roomCode }) {
  const canvasRef = useRef(null);
  const joinUrl   = `${window.location.origin}${window.location.pathname}#/join?code=${roomCode}`;

  useEffect(() => {
    if (!canvasRef.current || !roomCode) return;
    QRCode.toCanvas(canvasRef.current, joinUrl, {
      width: 140,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' },
    });
  }, [roomCode, joinUrl]);

  const copy = () => navigator.clipboard?.writeText(roomCode);

  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <p className="form-label">Código de sala</p>
      <div className="room-code" style={{ cursor: 'pointer' }} onClick={copy} title="Toca para copiar">
        {roomCode}
      </div>
      <p style={{ fontSize: '.75rem', color: 'var(--gray-400)' }}>Toca el código para copiar</p>

      <div className="qr-box" style={{ marginTop: '.5rem' }}>
        <canvas ref={canvasRef} />
      </div>
      <p style={{ fontSize: '.75rem', color: 'var(--gray-400)' }}>Escanea para unirte directamente</p>
    </div>
  );
}
