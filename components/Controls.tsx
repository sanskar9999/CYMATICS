import React from 'react';
import { SimulationParams } from '../types';
import { Waves, Volume2, VolumeX, Eye, EyeOff, PlayCircle, PauseCircle } from 'lucide-react';

interface ControlsProps {
  params: SimulationParams;
  setParams: React.Dispatch<React.SetStateAction<SimulationParams>>;
  showField: boolean;
  setShowField: (show: boolean) => void;
  isAudioOn: boolean;
  setIsAudioOn: (on: boolean) => void;
  isAutoMode: boolean;
  setIsAutoMode: (auto: boolean) => void;
}

const Controls: React.FC<ControlsProps> = ({ 
  params, 
  setParams, 
  showField, 
  setShowField,
  isAudioOn,
  setIsAudioOn,
  isAutoMode,
  setIsAutoMode
}) => {
  
  const handleChange = (key: keyof SimulationParams, value: number | string) => {
    // If user touches frequency controls, turn off auto mode
    if ((key === 'frequencyM' || key === 'frequencyN') && isAutoMode) {
        setIsAutoMode(false);
    }

    setParams(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="w-full md:w-80 bg-slate-900/90 backdrop-blur-md border-l border-slate-700 p-6 flex flex-col gap-6 h-full overflow-y-auto">
      
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Waves className="w-5 h-5 text-green-400" />
          Wave Controls
        </h2>
        <p className="text-xs text-slate-400">
          Adjust the standing wave parameters to see how constructive and destructive interference forms geometry.
        </p>
      </div>

      {/* Mode Selection */}
      <div className="bg-slate-800 p-1 rounded-lg flex text-sm">
        <button 
          onClick={() => handleChange('mode', 'chladni')}
          className={`flex-1 py-2 px-3 rounded-md transition-colors ${params.mode === 'chladni' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
        >
          Square Plate
        </button>
        <button 
          onClick={() => handleChange('mode', 'interference')}
          className={`flex-1 py-2 px-3 rounded-md transition-colors ${params.mode === 'interference' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
        >
          Dual Source
        </button>
      </div>

      <div className="relative pt-2">
        <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Frequencies</span>
            <button 
                onClick={() => setIsAutoMode(!isAutoMode)}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all ${isAutoMode ? 'bg-green-500 text-white animate-pulse' : 'bg-slate-700 text-slate-400'}`}
            >
                {isAutoMode ? <PlayCircle className="w-3 h-3" /> : <PauseCircle className="w-3 h-3" />}
                AUTO {isAutoMode ? 'ON' : 'OFF'}
            </button>
        </div>

        <div className="space-y-6">
            {/* Frequency N */}
            <div className="space-y-2">
            <div className="flex justify-between text-sm">
                <span className="text-slate-300">Frequency N</span>
                <span className="font-mono text-green-400">{params.frequencyN.toFixed(2)}</span>
            </div>
            <input 
                type="range" 
                min="1" 
                max="20" 
                step="0.01"
                value={params.frequencyN} 
                onChange={(e) => handleChange('frequencyN', parseFloat(e.target.value))}
                className={`w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer ${isAutoMode ? 'opacity-50' : 'accent-green-400'}`}
            />
            </div>

            {/* Frequency M */}
            <div className="space-y-2">
            <div className="flex justify-between text-sm">
                <span className="text-slate-300">Frequency M</span>
                <span className="font-mono text-green-400">{params.frequencyM.toFixed(2)}</span>
            </div>
            <input 
                type="range" 
                min="1" 
                max="20" 
                step="0.01"
                value={params.frequencyM} 
                onChange={(e) => handleChange('frequencyM', parseFloat(e.target.value))}
                className={`w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer ${isAutoMode ? 'opacity-50' : 'accent-green-400'}`}
            />
            </div>
        </div>
      </div>

      <hr className="border-slate-800" />

      {/* Amplitude */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-slate-300">Vibration Strength</span>
          <span className="font-mono text-indigo-400">{Math.round(params.amplitude)}%</span>
        </div>
        <input 
          type="range" 
          min="0" 
          max="100" 
          step="1"
          value={params.amplitude} 
          onChange={(e) => handleChange('amplitude', parseFloat(e.target.value))}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
        />
        <div className="flex justify-between text-[10px] text-slate-500 px-1">
            <span>Low</span>
            <span>Med</span>
            <span>High</span>
        </div>
      </div>

      {/* Particle Count */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-slate-300">Sand Amount</span>
          <span className="font-mono text-slate-400">{params.particleCount}</span>
        </div>
        <input 
          type="range" 
          min="1000" 
          max="30000" 
          step="1000"
          value={params.particleCount} 
          onChange={(e) => handleChange('particleCount', parseInt(e.target.value))}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-slate-500"
        />
      </div>

      <hr className="border-slate-700" />

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={() => setShowField(!showField)}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-semibold transition-all ${showField ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/50' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
        >
          {showField ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          {showField ? 'Hide Force' : 'See Force'}
        </button>

        <button 
          onClick={() => setIsAudioOn(!isAudioOn)}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-semibold transition-all ${isAudioOn ? 'bg-pink-600/20 text-pink-400 border border-pink-500/50' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
        >
          {isAudioOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          {isAudioOn ? 'Sound On' : 'Mute'}
        </button>
      </div>

      <div className="mt-auto pt-4 text-xs text-slate-500 leading-relaxed">
        The sand accumulates at <strong className="text-emerald-400">Nodes</strong> (stable regions). 
        Auto mode explores different <strong className="text-white">harmonics</strong> automatically.
      </div>
    </div>
  );
};

export default Controls;