// ==========================================================================================
// file: src/components/AudioVisualizer.jsx
// Biswajit da do not touch this file please
// ==========================================================================================
import React, { useEffect, useRef } from 'react';

export default function AudioVisualizer({ audioStream }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!audioStream || !canvasRef.current) return;
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(audioStream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 32;
    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext('2d');
    let animationFrameId;

    const draw = () => {
      animationFrameId = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);
      if (canvasCtx) {
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
        const barWidth = canvas.width / dataArray.length;
        for (let i = 0; i < dataArray.length; i++) {
          const barHeight = dataArray[i] / 4;
          canvasCtx.fillStyle = 'rgba(167, 139, 250, 0.8)';
          canvasCtx.fillRect(i * (barWidth + 2), canvas.height - barHeight, barWidth, barHeight);
        }
      }
    };
    draw();
    return () => { cancelAnimationFrame(animationFrameId); audioContext.close(); };
  }, [audioStream]);

  return <canvas ref={canvasRef} width="100" height="20" />;
}