import React from 'react';
import { GamePlayer } from '../../services/types';
import { MessageSquare, Shield, Skull, Radio } from 'lucide-react';
import { soundEngine } from '../../audio/SoundEngine';

interface SuspectsCircleProps {
  players: GamePlayer[];
  humanPlayerId: string;
  selectedTargetId: string;
  onSelectTarget: (id: string) => void;
  activeTurnPlayerId?: string | null;
}

export const SuspectsCircle: React.FC<SuspectsCircleProps> = ({
  players,
  humanPlayerId,
  selectedTargetId,
  onSelectTarget,
  activeTurnPlayerId,
}) => {
  const handleSelect = (playerId: string) => {
    if (playerId === humanPlayerId) return; // Cannot target self
    soundEngine.play('select');
    onSelectTarget(playerId);
  };

  return (
    <div className="w-full bg-noir-900 border border-ivory-200/10 rounded-xl p-5 mb-4 shadow-noir-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-xs font-intel text-ivory-300">
          <Shield className="w-3.5 h-3.5 text-crimson-glow" />
          <span className="uppercase tracking-wider">CHAMBER SEATING & TARGET SELECTOR</span>
        </div>
        <div className="text-[10px] font-intel text-ivory-500">
          CLICK A SUSPECT TO QUESTION OR ACCUSE
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {players.map((p) => {
          const isHuman = p.id === humanPlayerId;
          const isSelected = selectedTargetId === p.id;
          const isTurn = activeTurnPlayerId === p.id;
          const isAlive = p.is_alive !== false;

          return (
            <button
              key={p.id}
              onClick={() => handleSelect(p.id)}
              disabled={isHuman || !isAlive}
              className={`p-3.5 rounded-lg border text-left transition-all duration-200 relative overflow-hidden flex flex-col justify-between min-h-[105px] ${
                !isAlive
                  ? 'opacity-40 bg-noir-950 border-noir-800 cursor-not-allowed'
                  : isSelected
                  ? 'bg-crimson/15 border-crimson shadow-crimson-glow ring-1 ring-crimson'
                  : isTurn
                  ? 'bg-amber-950/20 border-amber-clue/50'
                  : 'bg-noir-850 border-ivory-200/10 hover:border-ivory-200/25'
              } ${isHuman ? 'cursor-default' : 'cursor-pointer'}`}
            >
              {/* Header status */}
              <div className="flex items-center justify-between w-full mb-2">
                <span className="text-[9px] font-intel uppercase tracking-widest text-ivory-400">
                  {isHuman ? 'YOU' : 'SUSPECT'}
                </span>

                {!isAlive ? (
                  <span className="text-[9px] font-intel text-crimson-glow flex items-center gap-1">
                    <Skull className="w-3 h-3" />
                    <span>ELIMINATED</span>
                  </span>
                ) : isTurn ? (
                  <span className="text-[9px] font-intel text-amber-glow flex items-center gap-1 animate-pulse">
                    <Radio className="w-3 h-3" />
                    <span>SPEAKING</span>
                  </span>
                ) : isSelected ? (
                  <span className="text-[9px] font-intel text-crimson-glow font-bold">
                    TARGET
                  </span>
                ) : null}
              </div>

              {/* Name & archetype */}
              <div>
                <div className="font-cinematic font-bold text-sm text-ivory-100 truncate mb-0.5">
                  {p.name}
                </div>
                <div className="font-intel text-[10px] text-ivory-400 truncate">
                  {isHuman ? 'Lead Investigator' : 'AI Suspect'}
                </div>
              </div>

              {/* Action cues */}
              <div className="mt-2 pt-2 border-t border-ivory-200/5 flex items-center justify-between text-[9px] font-intel text-ivory-400">
                {isHuman ? (
                  <span className="text-ivory-500">CANNOT TARGET SELF</span>
                ) : !isAlive ? (
                  <span className="text-crimson-dark">DECEASED</span>
                ) : (
                  <span className="flex items-center gap-1 text-ivory-300">
                    <MessageSquare className="w-2.5 h-2.5 text-crimson-glow" />
                    <span>{isSelected ? 'TARGETED' : 'SELECT TARGET'}</span>
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
