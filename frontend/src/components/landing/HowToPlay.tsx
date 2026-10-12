import React, { useState } from 'react';
import { Search, Gavel, Scale, ChevronRight } from 'lucide-react';
import { soundEngine } from '../../audio/SoundEngine';

export const HowToPlay: React.FC = () => {
  const [activeStage, setActiveStage] = useState<number>(0);

  const stages = [
    {
      step: '01',
      title: 'INVESTIGATE',
      subtitle: 'Question suspects and uncover contradictions',
      icon: Search,
      tag: 'PHASE: INVESTIGATION',
      accentColor: 'text-ivory-100',
      badgeBorder: 'border-ivory-300/20',
      dossierSummary:
        'Engage in real-time conversation around the table. Ask suspects about their whereabouts during the incident, test their alibis, and compare their stories with the public evidence timeline.',
      tactics: [
        'Analyze response speed and deflection tactics',
        'Cross-examine statements against the incident timestamp',
        'Look for subtle discrepancies in bot explanations',
      ],
    },
    {
      step: '02',
      title: 'ACCUSE',
      subtitle: 'Study evidence and decide whom to trust',
      icon: Scale,
      tag: 'PHASE: DELIBERATION',
      accentColor: 'text-amber-glow',
      badgeBorder: 'border-amber-clue/30',
      dossierSummary:
        'Synthesize findings. One player is actively manufacturing confusion. Partners must find common ground before the voting deadline, while the Gaddar works in shadows to frame an innocent.',
      tactics: [
        'Inspect your confidential private dossier',
        'Weigh conflicting accusations from other players',
        'Identify who is attempting to force an early consensus',
      ],
    },
    {
      step: '03',
      title: 'VOTE',
      subtitle: 'Cast your verdict and face the consequences',
      icon: Gavel,
      tag: 'PHASE: VOTING & VERDICT',
      accentColor: 'text-crimson-glow',
      badgeBorder: 'border-crimson/30',
      dossierSummary:
        'Cast your secret ballot against your primary suspect. The backend validates and tallies all votes including the autonomous bots. If the Partners eliminate the Gaddar, the truth prevails.',
      tactics: [
        'Single ballot per player — votes cannot be changed',
        'Voting for oneself is strictly forbidden',
        'The backend computes the definitive elimination verdict',
      ],
    },
  ];

  const handleSelectStage = (idx: number) => {
    setActiveStage(idx);
    soundEngine.play('select');
  };

  const curr = stages[activeStage];
  const IconComponent = curr.icon;

  return (
    <section id="how-to-play" className="relative py-28 px-6 sm:px-12 bg-noir-950 border-t border-ivory-200/5">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <div className="stamp-classified mb-4 text-xs">PROCEDURAL PROTOCOL</div>
          <h2 className="font-cinematic text-3xl sm:text-5xl font-bold text-ivory-100 tracking-wide mb-4">
            THREE STAGES OF INVESTIGATION
          </h2>
          <p className="text-sm sm:text-base text-ivory-300 max-w-xl mx-auto font-light">
            Master the interrogation sequence to expose the traitor before they misdirect the table.
          </p>
        </div>

        {/* 3 Step Buttons Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {stages.map((stage, idx) => {
            const isSelected = activeStage === idx;
            const StepIcon = stage.icon;
            return (
              <button
                key={idx}
                onClick={() => handleSelectStage(idx)}
                className={`p-6 text-left rounded-lg transition-all duration-300 border relative overflow-hidden ${
                  isSelected
                    ? 'bg-noir-850 border-crimson/40 shadow-noir-lg'
                    : 'bg-noir-900/50 border-ivory-200/5 hover:border-ivory-200/20 hover:bg-noir-900'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-crimson via-crimson-glow to-amber-clue" />
                )}
                <div className="flex items-center justify-between mb-4">
                  <span className="font-intel text-xs text-ivory-400 font-bold tracking-widest">
                    STAGE {stage.step}
                  </span>
                  <StepIcon
                    className={`w-5 h-5 ${
                      isSelected ? 'text-crimson-glow' : 'text-ivory-500'
                    }`}
                  />
                </div>
                <h3 className="font-cinematic text-lg font-bold text-ivory-100 mb-1 tracking-wider">
                  {stage.title}
                </h3>
                <p className="font-sans text-xs text-ivory-400 line-clamp-2">
                  {stage.subtitle}
                </p>
              </button>
            );
          })}
        </div>

        {/* Detailed Stage Dossier Card */}
        <div className="card-noir rounded-xl p-8 sm:p-12 relative overflow-hidden border border-ivory-200/10">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded border mb-6 text-xs font-intel tracking-widest text-ivory-300 bg-noir-800">
                <IconComponent className="w-3.5 h-3.5 text-crimson-glow" />
                <span>{curr.tag}</span>
              </div>

              <h3 className="font-cinematic text-2xl sm:text-4xl font-bold text-ivory-100 mb-4 tracking-wide">
                {curr.title} — {curr.subtitle}
              </h3>

              <p className="text-sm sm:text-base text-ivory-300 font-light leading-relaxed mb-8">
                {curr.dossierSummary}
              </p>

              <div>
                <h4 className="font-intel text-xs text-ivory-400 uppercase tracking-widest mb-3">
                  INVESTIGATIVE OBJECTIVES
                </h4>
                <ul className="space-y-2.5">
                  {curr.tactics.map((tactic, tIdx) => (
                    <li key={tIdx} className="flex items-center gap-3 text-sm text-ivory-200 font-light">
                      <ChevronRight className="w-4 h-4 text-crimson-glow flex-shrink-0" />
                      <span>{tactic}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Forensic Inspection Box */}
            <div className="w-full lg:w-72 p-6 rounded-lg bg-noir-900 border border-ivory-200/10 font-intel text-xs text-ivory-300 flex flex-col justify-between">
              <div>
                <div className="text-[10px] text-ivory-400 uppercase tracking-wider mb-2">
                  TACTICAL DOSSIER
                </div>
                <div className="border-b border-ivory-200/10 pb-3 mb-3">
                  <div className="text-ivory-400 text-[10px]">TIME ALLOCATION</div>
                  <div className="text-ivory-100 font-bold">REAL-TIME / DYNAMIC</div>
                </div>
                <div className="border-b border-ivory-200/10 pb-3 mb-3">
                  <div className="text-ivory-400 text-[10px]">PARTICIPANTS</div>
                  <div className="text-ivory-100 font-bold">1 HUMAN + 3 AI BOTS</div>
                </div>
                <div>
                  <div className="text-ivory-400 text-[10px]">WIN REQUIREMENT</div>
                  <div className="text-crimson-glow font-bold">IDENTIFY THE GADDAR</div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-ivory-200/10 text-[11px] text-ivory-400 italic">
                “Trust is an expensive luxury in an investigation room.”
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
