export interface SimulationParams {
  frequencyM: number;
  frequencyN: number;
  amplitude: number;
  speed: number;
  resolution: number;
  particleCount: number;
  damping: number;
  mode: 'chladni' | 'interference';
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
}
