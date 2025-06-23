// ==========================================================================================
// file: src/App.jsx
// ==========================================================================================
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LobbyPage from './pages/LobbyPage';
import RoomPage from './pages/RoomPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LobbyPage />} />
        <Route path="/:roomName" element={<RoomPage />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
