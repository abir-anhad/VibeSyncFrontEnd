// ==========================================================================================
// file: src/components/Controls.jsx
// ==========================================================================================
import React from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';

export default function Controls({ isMuted, isCameraOff, onMuteToggle, onCameraToggle, onLeave }) {
  return (
    <div className="flex items-center justify-center space-x-4">
      <button onClick={onMuteToggle} className={`p-4 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 ${isMuted ? 'bg-red-500 hover:bg-red-600 focus:ring-red-400' : 'bg-gray-600 hover:bg-gray-500 focus:ring-purple-400'}`} aria-label={isMuted ? 'Unmute' : 'Mute'}>
        {isMuted ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
      </button>
      <button onClick={onCameraToggle} className={`p-4 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 ${isCameraOff ? 'bg-red-500 hover:bg-red-600 focus:ring-red-400' : 'bg-gray-600 hover:bg-gray-500 focus:ring-purple-400'}`} aria-label={isCameraOff ? 'Turn Camera On' : 'Turn Camera Off'}>
        {isCameraOff ? <VideoOff className="w-6 h-6 text-white" /> : <Video className="w-6 h-6 text-white" />}
      </button>
      <button onClick={onLeave} className="p-4 rounded-full bg-red-700 hover:bg-red-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800" aria-label="Leave room">
        <PhoneOff className="w-6 h-6 text-white" />
      </button>
    </div>
  );
}