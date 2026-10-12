import React, { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Hero3DCanvas } from './Hero3DCanvas';
import { HeroScrollOverlay } from './HeroScrollOverlay';

gsap.registerPlugin(ScrollTrigger);

interface CinematicHeroProps {
  onEnterInvestigation: () => void;
  onDiscoverHowToPlay: () => void;
}

export const CinematicHero: React.FC<CinematicHeroProps> = ({
  onEnterInvestigation,
  onDiscoverHowToPlay,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pinTargetRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState<number>(0);

  useEffect(() => {
    if (!containerRef.current || !pinTargetRef.current) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setScrollProgress(0.9);
      return;
    }

    const st = ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top top',
      end: '+=350%',
      pin: pinTargetRef.current,
      scrub: 0.6,
      onUpdate: (self) => {
        setScrollProgress(self.progress);
      },
    });

    return () => {
      st.kill();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      id="hero-scroll-container"
      className="relative w-full h-[450vh] bg-noir-950"
    >
      <div
        ref={pinTargetRef}
        className="w-full h-screen sticky top-0 left-0 overflow-hidden bg-noir-950"
      >
        {/* 3D WebGL Interrogation Scene */}
        <Hero3DCanvas scrollProgress={scrollProgress} />

        {/* Cinematic Vignette Overlay */}
        <div className="cinematic-vignette" />

        {/* Dynamic 4-Scene Narrative Overlay */}
        <HeroScrollOverlay
          scrollProgress={scrollProgress}
          onEnterInvestigation={onEnterInvestigation}
          onDiscoverHowToPlay={onDiscoverHowToPlay}
        />
      </div>
    </div>
  );
};
