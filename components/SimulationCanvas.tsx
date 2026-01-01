import React, { useEffect, useRef, useCallback } from 'react';
import { SimulationParams, Particle } from '../types';

interface SimulationCanvasProps {
  params: SimulationParams;
  showField: boolean;
}

const SimulationCanvas: React.FC<SimulationCanvasProps> = ({ params, showField }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  
  // Initialize particles
  useEffect(() => {
    // Only re-initialize if the count changes drastically or array is empty
    // to preserve current positions when other params change
    if (particlesRef.current.length !== params.particleCount) {
      const particles: Particle[] = [];
      for (let i = 0; i < params.particleCount; i++) {
        particles.push({
          x: Math.random(),
          y: Math.random(),
          vx: 0,
          vy: 0
        });
      }
      particlesRef.current = particles;
    }
  }, [params.particleCount]);

  // Physics and Drawing Loop
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    
    // Calculate scaling for rendering
    const scale = Math.min(width, height);
    const offsetX = (width - scale) / 2;
    const offsetY = (height - scale) / 2;

    // --- 1. Draw Background ---
    ctx.fillStyle = '#1e293b'; // Slate-800
    ctx.fillRect(0, 0, width, height);

    // Draw plate area
    ctx.fillStyle = '#0f172a'; // Slate-900 (The plate)
    ctx.fillRect(offsetX, offsetY, scale, scale);

    // --- 2. Wave Field Visualization (Optional) ---
    if (showField) {
      const fieldRes = 100;
      const cellW = scale / fieldRes;
      const cellH = scale / fieldRes;
      
      for (let i = 0; i < fieldRes; i++) {
        for (let j = 0; j < fieldRes; j++) {
          const x = i / fieldRes;
          const y = j / fieldRes;
          
          let val = 0;
          const nx = x * 2 - 1;
          const ny = y * 2 - 1;

          if (params.mode === 'chladni') {
             val = Math.cos(params.frequencyN * Math.PI * nx) * Math.cos(params.frequencyM * Math.PI * ny) -
                   Math.cos(params.frequencyM * Math.PI * nx) * Math.cos(params.frequencyN * Math.PI * ny);
          } else {
             const d1 = Math.sqrt(Math.pow(nx + 0.5, 2) + Math.pow(ny, 2));
             const d2 = Math.sqrt(Math.pow(nx - 0.5, 2) + Math.pow(ny, 2));
             val = Math.sin(d1 * params.frequencyM * 10) + Math.sin(d2 * params.frequencyM * 10 + params.frequencyN);
          }

          const intensity = Math.abs(val);
          
          if (intensity < 0.1) {
             ctx.fillStyle = `rgba(16, 185, 129, 0.3)`; // Emerald for nodes
             ctx.fillRect(offsetX + i * cellW, offsetY + j * cellH, cellW, cellH);
          } else {
             const redAlpha = Math.min(intensity * 0.2, 0.5);
             ctx.fillStyle = `rgba(239, 68, 68, ${redAlpha})`;
             ctx.fillRect(offsetX + i * cellW, offsetY + j * cellH, cellW, cellH);
          }
        }
      }
    }

    // --- 3. Particle Physics & Rendering ---
    // User requested GREEN sand particles
    ctx.fillStyle = '#4ade80'; // Emerald-400
    
    const particleSize = 1.5; 

    const PI = Math.PI;
    const M_PI = params.frequencyM * PI;
    const N_PI = params.frequencyN * PI;

    // Physics Scaling Fix:
    // User wants 100% amplitude to be usable (not instant explosion).
    // Using quadratic scaling for finer control at low amplitudes.
    // Normalized Amp 0-1.
    const normalizedAmp = params.amplitude / 100;
    // Max movement per frame approx 1-2% of screen width at 100% amp.
    const maxMove = 0.02; 
    const vibrationStrength = normalizedAmp * normalizedAmp * maxMove;

    particlesRef.current.forEach(p => {
        const nx = p.x * 2 - 1;
        const ny = p.y * 2 - 1;

        let amplitude = 0;

        if (params.mode === 'chladni') {
            amplitude = Math.cos(N_PI * nx) * Math.cos(M_PI * ny) - 
                        Math.cos(M_PI * nx) * Math.cos(N_PI * ny);
        } else {
            const d1 = Math.sqrt(Math.pow(nx + 0.5, 2) + Math.pow(ny, 2));
            const d2 = Math.sqrt(Math.pow(nx - 0.5, 2) + Math.pow(ny, 2));
            amplitude = Math.sin(d1 * params.frequencyM * 10) + Math.sin(d2 * params.frequencyM * 10 + params.frequencyN); 
        }

        const shake = Math.abs(amplitude) * vibrationStrength;
        
        // Random displacement (simulating bouncing)
        const dx = (Math.random() - 0.5) * shake;
        const dy = (Math.random() - 0.5) * shake;

        p.x += dx;
        p.y += dy;

        // --- RESPAWN LOGIC ---
        // If particle falls off the plate (out of 0-1 bounds), respawn it randomly
        // This ensures the sand amount remains constant as requested.
        if (p.x < 0 || p.x > 1 || p.y < 0 || p.y > 1) {
             p.x = Math.random();
             p.y = Math.random();
        }

        // Render
        const screenX = offsetX + p.x * scale;
        const screenY = offsetY + p.y * scale;
        
        ctx.fillRect(screenX, screenY, particleSize, particleSize);
    });

    requestRef.current = requestAnimationFrame(animate);
  }, [params, showField]);

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const parent = canvasRef.current.parentElement;
        if (parent) {
          canvasRef.current.width = parent.clientWidth;
          canvasRef.current.height = parent.clientHeight;
        }
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); 

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [animate]);

  return (
    <div className="w-full h-full bg-slate-900 rounded-lg overflow-hidden shadow-2xl relative">
       <canvas ref={canvasRef} className="block w-full h-full" />
       
       <div className="absolute top-4 left-4 pointer-events-none mix-blend-difference">
          <div className="text-white/30 text-4xl font-black tracking-widest uppercase">
            Cymatics
          </div>
       </div>
    </div>
  );
};

export default SimulationCanvas;