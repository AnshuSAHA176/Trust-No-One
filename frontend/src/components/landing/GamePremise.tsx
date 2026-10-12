import React from 'react';
import { Brain, FileSearch, MessageSquareWarning, Network } from 'lucide-react';

export const GamePremise: React.FC = () => {
  return (
    <section className="relative py-28 px-6 sm:px-12 bg-noir-900 border-t border-ivory-200/5 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-crimson/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-amber-clue/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="stamp-top-secret mb-4 text-xs">CASE BACKGROUND BRIEFING</div>
          <h2 className="font-cinematic text-3xl sm:text-5xl font-bold text-ivory-100 tracking-wide mb-6">
            THE ANATOMY OF DECEPTION
          </h2>
          <blockquote className="font-editorial italic text-lg sm:text-2xl text-ivory-200 max-w-3xl mx-auto border-y border-ivory-200/10 py-6 my-6 font-light">
            “Four players enter the investigation. Three seek the truth. One controls the lies. Every conversation changes what you believe.”
          </blockquote>
          <p className="text-sm sm:text-base text-ivory-300 max-w-2xl mx-auto font-light leading-relaxed">
            Trust No One drops you into a psychological pressure cooker powered by autonomous AI intelligence. The AI suspects possess distinct alibis, secret private intel, emotional motivations, and conflicting recollections of the crime.
          </p>
        </div>

        {/* 4 Core Structural Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card-noir p-8 rounded-lg relative overflow-hidden group hover:border-ivory-200/20 transition-all duration-300">
            <div className="w-10 h-10 rounded-lg bg-noir-800 flex items-center justify-center mb-6 text-crimson-glow border border-crimson/20">
              <Brain className="w-5 h-5" />
            </div>
            <h3 className="font-cinematic text-xl text-ivory-100 font-bold mb-3 tracking-wide">
              AUTONOMOUS PSYCHOLOGICAL AI
            </h3>
            <p className="text-sm text-ivory-300 font-light leading-relaxed">
              Every bot analyzes the live conversation graph. They notice hesitation, interrogate contradictory claims, and strategically shield or deflect suspicion according to their secret role.
            </p>
          </div>

          <div className="card-noir p-8 rounded-lg relative overflow-hidden group hover:border-ivory-200/20 transition-all duration-300">
            <div className="w-10 h-10 rounded-lg bg-noir-800 flex items-center justify-center mb-6 text-amber-glow border border-amber-clue/20">
              <FileSearch className="w-5 h-5" />
            </div>
            <h3 className="font-cinematic text-xl text-ivory-100 font-bold mb-3 tracking-wide">
              FRAGMENTED TRUTH
            </h3>
            <p className="text-sm text-ivory-300 font-light leading-relaxed">
              No single player possesses the complete picture. The truth only emerges when participants cross-reference timestamps, WhatsApp threads, watchman statements, and private alibis.
            </p>
          </div>

          <div className="card-noir p-8 rounded-lg relative overflow-hidden group hover:border-ivory-200/20 transition-all duration-300">
            <div className="w-10 h-10 rounded-lg bg-noir-800 flex items-center justify-center mb-6 text-ivory-200 border border-ivory-200/20">
              <MessageSquareWarning className="w-5 h-5" />
            </div>
            <h3 className="font-cinematic text-xl text-ivory-100 font-bold mb-3 tracking-wide">
              REAL-TIME INTERROGATION
            </h3>
            <p className="text-sm text-ivory-300 font-light leading-relaxed">
              Question any suspect directly via encrypted WebSocket channels. Watch their responses unfold under pressure as turn orchestration passes around the table.
            </p>
          </div>

          <div className="card-noir p-8 rounded-lg relative overflow-hidden group hover:border-ivory-200/20 transition-all duration-300">
            <div className="w-10 h-10 rounded-lg bg-noir-800 flex items-center justify-center mb-6 text-crimson-glow border border-crimson/20">
              <Network className="w-5 h-5" />
            </div>
            <h3 className="font-cinematic text-xl text-ivory-100 font-bold mb-3 tracking-wide">
              AUTHORITATIVE GAME STATE
            </h3>
            <p className="text-sm text-ivory-300 font-light leading-relaxed">
              The Django backend governs the hidden truth. Roles, alibis, vote tallying, and win conditions are securely evaluated on the server with zero client-side tampering.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
