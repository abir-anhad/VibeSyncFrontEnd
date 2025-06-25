// // // // ==========================================================================================
// // // // file: src/pages/RoomPage.jsx
// // // // ==========================================================================================
// // // import React, { useEffect, useRef } from 'react';
// // // import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
// // // import { useRoomStore } from '../hooks/useRoomStore';
// // // import { MediasoupHandler } from '../lib/mediasoup-handler';
// // // import Participant from '../components/Participant';
// // // import Controls from '../components/Controls';
// // // import { Headphones, WifiOff } from 'lucide-react';

// // // export default function RoomPage() {
// // //   const { roomName } = useParams();
// // //   const [searchParams] = useSearchParams();
// // //   const userName = searchParams.get('userName');
// // //   const navigate = useNavigate();

// // //   const { connectionStatus, participants, isMuted, isCameraOff, setConnectionStatus, resetState } = useRoomStore();
// // //   const mediasoupHandlerRef = useRef(null);

// // //   useEffect(() => {
// // //     if (!userName) { navigate('/'); return; }

// // //     setConnectionStatus('connecting');
// // //     const handler = new MediasoupHandler({ userName, roomName });
// // //     mediasoupHandlerRef.current = handler;

// // //     handler.join().catch(error => {
// // //       console.error("Failed to join room:", error);
// // //       alert("Could not connect to the room. Please check permissions or try again.");
// // //       navigate('/');
// // //     });

// // //     return () => { mediasoupHandlerRef.current?.close(); resetState(); };
// // //   }, [userName, roomName, navigate, setConnectionStatus, resetState]);

// // //   const handleLeave = () => navigate('/');
// // //   const handleMuteToggle = () => mediasoupHandlerRef.current?.toggleMute();
// // //   const handleCameraToggle = () => mediasoupHandlerRef.current?.toggleCamera();
  
// // //   if (connectionStatus === 'connecting') {
// // //     return (
// // //       <div className="flex flex-col items-center justify-center min-h-screen text-white">
// // //         <Headphones className="w-16 h-16 mb-4 text-purple-400 animate-pulse" />
// // //         <p className="text-xl">Connecting to <span className="font-bold">{decodeURIComponent(roomName)}</span>...</p>
// // //       </div>
// // //     );
// // //   }

// // //   if (connectionStatus === 'disconnected') {
// // //     return (
// // //       <div className="flex flex-col items-center justify-center min-h-screen text-white">
// // //         <WifiOff className="w-16 h-16 mb-4 text-red-500" />
// // //         <p className="text-xl">Connection lost.</p>
// // //         <Link to="/" className="mt-4 px-4 py-2 bg-purple-600 rounded-md hover:bg-purple-700">Return to Lobby</Link>
// // //       </div>
// // //     );
// // //   }

// // //   return (
// // //     <div className="flex flex-col h-screen text-white font-sans">
// // //       <header className="px-4 py-3 bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 flex items-center justify-between z-10">
// // //         <h1 className="text-xl font-bold">VibeSync: <span className="text-purple-400">{decodeURIComponent(roomName)}</span></h1>
// // //         <p className="text-sm text-gray-400">{participants.length} Participant{participants.length !== 1 ? 's' : ''} Online</p>
// // //       </header>
// // //       <main className="flex-grow p-4 md:p-8 overflow-y-auto">
// // //         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
// // //           {participants.map(p => (
// // //             <Participant
// // //               key={p.id}
// // //               name={p.isLocal ? `${p.name} (You)` : p.name}
// // //               isLocal={p.isLocal}
// // //               isMuted={p.isLocal ? isMuted : p.isAudioMuted}
// // //               isCameraOff={p.isLocal ? isCameraOff : p.isVideoOff}
// // //               audioStream={p.audioStream}
// // //               videoStream={p.videoStream}
// // //             />
// // //           ))}
// // //         </div>
// // //       </main>
// // //       <footer className="px-4 py-4 bg-gray-800/50 backdrop-blur-sm border-t border-gray-700">
// // //         <Controls isMuted={isMuted} isCameraOff={isCameraOff} onMuteToggle={handleMuteToggle} onCameraToggle={handleCameraToggle} onLeave={handleLeave} />
// // //       </footer>
// // //     </div>
// // //   );
// // // }


// // // ==========================================================================================
// // // file: src/pages/RoomPage.jsx
// // // COMPLETE MODIFIED CODE:
// // // - Creates the `handleResumeTrack` function to be passed to child components.
// // // - Passes the entire participant object to the `Participant` component for cleaner state management.
// // // ==========================================================================================
// // import React, {
// //   useEffect,
// //   useRef
// // } from 'react';
// // import {
// //   useParams,
// //   useSearchParams,
// //   useNavigate,
// //   Link
// // } from 'react-router-dom';
// // import {
// //   useRoomStore
// // } from '../hooks/useRoomStore';
// // import {
// //   MediasoupHandler
// // } from '../lib/mediasoup-handler';
// // import Participant from '../components/Participant';
// // import Controls from '../components/Controls';
// // import {
// //   Headphones,
// //   WifiOff
// // } from 'lucide-react';

// // export default function RoomPage() {
// //   const {
// //       roomName
// //   } = useParams();
// //   const [searchParams] = useSearchParams();
// //   const userName = searchParams.get('userName');
// //   const navigate = useNavigate();

// //   const {
// //       connectionStatus,
// //       participants,
// //       isMuted,
// //       isCameraOff,
// //       setConnectionStatus,
// //       resetState
// //   } = useRoomStore();
// //   const mediasoupHandlerRef = useRef(null);

// //   useEffect(() => {
// //       if (!userName) {
// //           navigate('/');
// //           return;
// //       }

// //       setConnectionStatus('connecting');
// //       const handler = new MediasoupHandler({
// //           userName,
// //           roomName
// //       });
// //       mediasoupHandlerRef.current = handler;

// //       handler.join().catch(error => {
// //           console.error("Failed to join room:", error);
// //           alert("Could not connect to the room. Please check permissions or try again.");
// //           navigate('/');
// //       });

// //       return () => {
// //           mediasoupHandlerRef.current?.close();
// //           resetState();
// //       };
// //   }, [userName, roomName, navigate, setConnectionStatus, resetState]);

// //   const handleLeave = () => navigate('/');
// //   const handleMuteToggle = () => mediasoupHandlerRef.current?.toggleMute();
// //   const handleCameraToggle = () => mediasoupHandlerRef.current?.toggleCamera();
// //   const handleResumeTrack = (consumerId) => mediasoupHandlerRef.current?.resumeTrack(consumerId);

// //   if (connectionStatus === 'connecting') {
// //       return (
// //           <div className="flex flex-col items-center justify-center min-h-screen text-white">
// //               <Headphones className="w-16 h-16 mb-4 text-purple-400 animate-pulse" />
// //               <p className="text-xl">Connecting to <span className="font-bold">{decodeURIComponent(roomName)}</span>...</p>
// //           </div>
// //       );
// //   }

// //   if (connectionStatus === 'disconnected') {
// //       return (
// //           <div className="flex flex-col items-center justify-center min-h-screen text-white">
// //               <WifiOff className="w-16 h-16 mb-4 text-red-500" />
// //               <p className="text-xl">Connection lost.</p>
// //               <Link to="/" className="mt-4 px-4 py-2 bg-purple-600 rounded-md hover:bg-purple-700">Return to Lobby</Link>
// //           </div>
// //       );
// //   }

// //   return (
// //       <div className="flex flex-col h-screen text-white font-sans">
// //           <header className="px-4 py-3 bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 flex items-center justify-between z-10">
// //               <h1 className="text-xl font-bold">VibeSync: <span className="text-purple-400">{decodeURIComponent(roomName)}</span></h1>
// //               <p className="text-sm text-gray-400">{participants.length} Participant{participants.length !== 1 ? 's' : ''} Online</p>
// //           </header>

// //           <main className="flex-grow p-4 md:p-8 overflow-y-auto">
// //               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
// //                   {participants.map(p => (
// //                       <Participant
// //                           key={p.id}
// //                           participant={p}
// //                           onResumeTrack={handleResumeTrack}
// //                       />
// //                   ))}
// //               </div>
// //           </main>

// //           <footer className="px-4 py-4 bg-gray-800/50 backdrop-blur-sm border-t border-gray-700">
// //               <Controls
// //                   isMuted={isMuted}
// //                   isCameraOff={isCameraOff}
// //                   onMuteToggle={handleMuteToggle}
// //                   onCameraToggle={handleCameraToggle}
// //                   onLeave={handleLeave}
// //               />
// //           </footer>
// //       </div>
// //   );
// // }

// // ==========================================================================================
// // file: src/pages/RoomPage.jsx
// // COMPLETE MODIFIED CODE:
// // - Adds a new `handleResumeAllTracks` function to resume both audio and video for a participant.
// // - Passes the new handler down to the Participant component.
// // ==========================================================================================
// import React, {
//   useEffect,
//   useRef
// } from 'react';
// import {
//   useParams,
//   useSearchParams,
//   useNavigate,
//   Link
// } from 'react-router-dom';
// import {
//   useRoomStore
// } from '../hooks/useRoomStore';
// import {
//   MediasoupHandler
// } from '../lib/mediasoup-handler';
// import Participant from '../components/Participant';
// import Controls from '../components/Controls';
// import {
//   Headphones,
//   WifiOff
// } from 'lucide-react';

// export default function RoomPage() {
//   const {
//       roomName
//   } = useParams();
//   const [searchParams] = useSearchParams();
//   const userName = searchParams.get('userName');
//   const navigate = useNavigate();

//   const {
//       connectionStatus,
//       participants,
//       isMuted,
//       isCameraOff,
//       setConnectionStatus,
//       resetState
//   } = useRoomStore();
//   const mediasoupHandlerRef = useRef(null);

//   useEffect(() => {
//       if (!userName) {
//           navigate('/');
//           return;
//       }

//       setConnectionStatus('connecting');
//       const handler = new MediasoupHandler({
//           userName,
//           roomName
//       });
//       mediasoupHandlerRef.current = handler;

//       handler.join().catch(error => {
//           console.error("Failed to join room:", error);
//           alert("Could not connect to the room. Please check permissions or try again.");
//           navigate('/');
//       });

//       return () => {
//           mediasoupHandlerRef.current?.close();
//           resetState();
//       };
//   }, [userName, roomName, navigate, setConnectionStatus, resetState]);

//   const handleLeave = () => navigate('/');
//   const handleMuteToggle = () => mediasoupHandlerRef.current?.toggleMute();
//   const handleCameraToggle = () => mediasoupHandlerRef.current?.toggleCamera();
//   const handleResumeTrack = (consumerId) => mediasoupHandlerRef.current?.resumeTrack(consumerId);

//   const handleResumeAllTracks = (participantId) => {
//       const participant = participants.find(p => p.id === participantId);
//       if (participant) {
//           if (participant.audio.consumerId) {
//               handleResumeTrack(participant.audio.consumerId);
//           }
//           if (participant.video.consumerId) {
//               handleResumeTrack(participant.video.consumerId);
//           }
//       }
//   };

//   if (connectionStatus === 'connecting') {
//       return (
//           <div className="flex flex-col items-center justify-center min-h-screen text-white">
//               <Headphones className="w-16 h-16 mb-4 text-purple-400 animate-pulse" />
//               <p className="text-xl">Connecting to <span className="font-bold">{decodeURIComponent(roomName)}</span>...</p>
//           </div>
//       );
//   }

//   if (connectionStatus === 'disconnected') {
//       return (
//           <div className="flex flex-col items-center justify-center min-h-screen text-white">
//               <WifiOff className="w-16 h-16 mb-4 text-red-500" />
//               <p className="text-xl">Connection lost.</p>
//               <Link to="/" className="mt-4 px-4 py-2 bg-purple-600 rounded-md hover:bg-purple-700">Return to Lobby</Link>
//           </div>
//       );
//   }

//   return (
//       <div className="flex flex-col h-screen text-white font-sans">
//           <header className="px-4 py-3 bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 flex items-center justify-between z-10">
//               <h1 className="text-xl font-bold">VibeSync: <span className="text-purple-400">{decodeURIComponent(roomName)}</span></h1>
//               <p className="text-sm text-gray-400">{participants.length} Participant{participants.length !== 1 ? 's' : ''} Online</p>
//           </header>

//           <main className="flex-grow p-4 md:p-8 overflow-y-auto">
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//                   {participants.map(p => (
//                       <Participant
//                           key={p.id}
//                           participant={p}
//                           onResumeTrack={handleResumeTrack}
//                           onResumeAllTracks={handleResumeAllTracks}
//                       />
//                   ))}
//               </div>
//           </main>

//           <footer className="px-4 py-4 bg-gray-800/50 backdrop-blur-sm border-t border-gray-700">
//               <Controls
//                   isMuted={isMuted}
//                   isCameraOff={isCameraOff}
//                   onMuteToggle={handleMuteToggle}
//                   onCameraToggle={handleCameraToggle}
//                   onLeave={handleLeave}
//               />
//           </footer>
//       </div>
//   );
// }


// frontend/src/pages/RoomPage.jsx

import React, { useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useRoomStore } from '../hooks/useRoomStore';
import { MediasoupHandler } from '../lib/mediasoup-handler';
import Participant from '../components/Participant';
import Controls from '../components/Controls';
import { Headphones, WifiOff, Play } from 'lucide-react';

export default function RoomPage() {
    const { roomName } = useParams();
    const [searchParams] = useSearchParams();
    const userName = searchParams.get('userName');
    const navigate = useNavigate();
    const [userHasInteracted, setUserHasInteracted] = useState(false);

    const {
        connectionStatus,
        participants,
        isMuted,
        isCameraOff,
        setConnectionStatus,
        resetState
    } = useRoomStore();
    const mediasoupHandlerRef = useRef(null);

    useEffect(() => {
        if (!userName) {
            navigate('/');
            return;
        }

        setConnectionStatus('connecting');
        const handler = new MediasoupHandler({ userName, roomName });
        mediasoupHandlerRef.current = handler;

        handler.join().catch(error => {
            console.error("Failed to join room:", error);
            alert("Could not connect to the room. Please check permissions or try again.");
            navigate('/');
        });

        return () => {
            mediasoupHandlerRef.current?.close();
            resetState();
        };
    }, [userName, roomName, navigate, setConnectionStatus, resetState]);

    const handleLeave = () => navigate('/');
    const handleMuteToggle = () => mediasoupHandlerRef.current?.toggleMute();
    const handleCameraToggle = () => mediasoupHandlerRef.current?.toggleCamera();

    const handleInitialInteraction = () => {
        setUserHasInteracted(true);
    };

    if (connectionStatus === 'connecting') {
        return <div className="flex flex-col items-center justify-center min-h-screen text-white"><Headphones className="w-16 h-16 mb-4 text-purple-400 animate-pulse" /><p className="text-xl">Connecting to <span className="font-bold">{decodeURIComponent(roomName)}</span>...</p></div>;
    }

    if (connectionStatus === 'disconnected') {
        return <div className="flex flex-col items-center justify-center min-h-screen text-white"><WifiOff className="w-16 h-16 mb-4 text-red-500" /><p className="text-xl">Connection lost.</p><Link to="/" className="mt-4 px-4 py-2 bg-purple-600 rounded-md hover:bg-purple-700">Return to Lobby</Link></div>;
    }

    return (
        <div className="flex flex-col h-screen text-white font-sans">
            {!userHasInteracted && (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-50">
                    <h2 className="text-3xl font-bold mb-4">Ready to Join?</h2>
                    <p className="text-lg mb-8">Click the button below to enable audio and video.</p>
                    <button onClick={handleInitialInteraction} className="flex items-center gap-2 px-6 py-3 bg-purple-600 rounded-md text-xl font-semibold hover:bg-purple-700 transition-colors"><Play className="w-6 h-6" />Let's Go</button>
                </div>
            )}
            <header className="px-4 py-3 bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 flex items-center justify-between z-10">
                <h1 className="text-xl font-bold">VibeSync: <span className="text-purple-400">{decodeURIComponent(roomName)}</span></h1>
                <p className="text-sm text-gray-400">{participants.length} Participant{participants.length !== 1 ? 's' : ''} Online</p>
            </header>
            <main className="flex-grow p-4 md:p-8 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {participants.map(p => (
                        <Participant
                            key={p.id}
                            participant={p}
                            userHasInteracted={userHasInteracted}
                        />
                    ))}
                </div>
            </main>
            <footer className="px-4 py-4 bg-gray-800/50 backdrop-blur-sm border-t border-gray-700">
                <Controls isMuted={isMuted} isCameraOff={isCameraOff} onMuteToggle={handleMuteToggle} onCameraToggle={handleCameraToggle} onLeave={handleLeave} />
            </footer>
        </div>
    );
}