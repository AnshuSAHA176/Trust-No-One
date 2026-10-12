import React, { useEffect, useRef } from 'react';
import { ArrowDown, ShieldAlert, Sparkles, UserCheck } from 'lucide-react';
import { soundEngine } from '../../audio/SoundEngine';

interface HeroScrollOverlayProps {
  scrollProgress: number;
  onEnterInvestigation: () => void;
  onDiscoverHowToPlay: () => void;
}

export const HeroScrollOverlay: React.FC<HeroScrollOverlayProps> = ({
  scrollProgress,
  onEnterInvestigation,
  onDiscoverHowToPlay,
}) => {
  const lastMilestone = useRef<number>(-1);

  // Synchronize restrained sound cues to narrative milestones
  useEffect(() => {
    soundEngine.setScrollTension(scrollProgress);

    if (scrollProgress >= 0.1 && scrollProgress < 0.3 && lastMilestone.current !== 1) {
      lastMilestone.current = 1;
      soundEngine.play('door_enter');
    } else if (scrollProgress >= 0.35 && scrollProgress < 0.6 && lastMilestone.current !== 2) {
      lastMilestone.current = 2;
      soundEngine.play('evidence_slide');
    } else if (scrollProgress >= 0.62 && scrollProgress < 0.72 && lastMilestone.current !== 3) {
      lastMilestone.current = 3;
      soundEngine.play('suspicion_pulse');
    } else if (scrollProgress >= 0.73 && scrollProgress < 0.86 && lastMilestone.current !== 4) {
      lastMilestone.current = 4;
      soundEngine.play('reveal_impact');
    } else if (scrollProgress >= 0.92 && lastMilestone.current !== 5) {
      lastMilestone.current = 5;
      soundEngine.play('game_enter');
    }
  }, [scrollProgress]);

  // Opacity calculations for smooth scene cross-fading
  // Scene 1: 0.00 to 0.25 (fade out 0.20 to 0.28)
  const scene1Opacity = Math.max(0, Math.min(1, 1 - (scrollProgress - 0.18) * 8));

  // Scene 2: 0.28 to 0.60 (fade in 0.25 to 0.32, fade out 0.55 to 0.62)
  let scene2Opacity = 0;
  if (scrollProgress >= 0.25 && scrollProgress <= 0.64) {
    if (scrollProgress < 0.35) {
      scene2Opacity = (scrollProgress - 0.25) / 0.1;
    } else if (scrollProgress > 0.54) {
      scene2Opacity = 1 - (scrollProgress - 0.54) / 0.1;
    } else {
      scene2Opacity = 1;
    }
  }

  // Scene 3: 0.62 to 0.86 (fade in 0.62 to 0.70, fade out 0.82 to 0.88)
  let scene3Opacity = 0;
  if (scrollProgress >= 0.62 && scrollProgress <= 0.88) {
    if (scrollProgress < 0.70) {
      scene3Opacity = (scrollProgress - 0.62) / 0.08;
    } else if (scrollProgress > 0.80) {
      scene3Opacity = 1 - (scrollProgress - 0.80) / 0.08;
    } else {
      scene3Opacity = 1;
    }
  }

  // Scene 4: 0.86 to 1.00 (fade in 0.86 to 0.94)
  const scene4Opacity = Math.max(0, Math.min(1, (scrollProgress - 0.85) * 8));

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-6 sm:p-12">
      {/* Top Dossier Header Bar */}
      <div className="w-full flex items-center justify-between text-xs font-intel tracking-widest text-ivory-400">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-crimson animate-pulse" />
          <span className="uppercase tracking-widest">OPERATION: TRUST NO ONE</span>
          <span className="hidden sm:inline text-ivory-500 font-mono">| CASE #748-DELHI</span>
        </div>
        <div className="stamp-classified text-[10px] hidden sm:block">
          SECRET // LEVEL 4
        </div>
      </div>

      {/* Main Narrative Center Stage */}
      <div className="relative w-full max-w-5xl mx-auto flex-1 flex items-center justify-center">
        {/* ================= SCENE 1: THE INTERROGATION ROOM ================= */}
        {scene1Opacity > 0.01 && (
          <div
            style={{ opacity: scene1Opacity }}
            className="text-center max-w-3xl transition-opacity duration-200"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full border border-ivory-300/10 bg-noir-900/60 text-xs font-intel text-ivory-300">
              <ShieldAlert className="w-3.5 h-3.5 text-crimson-glow" />
              <span>CLASSIFIED INTERROGATION CHAMBER</span>
            </div>
            
            <h1 className="font-cinematic text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-ivory-100 leading-[1.08] mb-6">
              FOUR PLAYERS.<br />
              <span className="text-crimson-glow">ONE LIAR.</span><br />
              TRUST NO ONE.
            </h1>

            <p className="text-base sm:text-lg text-ivory-300 font-sans max-w-xl mx-auto mb-8 font-light tracking-wide">
              An incident occurred. Three partners seek the truth. One secretly controls the lies. Every statement is a weapon.
            </p>

            <div className="flex items-center justify-center gap-2 text-xs font-intel text-ivory-400 uppercase tracking-widest">
              <span className="animate-bounce">
                <ArrowDown className="w-4 h-4 text-crimson-glow" />
              </span>
              <span>SCROLL TO ENTER THE INVESTIGATION</span>
            </div>
          </div>
        )}

        {/* ================= SCENE 2: SCROLL INTO THE MYSTERY ================= */}
        {scene2Opacity > 0.01 && (
          <div
            style={{ opacity: scene2Opacity }}
            className="w-full max-w-3xl text-center transition-opacity duration-200"
          >
            <div className="stamp-top-secret mb-4 text-xs">
              EVIDENCE SLATE // 4 SUSPECTS
            </div>
            <h2 className="font-cinematic text-3xl sm:text-5xl font-bold text-ivory-100 mb-6 tracking-wide">
              FOUR SILHOUETTES.<br />
              <span className="text-amber-clue">CONFLICTING ALIBIS.</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6 text-left">
              {[
                { label: 'INVESTIGATOR', detail: 'Validating timelines', status: 'UNVERIFIED' },
                { label: 'SUSPECT ALPHA', detail: 'Claims office meeting', status: 'CONTRADICTED' },
                { label: 'SUSPECT BETA', detail: 'CCTV footage gap', status: 'SUSPICIOUS' },
                { label: 'SUSPECT GAMMA', detail: 'WhatsApp message leaked', status: 'DEFLECTING' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-noir-900/80 border border-ivory-200/10 rounded-md backdrop-blur-sm"
                >
                  <div className="font-intel text-[10px] text-ivory-400 mb-1">{item.label}</div>
                  <div className="font-sans text-xs text-ivory-200 mb-2">{item.detail}</div>
                  <span className="text-[9px] font-intel text-crimson-glow bg-crimson/10 px-1.5 py-0.5 rounded border border-crimson/20">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>

            <div className="red-thread w-48 mx-auto my-4" />
            <p className="font-intel text-xs text-ivory-300">
              Red thread indicates connected clues. Keep scrolling to uncover the traitor.
            </p>
          </div>
        )}

        {/* ================= SCENE 3: THE REVEAL ================= */}
        {scene3Opacity > 0.01 && (
          <div
            style={{ opacity: scene3Opacity }}
            className="text-center max-w-3xl transition-opacity duration-200"
          >
            <div className="inline-block p-1 border-b border-crimson/50 mb-4">
              <span className="font-intel text-xs tracking-widest text-crimson-glow uppercase">
                CRITICAL DISCREPANCY DETECTED
              </span>
            </div>

            <h2 className="font-cinematic text-4xl sm:text-7xl font-extrabold text-ivory-100 tracking-wider mb-6">
              SOMEONE IS <span className="text-crimson-glow">LYING</span>.
            </h2>

            <p className="text-sm sm:text-base text-ivory-300 max-w-lg mx-auto font-light leading-relaxed mb-6">
              The Gaddar has fabricated their alibi. They listen to every accusation, subtly redirecting suspicion onto innocent partners.
            </p>

            <div className="inline-flex items-center gap-3 px-4 py-2 bg-noir-900/90 border border-crimson/30 rounded-full font-intel text-xs text-ivory-200">
              <UserCheck className="w-4 h-4 text-crimson-glow" />
              <span>THE TRUTH IS HIDDEN IN WHAT THEY CANNOT EXPLAIN.</span>
            </div>
          </div>
        )}

        {/* ================= SCENE 4: ENTER THE GAME ================= */}
        {scene4Opacity > 0.01 && (
          <div
            style={{ opacity: scene4Opacity }}
            className="text-center max-w-2xl transition-opacity duration-200 pointer-events-auto"
          >
            <div className="stamp-classified mb-4 text-xs">
              AUTHORIZATION GRANTED
            </div>

            <h2 className="font-cinematic text-3xl sm:text-5xl font-bold text-ivory-100 mb-4">
              THE TABLE IS SET.
            </h2>

            <p className="text-sm sm:text-base text-ivory-300 mb-8 font-light">
              Your role is waiting. Three AI suspects are in their seats. Initiate the interrogation or inspect the dossier.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onEnterInvestigation}
                className="w-full sm:w-auto px-8 py-4 bg-crimson hover:bg-crimson-accent text-ivory-50 font-cinematic font-bold tracking-widest text-sm rounded transition-all duration-200 shadow-crimson-glow flex items-center justify-center gap-3 group"
              >
                <span>ENTER THE INVESTIGATION</span>
                <Sparkles className="w-4 h-4 transition-transform group-hover:scale-110" />
              </button>

              <button
                onClick={onDiscoverHowToPlay}
                className="w-full sm:w-auto px-8 py-4 bg-noir-900/90 hover:bg-noir-800 text-ivory-200 border border-ivory-200/20 font-intel text-xs tracking-widest rounded transition-all duration-200 flex items-center justify-center"
              >
                DISCOVER HOW TO PLAY
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Timeline Indicator */}
      <div className="w-full flex items-center justify-between text-[11px] font-intel text-ivory-400 border-t border-ivory-200/5 pt-4">
        <div className="flex items-center gap-3">
          <span>PROGRESS</span>
          <div className="w-24 sm:w-36 h-1 bg-noir-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-crimson transition-all duration-75"
              style={{ width: `${Math.round(scrollProgress * 100)}%` }}
            />
          </div>
          <span>{Math.round(scrollProgress * 100)}%</span>
        </div>

        <div className="flex items-center gap-4 text-ivory-400">
          <span className={scrollProgress < 0.28 ? 'text-ivory-100 font-bold' : ''}>I. CHAMBER</span>
          <span>•</span>
          <span className={scrollProgress >= 0.28 && scrollProgress < 0.62 ? 'text-ivory-100 font-bold' : ''}>II. EVIDENCE</span>
          <span>•</span>
          <span className={scrollProgress >= 0.62 && scrollProgress < 0.86 ? 'text-ivory-100 font-bold' : ''}>III. REVEAL</span>
          <span>•</span>
          <span className={scrollProgress >= 0.86 ? 'text-crimson-glow font-bold' : ''}>IV. ARENA</span>
        </div>
      </div>
    </div>
  );
};
