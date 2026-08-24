import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomeScreen from './screens/HomeScreen.jsx';
import CreateRoomScreen from './screens/CreateRoomScreen.jsx';
import JoinRoomScreen from './screens/JoinRoomScreen.jsx';
import HostGameScreen from './screens/HostGameScreen.jsx';
import PlayerGameScreen from './screens/PlayerGameScreen.jsx';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/create" element={<CreateRoomScreen />} />
        <Route path="/join" element={<JoinRoomScreen />} />
        
        {/* Usamos un layout base con el background del casino pero los estilos globales ya lo hacen. */}
        <Route path="/host/:roomId" element={<HostGameScreen />} />
        <Route path="/play/:roomId" element={<PlayerGameScreen />} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
