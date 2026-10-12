import React, { useState } from 'react';
import { User, AlertTriangle, Fingerprint, Eye } from 'lucide-react';
import { soundEngine } from '../../audio/SoundEngine';

export const SuspectsGallery: React.FC = () => {
  const [selectedSuspect, setSelectedSuspect] = useState<number | null>(null);

  const suspects = [
    {
      id: 1,
      name: 'Vikram Malhotra',
      roleTitle: 'THE SENIOR EXECUTIVE',
      demeanor: 'Measured, corporate, highly analytical',
      alibiPreview: 'Claims he was on an overseas teleconference in the South Delhi conference suite.',
      contradiction: 'Corridor CCTV was unexpectedly switched to maintenance mode 12 minutes earlier.',
      motives: 'Major discrepancies in the project budget were scheduled for public audit next morning.',
      avatarInitial: 'VM',
      avatarTone: 'from-zinc-800 to-zinc-950',
    },
    {
      id: 2,
      name: 'Ananya Sharma',
      roleTitle: 'THE INVESTIGATIVE JOURNALIST',
      demeanor: 'Relentless, interrogative, quick to highlight gaps',
      alibiPreview: 'Insists she was waiting in the lobby reviewing witness interview transcripts.',
      contradiction: 'Biometric visitor logs register an unauthorized swipe near the private server room.',
      motives: 'Seeking the definitive exposé that would cement her investigative reputation.',
      avatarInitial: 'AS',
      avatarTone: 'from-stone-800 to-stone-950',
    },
    {
      id: 3,
      name: 'Kabir Sen',
      roleTitle: 'THE SECURITY ARCHITECT',
      demeanor: 'Nervous, technical, over-explains cryptographic protocols',
      alibiPreview: 'States he was at his desk diagnosing anomalous firewall alerts until late midnight.',
      contradiction: 'His personal security key was used to unlock the confidential file vault at 23:42.',
      motives: 'Reportedly threatened with immediate contract termination earlier that afternoon.',
      avatarInitial: 'KS',
      avatarTone: 'from-neutral-800 to-neutral-950',
    },
    {
      id: 4,
      name: 'Priya Verma',
      roleTitle: 'THE FAMILY CONFIDANTE',
      demeanor: 'Observant, soft-spoken, watches micro-expressions',
      alibiPreview: 'Was seen having tea on the veranda during the entire duration of the blackout.',
      contradiction: 'Sent three encrypted WhatsApp voice notes before deleting her chat backups.',
      motives: 'Deep financial entanglement with the missing assets under investigation.',
      avatarInitial: 'PV',
      avatarTone: 'from-slate-800 to-slate-950',
    },
  ];

  const handleCardClick = (idx: number) => {
    setSelectedSuspect(selectedSuspect === idx ? null : idx);
    soundEngine.play('select');
  };

  return (
    <section className="relative py-28 px-6 sm:px-12 bg-noir-900 border-t border-ivory-200/5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="stamp-top-secret mb-4 text-xs">SUSPECT PROFILES // CASE DOSSIER</div>
          <h2 className="font-cinematic text-3xl sm:text-5xl font-bold text-ivory-100 tracking-wide mb-4">
            PERSONS OF INTEREST
          </h2>
          <p className="text-sm sm:text-base text-ivory-300 max-w-2xl mx-auto font-light">
            Every suspect has a believable story, a plausible excuse, and something they are desperate to hide. Only one is the Gaddar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {suspects.map((s, idx) => {
            const isExpanded = selectedSuspect === idx;
            return (
              <div
                key={s.id}
                onClick={() => handleCardClick(idx)}
                className={`card-noir rounded-xl p-6 cursor-pointer transition-all duration-300 relative group border ${
                  isExpanded
                    ? 'border-crimson/50 shadow-crimson-glow bg-noir-850'
                    : 'border-ivory-200/10 hover:border-ivory-200/30'
                }`}
              >
                {/* Silhouette Portrait Box */}
                <div
                  className={`w-full h-48 rounded-lg bg-gradient-to-b ${s.avatarTone} border border-ivory-200/5 flex flex-col items-center justify-center relative overflow-hidden mb-6 group-hover:border-ivory-200/20 transition-all`}
                >
                  <div className="w-16 h-16 rounded-full bg-noir-900/80 border border-ivory-200/10 flex items-center justify-center text-ivory-300 font-cinematic font-bold text-xl shadow-inner">
                    {s.avatarInitial}
                  </div>
                  <div className="absolute bottom-3 left-3 text-[10px] font-intel text-ivory-400">
                    ID // 00{s.id}-DELHI
                  </div>
                  <div className="absolute top-3 right-3">
                    <Fingerprint className="w-4 h-4 text-ivory-500 opacity-40 group-hover:opacity-80 transition-opacity" />
                  </div>
                </div>

                {/* Information Header */}
                <div className="mb-4">
                  <div className="text-[10px] font-intel text-crimson-glow font-bold tracking-widest uppercase mb-1">
                    {s.roleTitle}
                  </div>
                  <h3 className="font-cinematic text-xl font-bold text-ivory-100 group-hover:text-ivory-50 transition-colors">
                    {s.name}
                  </h3>
                </div>

                <p className="font-sans text-xs text-ivory-400 font-light mb-4 line-clamp-2">
                  {s.demeanor}
                </p>

                {/* Inspect Toggle */}
                <div className="pt-4 border-t border-ivory-200/10 flex items-center justify-between text-xs font-intel text-ivory-400">
                  <span className="flex items-center gap-1.5 group-hover:text-ivory-200">
                    <Eye className="w-3.5 h-3.5 text-crimson-glow" />
                    <span>{isExpanded ? 'CLOSE FILE' : 'INSPECT FILE'}</span>
                  </span>
                  <span className="text-[10px] text-ivory-500">DOSSIER #{s.id}</span>
                </div>

                {/* Detailed Confidential Drawer */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-crimson/20 text-xs font-sans space-y-3 animate-fade-in">
                    <div>
                      <div className="font-intel text-[10px] text-amber-glow uppercase tracking-wider mb-0.5">
                        SUBMITTED ALIBI
                      </div>
                      <p className="text-ivory-300 font-light text-[11px] leading-relaxed">
                        {s.alibiPreview}
                      </p>
                    </div>

                    <div>
                      <div className="font-intel text-[10px] text-crimson-glow uppercase tracking-wider mb-0.5 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-crimson-glow" />
                        <span>DETECTED ANOMALY</span>
                      </div>
                      <p className="text-ivory-300 font-light text-[11px] leading-relaxed">
                        {s.contradiction}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
