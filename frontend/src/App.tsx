import React, { useState, useEffect } from 'react';
import { CinematicHero } from './components/hero/CinematicHero';
import { GamePremise } from './components/landing/GamePremise';
import { HowToPlay } from './components/landing/HowToPlay';
import { SuspectsGallery } from './components/landing/SuspectsGallery';
import { FinalCTA } from './components/landing/FinalCTA';
import { AudioControls } from './components/audio/AudioControls';
import { GameLobby } from './components/game/GameLobby';
import { InvestigationArena } from './components/game/InvestigationArena';
import { AuthModal } from './components/auth/AuthModal';
import { ActiveGameState } from './services/types';
import { authService } from './services/auth';
import { Shield, Sparkles, LogIn, LogOut, User } from 'lucide-react';
import { soundEngine } from './audio/SoundEngine';

export const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(authService.isAuthenticated());
  const [userEmail, setUserEmail] = useState<string | null>(authService.getStoredEmail());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [activeSession, setActiveSession] = useState<ActiveGameState | null>(null);
  const [isLobbyOpen, setIsLobbyOpen] = useState<boolean>(false);

  // Subscribe to auth service state changes
  useEffect(() => {
    const unsub = authService.subscribe(() => {
      setIsAuthenticated(authService.isAuthenticated());
      setUserEmail(authService.getStoredEmail());
    });

    // Check token validity against backend on load
    authService.verifySession().then((valid) => {
      setIsAuthenticated(valid);
      setUserEmail(authService.getStoredEmail());
    });

    return () => {
      unsub();
    };
  }, []);

  const scrollToHowToPlay = () => {
    soundEngine.play('select');
    const elem = document.getElementById('how-to-play');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleProtectedAction = () => {
    if (isAuthenticated) {
      soundEngine.play('game_enter');
      setIsLobbyOpen(true);
    } else {
      soundEngine.play('select');
      setAuthMode('login');
      setIsAuthModalOpen(true);
    }
  };

  const handleLogout = () => {
    soundEngine.play('select');
    authService.logout();
    setActiveSession(null);
    setIsLobbyOpen(false);
  };

  return (
    <div className="relative min-h-screen bg-noir-950 text-ivory-100 overflow-x-hidden selection:bg-crimson selection:text-ivory-50">
      {/* Film Grain Noise Overlay */}
      <div className="film-grain" />

      {/* Global Cinematic Audio Controller */}
      <AudioControls />

      {/* Conditional: Active Game Arena vs Cinematic Landing Page */}
      {activeSession ? (
        <InvestigationArena
          session={activeSession}
          onExit={() => setActiveSession(null)}
          onRestart={() => {
            setActiveSession(null);
            setIsLobbyOpen(true);
          }}
        />
      ) : (
        <>
          {/* Top Tactical Navigation */}
          <nav className="fixed top-0 left-0 w-full z-40 px-6 sm:px-12 py-5 flex items-center justify-between pointer-events-none">
            <div className="pointer-events-auto flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-crimson shadow-crimson-glow" />
              <span className="font-cinematic font-bold tracking-widest text-sm text-ivory-100">
                TRUST NO ONE
              </span>
            </div>

            <div className="pointer-events-auto flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded bg-noir-900/80 border border-ivory-200/10 text-xs font-intel text-ivory-300">
                    <User className="w-3.5 h-3.5 text-crimson-glow" />
                    <span className="truncate max-w-[140px]">{userEmail || 'Agent'}</span>
                  </div>

                  <button
                    onClick={handleProtectedAction}
                    className="px-4 py-2 bg-crimson/80 hover:bg-crimson text-ivory-50 font-cinematic font-bold text-xs tracking-wider rounded border border-crimson/30 transition-all duration-200 shadow-crimson-glow flex items-center gap-1.5"
                  >
                    <span>LOBBY</span>
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={handleLogout}
                    className="p-2 bg-noir-900/80 hover:bg-noir-800 text-ivory-400 hover:text-ivory-200 rounded border border-ivory-200/10 transition-colors"
                    title="Sign Out"
                    aria-label="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setAuthMode('login');
                      setIsAuthModalOpen(true);
                    }}
                    className="px-4 py-2 bg-noir-900/80 hover:bg-noir-800 text-ivory-200 border border-ivory-200/15 font-intel text-xs font-bold tracking-wider rounded transition-colors flex items-center gap-1.5"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>SIGN IN</span>
                  </button>

                  <button
                    onClick={() => {
                      setAuthMode('register');
                      setIsAuthModalOpen(true);
                    }}
                    className="px-4 py-2 bg-crimson hover:bg-crimson-accent text-ivory-50 font-cinematic font-bold text-xs tracking-wider rounded border border-crimson/30 transition-all shadow-crimson-glow"
                  >
                    REGISTER
                  </button>
                </>
              )}
            </div>
          </nav>

          {/* 3D Scroll Hero Sequence */}
          <CinematicHero
            onEnterInvestigation={handleProtectedAction}
            onDiscoverHowToPlay={scrollToHowToPlay}
          />

          {/* Narrative Premise */}
          <GamePremise />

          {/* How to Play 3 Stages */}
          <HowToPlay />

          {/* Persons of Interest / Suspects Gallery */}
          <SuspectsGallery />

          {/* Final Call to Action */}
          <FinalCTA onStartInvestigation={handleProtectedAction} />

          {/* Minimalist Footer */}
          <footer className="py-12 px-6 sm:px-12 bg-noir-950 border-t border-ivory-200/5 text-center text-xs font-intel text-ivory-500">
            <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                TRUST NO ONE © {new Date().getFullYear()} — AN AI-DRIVEN SOCIAL DEDUCTION THRILLER
              </div>
              <div className="flex items-center gap-4 text-ivory-400">
                <span>DJANGO REST FRAMEWORK BACKEND</span>
                <span>•</span>
                <span>CLASSIFIED</span>
              </div>
            </div>
          </footer>
        </>
      )}

      {/* Real Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
        onSuccess={() => {
          setIsAuthenticated(true);
          setIsLobbyOpen(true);
        }}
      />

      {/* Game Lobby Modal (Protected) */}
      {isLobbyOpen && isAuthenticated && (
        <GameLobby
          onGameReady={(session) => {
            setIsLobbyOpen(false);
            setActiveSession(session);
          }}
          onCancel={() => setIsLobbyOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
