// ==========================================================================================
// file: src/pages/LobbyPage.jsx
// ==========================================================================================
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, Headphones } from 'lucide-react';

export default function LobbyPage() {
  const [userName, setUserName] = useState('');
  const [roomName, setRoomName] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (userName.trim() && roomName.trim()) {
      navigate(`/${encodeURIComponent(roomName.trim())}?userName=${encodeURIComponent(userName.trim())}`);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-2xl shadow-2xl shadow-black/20 text-white">
        <div className="text-center">
          <Headphones className="w-16 h-16 mx-auto text-purple-400" />
          <h1 className="mt-4 text-4xl font-bold tracking-tight">VibeSync</h1>
          <p className="mt-2 text-gray-400">Join a room and start your jam session.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <input id="userName" type="text" required className="peer h-12 w-full border-b-2 border-gray-500 text-white bg-transparent placeholder-transparent focus:outline-none focus:border-purple-400 transition-colors" placeholder="Your Name" value={userName} onChange={(e) => setUserName(e.target.value)} autoComplete="off" />
            <label htmlFor="userName" className="absolute left-0 -top-4 text-gray-400 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-4 peer-focus:text-purple-400 peer-focus:text-sm">Your Name</label>
          </div>
          <div className="relative">
            <input id="roomName" type="text" required className="peer h-12 w-full border-b-2 border-gray-500 text-white bg-transparent placeholder-transparent focus:outline-none focus:border-purple-400 transition-colors" placeholder="Room Name" value={roomName} onChange={(e) => setRoomName(e.target.value)} autoComplete="off" />
            <label htmlFor="roomName" className="absolute left-0 -top-4 text-gray-400 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-4 peer-focus:text-purple-400 peer-focus:text-sm">Room Name</label>
          </div>
          <button type="submit" disabled={!userName.trim() || !roomName.trim()} className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 rounded-md text-lg font-semibold transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-gray-800">
            <Music className="w-5 h-5" />
            Join Jam
          </button>
        </form>
      </div>
    </div>
  );
}