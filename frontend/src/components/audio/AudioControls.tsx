import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX, Radio, Sliders } from 'lucide-react';
import { soundEngine } from '../../audio/SoundEngine';

export const AudioControls: React.FC = () => {
  const [isMuted, setIsMuted] = useState(soundEngine.getMuted());
  const [volume, setVolume] = useState(soundEngine.getVolume());
  const [showSlider, setShowSlider] = useState(false);

  useEffect(() => {
    const unsubscribe = soundEngine.subscribe(() => {
      setIsMuted(soundEngine.getMuted());
      setVolume(soundEngine.getVolume());
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const handleToggle = () => {
    soundEngine.toggleMute();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    soundEngine.setVolume(val);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-noir-900/90 backdrop-blur-md border border-ivory-200/10 rounded-full p-2 shadow-noir-lg transition-all duration-300">
      {/* Volume Slider Drawer */}
      {showSlider && (
        <div className="flex items-center px-3 py-1 animate-fade-in">
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={handleVolumeChange}
            disabled={isMuted}
            className="w-20 h-1 accent-crimson cursor-pointer bg-noir-700 rounded-lg appearance-none"
            aria-label="Sound volume"
          />
          <span className="ml-2 font-intel text-xs text-ivory-300 w-7">
            {Math.round(volume * 100)}%
          </span>
        </div>
      )}

      {/* Slider toggle */}
      <button
        onClick={() => setShowSlider(!showSlider)}
        className="p-2 text-ivory-400 hover:text-ivory-100 hover:bg-noir-800 rounded-full transition-colors"
        title="Volume options"
        aria-label="Toggle volume options"
      >
        <Sliders className="w-3.5 h-3.5" />
      </button>

      {/* Main Sound Toggle */}
      <button
        onClick={handleToggle}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-intel transition-all duration-200 border ${
          isMuted
            ? 'bg-noir-800 text-ivory-400 border-ivory-200/5 hover:text-ivory-200 hover:border-ivory-200/20'
            : 'bg-crimson/15 text-crimson-glow border-crimson/30 hover:bg-crimson/25 shadow-crimson-glow'
        }`}
        title={isMuted ? 'Enable cinematic sound (room tone & SFX)' : 'Mute audio'}
      >
        {isMuted ? (
          <>
            <VolumeX className="w-4 h-4 text-ivory-400" />
            <span className="hidden sm:inline tracking-wider">SOUND OFF</span>
          </>
        ) : (
          <>
            <Radio className="w-4 h-4 text-crimson-glow animate-pulse" />
            <span className="hidden sm:inline tracking-wider">AUDIO LIVE</span>
            <Volume2 className="w-4 h-4 text-crimson-glow" />
          </>
        )}
      </button>
    </div>
  );
};
