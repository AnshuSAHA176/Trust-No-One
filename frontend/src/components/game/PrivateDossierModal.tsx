import React from 'react';
import { GamePlayer } from '../../services/types';
import { X, FolderOpen, Info } from 'lucide-react';
import { soundEngine } from '../../audio/SoundEngine';

interface PrivateDossierModalProps {
  player: GamePlayer;
  gameId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const PrivateDossierModal: React.FC<PrivateDossierModalProps> = ({
  player,
  gameId,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const handleClose = () => {
    soundEngine.play('select');
    onClose();
  };

  const isGaddar = player.role?.toLowerCase() === 'gaddar';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-noir-950/85 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-xl bg-noir-900 border border-ivory-200/15 rounded-xl p-6 sm:p-8 shadow-noir-lg relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-ivory-200/10 mb-6">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-amber-glow" />
            <span className="font-intel text-xs text-ivory-300 tracking-widest uppercase">
              CONFIDENTIAL DOSSIER // AUTHORITATIVE SERVER STATE
            </span>
          </div>
          <button
            onClick={handleClose}
            className="p-1 text-ivory-400 hover:text-ivory-100 rounded transition-colors"
            aria-label="Close dossier"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Assigned Secret Role from Server */}
        <div className="mb-6 p-4 rounded-lg bg-noir-850 border border-ivory-200/10 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-intel text-ivory-400 uppercase tracking-widest mb-1">
              SERVER-ASSIGNED ROLE
            </div>
            <div className="font-cinematic text-2xl font-bold tracking-wider text-ivory-100">
              {isGaddar ? (
                <span className="text-crimson-glow">GADDAR (IMPOSTER)</span>
              ) : (
                <span className="text-emerald-400">PARTNER (SAATHI)</span>
              )}
            </div>
          </div>
          <div className={`stamp-${isGaddar ? 'classified' : 'top-secret'} text-xs`}>
            {player.role?.toUpperCase() || 'SAATHI'}
          </div>
        </div>

        {/* Player Identifiers */}
        <div className="p-4 rounded-lg bg-noir-850 border border-ivory-200/10 mb-6 space-y-2 font-intel text-xs">
          <div className="flex justify-between border-b border-ivory-200/5 pb-2">
            <span className="text-ivory-400">INVESTIGATOR NAME:</span>
            <span className="text-ivory-100 font-bold">{player.name}</span>
          </div>
          <div className="flex justify-between border-b border-ivory-200/5 pb-2">
            <span className="text-ivory-400">PLAYER UUID:</span>
            <span className="text-ivory-300 font-mono text-[11px] truncate max-w-[280px]">
              {player.id}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-ivory-400">CHAMBER GAME ID:</span>
            <span className="text-ivory-300 font-mono text-[11px] truncate max-w-[280px]">
              {gameId}
            </span>
          </div>
        </div>

        {/* Backend Note */}
        <div className="p-4 rounded-lg bg-noir-950 border border-amber-clue/20 text-xs font-sans text-ivory-300 space-y-2">
          <div className="flex items-center gap-2 text-amber-glow font-intel font-bold text-[11px] uppercase">
            <Info className="w-4 h-4 flex-shrink-0" />
            <span>BACKEND SCENARIO & SECRET ALIBI STATUS</span>
          </div>
          <p className="font-light leading-relaxed text-[11px] text-ivory-400">
            The Django backend generates the mystery scenario and private alibis using Groq and persists them in PostgreSQL. Because the existing DRF <code className="font-mono text-ivory-300">POST /game/</code> view does not serialize the private text into its response payload, only your authoritative role (<code className="font-mono text-emerald-400">{player.role}</code>) and player IDs are exposed by the server.
          </p>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-ivory-200/10 flex justify-end">
          <button
            onClick={handleClose}
            className="px-6 py-2.5 bg-noir-800 hover:bg-noir-750 text-ivory-200 text-xs font-intel rounded transition-colors"
          >
            CLOSE FILE
          </button>
        </div>
      </div>
    </div>
  );
};
