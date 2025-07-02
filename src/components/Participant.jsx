// frontend/src/components/Participant.jsx

import React, { useEffect, useRef } from 'react';
import { User, Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { useRoomStore } from '../hooks/useRoomStore';
import AudioVisualizer from './AudioVisualizer';

export default function Participant({ participant, userHasInteracted }) {
    const { id, name, isLocal, audio, video } = participant;
    
    const audioRef = useRef(null);
    const videoRef = useRef(null);

    // This effect reliably attaches the stream to the media element
    useEffect(() => {
        if (videoRef.current && video.stream) {
            console.log(`[LOG] Participant ${name} (${id}): Attaching video stream.`);
            videoRef.current.srcObject = video.stream;
        }
        if (audioRef.current && audio.stream) {
            console.log(`[LOG] Participant ${name} (${id}): Attaching audio stream.`);
            audioRef.current.srcObject = audio.stream;
        }
    }, [video.stream, audio.stream, name, id]);

    // This effect handles the actual playback logic
    useEffect(() => {
        const playMedia = async (element, mediaType) => {
            if (element && element.paused) {
                try {
                    console.log(`[LOG] Participant ${name} (${id}): Attempting to play ${mediaType}...`);
                    await element.play();
                    console.log(`[LOG] Participant ${name} (${id}): Successfully played ${mediaType}.`);
                } catch (error) {
                    // This error is expected before user interaction
                    console.warn(`[WARN] Participant ${name} (${id}): Autoplay for ${mediaType} was blocked by the browser. This is normal.`);
                }
            }
        };

        // For local user, media should play automatically
        if (isLocal) {
            playMedia(videoRef.current, 'local video');
            playMedia(audioRef.current, 'local audio');
        } 
        // For remote users, play only after the initial user interaction
        else if (userHasInteracted) {
            playMedia(videoRef.current, 'remote video');
            playMedia(audioRef.current, 'remote audio');
        }
    }, [userHasInteracted, video.stream, audio.stream, isLocal, name, id]);
    
    // UI State Determination
    const isMutedForUI = isLocal ? useRoomStore(state => state.isMuted) : !audio.stream;
    // For remote users, camera is "off" if there is no stream. For local user, it's based on the button state.
    const isCameraOffForUI = isLocal ? useRoomStore(state => state.isCameraOff) : !video.stream;

    return (
        <div className="bg-gray-800 rounded-xl shadow-lg flex flex-col border-2 border-gray-700 overflow-hidden aspect-4/3 relative">
            <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted // Video is ALWAYS muted for both local (prevents echo) and remote (allows autoplay)
                className={`w-full h-full object-cover ${isCameraOffForUI ? 'hidden' : 'block'}`} 
            />
            
            {/* Remote audio is separate and NOT muted. Local audio doesn't need an element. */}
            {!isLocal && <audio ref={audioRef} autoPlay playsInline />}
            
            {isCameraOffForUI && (
                 <div className="w-full h-full flex items-center justify-center bg-gray-700">
                    <User className="w-1/3 h-1/3 text-gray-500" />
                </div>
            )}
            
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-full ${isMutedForUI ? 'bg-red-500' : 'bg-green-500/70'}`}>
                        {isMutedForUI ? <MicOff className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4 text-white" />}
                    </div>
                    <div className={`p-1.5 rounded-full ${isCameraOffForUI ? 'bg-red-500' : 'bg-green-500/70'}`}>
                        {isCameraOffForUI ? <VideoOff className="w-4 h-4 text-white" /> : <Video className="w-4 h-4 text-white" />}
                    </div>
                    <p className="text-sm font-semibold truncate text-white shadow-lg">{name}{isLocal && " (You)"}</p>
                </div>
                 {!isMutedForUI && audio.stream && (
                    <div className="absolute bottom-10 left-0 right-0 flex justify-center">
                        <AudioVisualizer audioStream={audio.stream} />
                    </div>
                 )}
            </div>
        </div>
    );
}