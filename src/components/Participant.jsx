// // // // // // ==========================================================================================
// // // // // // file: src/components/Participant.jsx
// // // // // // ==========================================================================================
// // // // // import React, { useEffect, useRef } from 'react';
// // // // // import { User, Mic, MicOff, Video, VideoOff } from 'lucide-react';
// // // // // import AudioVisualizer from './AudioVisualizer';

// // // // // const VideoPlayer = ({ stream }) => {
// // // // //     const videoRef = useRef(null);
// // // // //     useEffect(() => {
// // // // //         if (videoRef.current && stream) {
// // // // //             videoRef.current.srcObject = stream;
// // // // //         }
// // // // //     }, [stream]);
// // // // //     return <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />;
// // // // // };

// // // // // // This new component will handle playing remote audio
// // // // // const AudioPlayer = ({ stream }) => {
// // // // //     const audioRef = useRef(null);
// // // // //     useEffect(() => {
// // // // //         if (audioRef.current && stream) {
// // // // //             audioRef.current.srcObject = stream;
// // // // //         }
// // // // //     }, [stream]);
// // // // //     return <audio ref={audioRef} autoPlay playsInline />;
// // // // // };

// // // // // export default function Participant({ name, isLocal, isMuted, isCameraOff, audioStream, videoStream }) {
// // // // //   return (
// // // // //     <div className="bg-gray-800 rounded-xl shadow-lg flex flex-col border-2 border-gray-700 overflow-hidden aspect-4/3">
// // // // //       {/* Remote audio is now handled here, hidden from view but playing */}
// // // // //       {!isLocal && audioStream && <AudioPlayer stream={audioStream} />}

// // // // //       <div className="relative flex-grow w-full h-full bg-gray-700 flex items-center justify-center">
// // // // //         {videoStream && !isCameraOff ? (
// // // // //           <VideoPlayer stream={videoStream} />
// // // // //         ) : (
// // // // //           <User className="w-1/3 h-1/3 text-gray-500" />
// // // // //         )}
// // // // //         <div className="absolute bottom-2 left-2 flex flex-col gap-2">
// // // // //             <div className={`p-2 rounded-full ${isMuted ? 'bg-red-500' : 'bg-green-500/70'}`}>
// // // // //                 {isMuted ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-white" />}
// // // // //             </div>
// // // // //              <div className={`p-2 rounded-full ${isCameraOff ? 'bg-red-500' : 'bg-green-500/70'}`}>
// // // // //                 {isCameraOff ? <VideoOff className="w-5 h-5 text-white" /> : <Video className="w-5 h-5 text-white" />}
// // // // //             </div>
// // // // //         </div>
// // // // //         <div className="absolute top-2 left-2 right-2 flex justify-center">
// // // // //              {!isMuted && audioStream && <AudioVisualizer audioStream={audioStream} />}
// // // // //         </div>
// // // // //       </div>
// // // // //       <div className="p-3 bg-gray-800/50">
// // // // //         <p className="text-md font-semibold truncate text-center">{name}</p>
// // // // //       </div>
// // // // //     </div>
// // // // //   );
// // // // // }


// // // // // ==========================================================================================
// // // // // file: src/components/Participant.jsx
// // // // // FIXED: Programmatically play audio and add debug logs for autoplay issues.
// // // // // ==========================================================================================
// // // // import React, { useEffect, useRef } from 'react';
// // // // import { User, Mic, MicOff, Video, VideoOff } from 'lucide-react';
// // // // import AudioVisualizer from './AudioVisualizer';

// // // // const VideoPlayer = ({ stream }) => {
// // // //     const videoRef = useRef(null);
// // // //     useEffect(() => {
// // // //         if (videoRef.current && stream) {
// // // //             videoRef.current.srcObject = stream;
// // // //         }
// // // //     }, [stream]);
// // // //     return <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />;
// // // // };

// // // // // This new component will handle playing remote audio
// // // // const AudioPlayer = ({ stream, name }) => {
// // // //     const audioRef = useRef(null);
// // // //     useEffect(() => {
// // // //         if (audioRef.current && stream) {
// // // //             audioRef.current.srcObject = stream;
            
// // // //             // --- DEBUG LOG & FIX START ---
// // // //             // We must try to play the audio programmatically to work around browser
// // // //             // autoplay policies.
// // // //             const playPromise = audioRef.current.play();
// // // //             if (playPromise !== undefined) {
// // // //                 playPromise.then(_ => {
// // // //                     // Autoplay started successfully.
// // // //                     console.log(`[VibeSync-Debug] Audio for ${name} started playing automatically.`);
// // // //                 }).catch(error => {
// // // //                     // Autoplay was prevented.
// // // //                     console.error(`[VibeSync-Debug] Autoplay for ${name}'s audio was prevented. Error: ${error}. This is common. A user interaction (like a click) is needed to start audio.`);
// // // //                     // In a production app, you might show a "Click to play audio" button here.
// // // //                 });
// // // //             }
// // // //             // --- DEBUG LOG & FIX END ---

// // // //         }
// // // //     }, [stream, name]);
// // // //     return <audio ref={audioRef} autoPlay playsInline />;
// // // // };

// // // // export default function Participant({ name, isLocal, isMuted, isCameraOff, audioStream, videoStream }) {
// // // //   return (
// // // //     <div className="bg-gray-800 rounded-xl shadow-lg flex flex-col border-2 border-gray-700 overflow-hidden aspect-4/3">
// // // //       {/* Remote audio is now handled here, hidden from view but playing */}
// // // //       {!isLocal && audioStream && <AudioPlayer stream={audioStream} name={name} />}

// // // //       <div className="relative flex-grow w-full h-full bg-gray-700 flex items-center justify-center">
// // // //         {videoStream && !isCameraOff ? (
// // // //           <VideoPlayer stream={videoStream} />
// // // //         ) : (
// // // //           <User className="w-1/3 h-1/3 text-gray-500" />
// // // //         )}
// // // //         <div className="absolute bottom-2 left-2 flex flex-col gap-2">
// // // //             <div className={`p-2 rounded-full ${isMuted ? 'bg-red-500' : 'bg-green-500/70'}`}>
// // // //                 {isMuted ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-white" />}
// // // //             </div>
// // // //              <div className={`p-2 rounded-full ${isCameraOff ? 'bg-red-500' : 'bg-green-500/70'}`}>
// // // //                 {isCameraOff ? <VideoOff className="w-5 h-5 text-white" /> : <Video className="w-5 h-5 text-white" />}
// // // //             </div>
// // // //         </div>
// // // //         <div className="absolute top-2 left-2 right-2 flex justify-center">
// // // //              {!isMuted && audioStream && <AudioVisualizer audioStream={audioStream} />}
// // // //         </div>
// // // //       </div>
// // // //       <div className="p-3 bg-gray-800/50">
// // // //         <p className="text-md font-semibold truncate text-center">{name}</p>
// // // //       </div>
// // // //     </div>
// // // //   );
// // // // }



// // // // ==========================================================================================
// // // // file: src/components/Participant.jsx
// // // // COMPLETE SOLUTION:
// // // // - Programmatically plays remote audio to handle browser autoplay policies.
// // // // - Adds debug logs to track audio playback status.
// // // // ==========================================================================================
// // // import React, { useEffect, useRef } from 'react';
// // // import { User, Mic, MicOff, Video, VideoOff } from 'lucide-react';
// // // import AudioVisualizer from './AudioVisualizer';

// // // const VideoPlayer = ({ stream }) => {
// // //     const videoRef = useRef(null);
// // //     useEffect(() => {
// // //         if (videoRef.current && stream) {
// // //             videoRef.current.srcObject = stream;
// // //         }
// // //     }, [stream]);
// // //     return <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />;
// // // };

// // // const AudioPlayer = ({ stream, name }) => {
// // //     const audioRef = useRef(null);
// // //     useEffect(() => {
// // //         if (audioRef.current && stream) {
// // //             audioRef.current.srcObject = stream;
            
// // //             // Programmatically play the audio to work around browser autoplay policies.
// // //             const playPromise = audioRef.current.play();
// // //             if (playPromise !== undefined) {
// // //                 playPromise.then(_ => {
// // //                     console.log(`[VibeSync-Debug] Audio for ${name} started playing automatically.`);
// // //                 }).catch(error => {
// // //                     console.error(`[VibeSync-Debug] Autoplay for ${name}'s audio was prevented. Error: ${error}. This is common. A user interaction (like a click) is needed to start audio.`);
// // //                 });
// // //             }
// // //         }
// // //     }, [stream, name]);
// // //     return <audio ref={audioRef} autoPlay playsInline />;
// // // };

// // // export default function Participant({ name, isLocal, isMuted, isCameraOff, audioStream, videoStream }) {
// // //   return (
// // //     <div className="bg-gray-800 rounded-xl shadow-lg flex flex-col border-2 border-gray-700 overflow-hidden aspect-4/3">
// // //       {/* Remote audio is now handled here, hidden from view but playing */}
// // //       {!isLocal && audioStream && <AudioPlayer stream={audioStream} name={name} />}

// // //       <div className="relative flex-grow w-full h-full bg-gray-700 flex items-center justify-center">
// // //         {videoStream && !isCameraOff ? (
// // //           <VideoPlayer stream={videoStream} />
// // //         ) : (
// // //           <User className="w-1/3 h-1/3 text-gray-500" />
// // //         )}
// // //         <div className="absolute bottom-2 left-2 flex flex-col gap-2">
// // //             <div className={`p-2 rounded-full ${isMuted ? 'bg-red-500' : 'bg-green-500/70'}`}>
// // //                 {isMuted ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-white" />}
// // //             </div>
// // //              <div className={`p-2 rounded-full ${isCameraOff ? 'bg-red-500' : 'bg-green-500/70'}`}>
// // //                 {isCameraOff ? <VideoOff className="w-5 h-5 text-white" /> : <Video className="w-5 h-5 text-white" />}
// // //             </div>
// // //         </div>
// // //         <div className="absolute top-2 left-2 right-2 flex justify-center">
// // //              {!isMuted && audioStream && <AudioVisualizer audioStream={audioStream} />}
// // //         </div>
// // //       </div>
// // //       <div className="p-3 bg-gray-800/50">
// // //         <p className="text-md font-semibold truncate text-center">{name}</p>
// // //       </div>
// // //     </div>
// // //   );
// // // }


// // // ==========================================================================================
// // // file: src/components/Participant.jsx
// // // COMPLETE MODIFIED CODE:
// // // - Renders "Play" buttons for audio and video when streams are available but not playing.
// // // - Clicking the play button triggers the onResumeTrack function.
// // // - Only renders the HTML <audio> element when a user has chosen to play the stream.
// // // ==========================================================================================
// // import React, {
// //   useEffect,
// //   useRef
// // } from 'react';
// // import {
// //   User,
// //   Mic,
// //   MicOff,
// //   Video,
// //   VideoOff,
// //   PlayCircle
// // } from 'lucide-react';
// // import { useRoomStore } from '../hooks/useRoomStore';

// // const VideoPlayer = ({ stream }) => {
// //   const videoRef = useRef(null);
// //   useEffect(() => {
// //       if (videoRef.current && stream) videoRef.current.srcObject = stream;
// //   }, [stream]);
// //   return <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />;
// // };

// // const AudioPlayer = ({ stream }) => {
// //   const audioRef = useRef(null);
// //   useEffect(() => {
// //       if (audioRef.current && stream) audioRef.current.srcObject = stream;
// //   }, [stream]);
// //   return <audio ref={audioRef} autoPlay playsInline />;
// // };

// // export default function Participant({ participant, onResumeTrack }) {
// //   const { name, isLocal, audio, video } = participant;

// //   const handleResumeClick = (e, consumerId) => {
// //       e.stopPropagation(); // Prevent the event from bubbling up
// //       if (consumerId) onResumeTrack(consumerId);
// //   };

// //   // Determine the effective media state for UI icons
// //   const isEffectivelyMuted = isLocal ? useRoomStore.getState().isMuted : !audio.stream || !audio.isPlaying;
// //   const isEffectivelyCameraOff = isLocal ? useRoomStore.getState().isCameraOff : !video.stream || !video.isPlaying;

// //   return (
// //       <div className="bg-gray-800 rounded-xl shadow-lg flex flex-col border-2 border-gray-700 overflow-hidden aspect-4/3">
// //           {/* Audio player is only added to the DOM when the user clicks play */}
// //           {!isLocal && audio.stream && audio.isPlaying && <AudioPlayer stream={audio.stream} />}

// //           <div className="relative flex-grow w-full h-full bg-gray-700 flex items-center justify-center">
// //               {video.stream && video.isPlaying ? (
// //                   <VideoPlayer stream={video.stream} />
// //               ) : (
// //                   <>
// //                       <User className="w-1/3 h-1/3 text-gray-500" />
// //                       {/* Show Play button for Video */}
// //                       {!isLocal && video.stream && !video.isPlaying && (
// //                           <button
// //                               onClick={(e) => handleResumeClick(e, video.consumerId)}
// //                               className="absolute inset-0 flex items-center justify-center bg-black/50 transition-opacity opacity-75 hover:opacity-100"
// //                               aria-label={`Play video from ${name}`}
// //                           >
// //                               <PlayCircle className="w-16 h-16 text-white" />
// //                           </button>
// //                       )}
// //                   </>
// //               )}

// //               <div className="absolute bottom-2 left-2 flex flex-col gap-2">
// //                   <div className={`p-2 rounded-full ${isEffectivelyMuted ? 'bg-red-500' : 'bg-green-500/70'}`}>
// //                       {isEffectivelyMuted ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-white" />}
// //                   </div>
// //                   <div className={`p-2 rounded-full ${isEffectivelyCameraOff ? 'bg-red-500' : 'bg-green-500/70'}`}>
// //                       {isEffectivelyCameraOff ? <VideoOff className="w-5 h-5 text-white" /> : <Video className="w-5 h-5 text-white" />}
// //                   </div>
// //               </div>
// //           </div>

// //           <div className="p-3 bg-gray-800/50 flex items-center justify-center gap-2">
// //               <p className="text-md font-semibold truncate">{name}</p>
// //               {/* Show Play button for Audio */}
// //               {!isLocal && audio.stream && !audio.isPlaying && (
// //                   <button
// //                       onClick={(e) => handleResumeClick(e, audio.consumerId)}
// //                       title={`Play audio from ${name}`}
// //                       aria-label={`Play audio from ${name}`}
// //                   >
// //                       <PlayCircle className="w-5 h-5 text-purple-400 hover:text-purple-300" />
// //                   </button>
// //               )}
// //           </div>
// //       </div>
// //   );
// // }

// // ==========================================================================================
// // file: src/components/Participant.jsx
// // COMPLETE MODIFIED CODE:
// // - Adds a large, central "Play" button to resume both audio and video tracks at once.
// // - Retains individual play buttons if only one track is available to be consumed.
// // ==========================================================================================
// import React, {
//   useEffect,
//   useRef
// } from 'react';
// import {
//   User,
//   Mic,
//   MicOff,
//   Video,
//   VideoOff,
//   PlayCircle
// } from 'lucide-react';
// import { useRoomStore } from '../hooks/useRoomStore';

// const VideoPlayer = ({ stream }) => {
//   const videoRef = useRef(null);
//   useEffect(() => {
//       if (videoRef.current && stream) videoRef.current.srcObject = stream;
//   }, [stream]);
//   return <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />;
// };

// const AudioPlayer = ({ stream }) => {
//   const audioRef = useRef(null);
//   useEffect(() => {
//       if (audioRef.current && stream) audioRef.current.srcObject = stream;
//   }, [stream]);
//   return <audio ref={audioRef} autoPlay playsInline />;
// };

// export default function Participant({ participant, onResumeTrack, onResumeAllTracks }) {
//   const { id, name, isLocal, audio, video } = participant;

//   const handleResumeClick = (e, consumerId) => {
//       e.stopPropagation(); // Prevent the event from bubbling up
//       if (consumerId) onResumeTrack(consumerId);
//   };

//   const handleResumeAllClick = (e, participantId) => {
//       e.stopPropagation();
//       if (participantId) onResumeAllTracks(participantId);
//   };

//   // Determine the effective media state for UI icons
//   const isEffectivelyMuted = isLocal ? useRoomStore.getState().isMuted : !audio.stream || !audio.isPlaying;
//   const isEffectivelyCameraOff = isLocal ? useRoomStore.getState().isCameraOff : !video.stream || !video.isPlaying;

//   const canPlayAll = !isLocal && audio.stream && !audio.isPlaying && video.stream && !video.isPlaying;
//   const canPlayAudio = !isLocal && audio.stream && !audio.isPlaying && !canPlayAll;
//   const canPlayVideo = !isLocal && video.stream && !video.isPlaying && !canPlayAll;

//   return (
//       <div className="bg-gray-800 rounded-xl shadow-lg flex flex-col border-2 border-gray-700 overflow-hidden aspect-4/3">
//           {/* Audio player is only added to the DOM when the user clicks play */}
//           {!isLocal && audio.stream && audio.isPlaying && <AudioPlayer stream={audio.stream} />}

//           <div className="relative flex-grow w-full h-full bg-gray-700 flex items-center justify-center">
//               {video.stream && video.isPlaying ? (
//                   <VideoPlayer stream={video.stream} />
//               ) : (
//                   <>
//                       <User className="w-1/3 h-1/3 text-gray-500" />
//                       {/* Show "Play All" button */}
//                       {canPlayAll && (
//                           <button
//                               onClick={(e) => handleResumeAllClick(e, id)}
//                               className="absolute inset-0 flex items-center justify-center bg-black/50 transition-opacity opacity-75 hover:opacity-100"
//                               aria-label={`Play all from ${name}`}
//                           >
//                               <PlayCircle className="w-16 h-16 text-white" />
//                           </button>
//                       )}
//                       {/* Show individual "Play Video" button if "Play All" isn't shown */}
//                       {canPlayVideo && (
//                            <button
//                               onClick={(e) => handleResumeClick(e, video.consumerId)}
//                               className="absolute inset-0 flex items-center justify-center bg-black/50 transition-opacity opacity-75 hover:opacity-100"
//                               aria-label={`Play video from ${name}`}
//                           >
//                               <PlayCircle className="w-16 h-16 text-white" />
//                           </button>
//                       )}
//                   </>
//               )}

//               <div className="absolute bottom-2 left-2 flex flex-col gap-2">
//                   <div className={`p-2 rounded-full ${isEffectivelyMuted ? 'bg-red-500' : 'bg-green-500/70'}`}>
//                       {isEffectivelyMuted ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-white" />}
//                   </div>
//                   <div className={`p-2 rounded-full ${isEffectivelyCameraOff ? 'bg-red-500' : 'bg-green-500/70'}`}>
//                       {isEffectivelyCameraOff ? <VideoOff className="w-5 h-5 text-white" /> : <Video className="w-5 h-5 text-white" />}
//                   </div>
//               </div>
//           </div>

//           <div className="p-3 bg-gray-800/50 flex items-center justify-center gap-2">
//               <p className="text-md font-semibold truncate">{name}</p>
//               {/* Show individual "Play Audio" button if "Play All" isn't shown */}
//               {canPlayAudio && (
//                   <button
//                       onClick={(e) => handleResumeClick(e, audio.consumerId)}
//                       title={`Play audio from ${name}`}
//                       aria-label={`Play audio from ${name}`}
//                   >
//                       <PlayCircle className="w-5 h-5 text-purple-400 hover:text-purple-300" />
//                   </button>
//               )}
//           </div>
//       </div>
//   );
// }


// frontend/src/components/Participant.jsx

import React, { useEffect, useRef } from 'react';
import { User, Mic, MicOff, Video, VideoOff, PlayCircle } from 'lucide-react';
import { useRoomStore } from '../hooks/useRoomStore';
import AudioVisualizer from './AudioVisualizer';

export default function Participant({ participant, userHasInteracted }) {
    const { id, name, isLocal, audio, video } = participant;
    
    const audioRef = useRef(null);
    const videoRef = useRef(null);

    // This effect reliably attaches the stream to the media element
    useEffect(() => {
        if (videoRef.current && video.stream) {
            videoRef.current.srcObject = video.stream;
        }
    }, [video.stream]);

    useEffect(() => {
        if (audioRef.current && audio.stream) {
            audioRef.current.srcObject = audio.stream;
        }
    }, [audio.stream]);

    // This effect handles the actual playback logic based on the `isPlaying` state
    useEffect(() => {
        const playMedia = async (element, mediaType) => {
            if (element && element.paused) {
                try {
                    await element.play();
                } catch (error) {
                    if (error.name !== 'AbortError') {
                        console.error(`[ERROR] Autoplay for ${mediaType} failed for ${name}:`, error);
                    }
                }
            }
        };

        if (userHasInteracted && !isLocal) {
            if (video.stream && video.isPlaying) {
                playMedia(videoRef.current, 'video');
            }
            if (audio.stream && audio.isPlaying) {
                playMedia(audioRef.current, 'audio');
            }
        }
    }, [userHasInteracted, video.isPlaying, audio.isPlaying, video.stream, audio.stream, isLocal, name]);
    
    // UI State Determination
    const isMutedForUI = isLocal ? useRoomStore(state => state.isMuted) : !audio.stream || !audio.isPlaying;
    const isCameraOffForUI = isLocal ? useRoomStore(state => state.isCameraOff) : !video.stream || !video.isPlaying;
    
    return (
        <div className="bg-gray-800 rounded-xl shadow-lg flex flex-col border-2 border-gray-700 overflow-hidden aspect-4/3 relative">
            <video 
                ref={videoRef} 
                autoPlay={isLocal} 
                playsInline 
                muted // Muted for both local (to prevent feedback) and remote (to allow autoplay)
                className={`w-full h-full object-cover ${isCameraOffForUI ? 'hidden' : 'block'}`} 
            />
            
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