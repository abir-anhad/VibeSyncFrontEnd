// ==========================================================================================
// file: src/components/Participant.jsx
// ==========================================================================================
import React, { useEffect, useRef } from 'react';
import { User, Mic, MicOff, Video, VideoOff } from 'lucide-react';
import AudioVisualizer from './AudioVisualizer';

const VideoPlayer = ({ stream }) => {
    const videoRef = useRef(null);
    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);
    return <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />;
};

// This new component will handle playing remote audio
const AudioPlayer = ({ stream }) => {
    const audioRef = useRef(null);
    useEffect(() => {
        if (audioRef.current && stream) {
            audioRef.current.srcObject = stream;
        }
    }, [stream]);
    return <audio ref={audioRef} autoPlay playsInline />;
};

export default function Participant({ name, isLocal, isMuted, isCameraOff, audioStream, videoStream }) {
  return (
    <div className="bg-gray-800 rounded-xl shadow-lg flex flex-col border-2 border-gray-700 overflow-hidden aspect-4/3">
      {/* Remote audio is now handled here, hidden from view but playing */}
      {!isLocal && audioStream && <AudioPlayer stream={audioStream} />}

      <div className="relative flex-grow w-full h-full bg-gray-700 flex items-center justify-center">
        {videoStream && !isCameraOff ? (
          <VideoPlayer stream={videoStream} />
        ) : (
          <User className="w-1/3 h-1/3 text-gray-500" />
        )}
        <div className="absolute bottom-2 left-2 flex flex-col gap-2">
            <div className={`p-2 rounded-full ${isMuted ? 'bg-red-500' : 'bg-green-500/70'}`}>
                {isMuted ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-white" />}
            </div>
             <div className={`p-2 rounded-full ${isCameraOff ? 'bg-red-500' : 'bg-green-500/70'}`}>
                {isCameraOff ? <VideoOff className="w-5 h-5 text-white" /> : <Video className="w-5 h-5 text-white" />}
            </div>
        </div>
        <div className="absolute top-2 left-2 right-2 flex justify-center">
             {!isMuted && audioStream && <AudioVisualizer audioStream={audioStream} />}
        </div>
      </div>
      <div className="p-3 bg-gray-800/50">
        <p className="text-md font-semibold truncate text-center">{name}</p>
      </div>
    </div>
  );
}
