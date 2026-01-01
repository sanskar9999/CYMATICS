import React, { useState, useEffect, useRef } from 'react';
import SimulationCanvas from './components/SimulationCanvas';
import Controls from './components/Controls';
import { SimulationParams } from './types';
import { playTone, stopTone } from './utils/audio';

function App() {
  const [params, setParams] = useState<SimulationParams>({
    frequencyM: 1,
    frequencyN: 1,
    amplitude: 100, // Default to 100% as requested, physics adapted to handle it
    speed: 1,
    resolution: 1,
    particleCount: 15000,
    damping: 0.95,
    mode: 'chladni'
  });

  const [showField, setShowField] = useState(false);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isAutoMode, setIsAutoMode] = useState(true);
  
  // Ref to track time for smooth auto-animation independent of renders
  const timeRef = useRef(0);

  // Audio effect management
  useEffect(() => {
    if (isAudioOn && params.amplitude > 0) {
      // Map amplitude to volume (non-linear for better hearing comfort)
      const normalizedAmp = params.amplitude / 100;
      const volume = normalizedAmp * 0.15;
      playTone(params.frequencyM, params.frequencyN, volume);
    } else {
      stopTone();
    }
  }, [params.frequencyM, params.frequencyN, params.amplitude, isAudioOn]);

  // Auto Mode Logic
  useEffect(() => {
    if (!isAutoMode) return;

    let animationFrame: number;
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      const dt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      
      // Increment internal time
      // Speed determines how fast the cycle goes
      timeRef.current += dt * 0.2; // Slow base speed

      const t = timeRef.current;

      // N oscillates 1 -> 20 -> 1 smoothly (Sine wave)
      // Range 1 to 20. Center 10.5, Amplitude 9.5
      // cos(t) goes 1 -> -1 -> 1.
      // We want 1 -> 20 -> 1.
      // 10.5 - 9.5 * cos(t) starts at 1 (when t=0), goes to 20 (when t=PI), back to 1 (when t=2PI)
      const nVal = 10.5 - 9.5 * Math.cos(t);

      // M moves very slowly, exploring combinations
      // Let's make M increment by 1 every time N completes a full cycle (2PI)?
      // Or just a very slow continuous drift
      // Range 1 to 10 is usually enough for M to keep it interesting without getting too high pitch/complex
      const mVal = 1 + (t / (2 * Math.PI)) % 19; 

      setParams(prev => ({
        ...prev,
        frequencyN: Math.max(1, Math.min(20, nVal)),
        frequencyM: Math.max(1, Math.min(20, mVal))
      }));

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [isAutoMode]);

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-slate-950 text-white overflow-hidden">
      {/* Main Canvas Area */}
      <div className="flex-1 relative order-2 md:order-1 h-[60vh] md:h-full p-4 md:p-6 flex flex-col items-center justify-center">
        <SimulationCanvas 
          params={params} 
          showField={showField}
        />
        
        {/* Mobile-only hint */}
        <div className="md:hidden absolute bottom-6 text-xs text-slate-500 bg-slate-900/80 px-3 py-1 rounded-full backdrop-blur">
          Scroll down for controls
        </div>
      </div>

      {/* Sidebar Controls */}
      <div className="order-1 md:order-2 h-[40vh] md:h-full w-full md:w-auto z-10 shadow-2xl">
        <Controls 
          params={params}
          setParams={setParams}
          showField={showField}
          setShowField={setShowField}
          isAudioOn={isAudioOn}
          setIsAudioOn={setIsAudioOn}
          isAutoMode={isAutoMode}
          setIsAutoMode={setIsAutoMode}
        />
      </div>
    </div>
  );
}

export default App;