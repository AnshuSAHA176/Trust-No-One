import React from 'react';
import { ArrowRight, Flame } from 'lucide-react';
import { soundEngine } from '../../audio/SoundEngine';

interface FinalCTAProps {
  onStartInvestigation: () => void;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({ onStartInvestigation }) => {
  const handleClick = () => {
    soundEngine.play('game_enter');
    onStartInvestigation();
  };

  return (
    <section className="relative py-36 px-6 sm:px-12 bg-noir-950 border-t border-ivory-200/5 text-center overflow-hidden">
      {/* Background noir spotlight effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-crimson/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="stamp-classified mb-6 text-xs inline-block">
          INVESTIGATION COMMENCING
        </div>

        <h2 className="font-cinematic text-4xl sm:text-6xl md:text-7xl font-extrabold text-ivory-100 tracking-tight leading-[1.08] mb-8">
          THE TRUTH IS IN THE ROOM.<br />
          <span className="text-crimson-glow">ARE YOU?</span>
        </h2>

        <p className="text-base sm:text-lg text-ivory-300 max-w-xl mx-auto font-light mb-12 leading-relaxed">
          Take your seat at the interrogation table. Question the suspects. Identify the contradictions. Expose the Gaddar before the final vote.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={handleClick}
            className="w-full sm:w-auto px-10 py-5 bg-crimson hover:bg-crimson-accent text-ivory-50 font-cinematic font-bold tracking-widest text-base rounded transition-all duration-200 shadow-crimson-glow flex items-center justify-center gap-3 group"
          >
            <span>START INVESTIGATION</span>
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        <div className="mt-16 pt-8 border-t border-ivory-200/5 flex flex-col sm:flex-row items-center justify-between text-xs font-intel text-ivory-500 gap-4">
          <div>TRUST NO ONE // REAL-TIME SOCIAL DEDUCTION ENGINE</div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>AI CORE SYNCHRONIZED</span>
          </div>
        </div>
      </div>
    </section>
  );
};
