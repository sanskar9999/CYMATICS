// Simple oscillator to provide auditory feedback
let audioContext: AudioContext | null = null;
let oscillator: OscillatorNode | null = null;
let gainNode: GainNode | null = null;

export const initAudio = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    gainNode = audioContext.createGain();
    gainNode.connect(audioContext.destination);
    gainNode.gain.value = 0; // Start muted
  }
};

export const playTone = (m: number, n: number, volume: number) => {
  if (!audioContext || !gainNode) initAudio();
  if (!audioContext || !gainNode) return;

  // Approximate frequency mapping based on Chladni's law for square plates
  // f ~ (m^2 + n^2) roughly, adjusted for pleasant hearing range
  const baseFreq = 100;
  const targetFreq = baseFreq + (Math.pow(m, 2) + Math.pow(n, 2)) * 15;

  // Clamp frequency to human hearing range and avoid piercing highs
  const clampedFreq = Math.min(Math.max(targetFreq, 60), 2000);

  if (!oscillator) {
    oscillator = audioContext.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.value = clampedFreq;
    oscillator.connect(gainNode);
    oscillator.start();
  } else {
    // Smooth transition
    oscillator.frequency.setTargetAtTime(clampedFreq, audioContext.currentTime, 0.1);
  }

  // Smooth volume transition
  gainNode.gain.setTargetAtTime(volume * 0.1, audioContext.currentTime, 0.1);
};

export const stopTone = () => {
  if (gainNode && audioContext) {
    gainNode.gain.setTargetAtTime(0, audioContext.currentTime, 0.1);
  }
};

export const toggleMute = (isMuted: boolean) => {
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume();
  }
};
