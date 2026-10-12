import React, { useEffect } from 'react';
import { GameFinishResponse } from '../../services/types';
import { Trophy, Skull, RotateCcw, ShieldCheck } from 'lucide-react';
import { soundEngine } from '../../audio/SoundEngine';

interface ResultSequenceProps {
  result: GameFinishResponse;
  onPlayAgain: () => void;
}

export const ResultSequence: React.FC<ResultSequenceProps> = ({
  result,
  onPlayAgain,
}) => {
  const isPartnerWin = result.winner?.toLowerCase() === 'partner';
  const isGaddarWin = result.winner?.toLowerCase() === 'gaddar';
  const isDraw = result.winner?.toLowerCase() === 'draw';

  useEffect(() => {
    soundEngine.play('elimination');
    setTimeout(() => {
      if (isPartnerWin) {
        soundEngine.play('victory');
      } else if (isGaddarWin) {
        soundEngine.play('defeat');
      }
    }, 1200);
  }, [isPartnerWin, isGaddarWin]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-noir-950/95 backdrop-blur-lg overflow-y-auto">
      <div className="w-full max-w-2xl bg-noir-900 border border-crimson/40 rounded-2xl p-6 sm:p-12 shadow-noir-lg text-center relative overflow-hidden">
        {/* Atmospheric background glow */}
        <div
          className={`absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 rounded-full blur-[100px] pointer-events-none ${
            isPartnerWin
              ? 'bg-emerald-500/15'
              : isGaddarWin
              ? 'bg-crimson/25'
              : 'bg-amber-500/15'
          }`}
        />

        <div className="relative z-10">
          <div className="mb-6">
            <span
              className={`stamp-${
                isPartnerWin ? 'top-secret' : 'classified'
              } text-xs`}
            >
              INVESTIGATION CONCLUDED // SERVER OUTCOME
            </span>
          </div>

          <div className="mb-6">
            {isPartnerWin ? (
              <div className="inline-flex items-center gap-2 text-emerald-400 mb-2">
                <ShieldCheck className="w-10 h-10" />
              </div>
            ) : isGaddarWin ? (
              <div className="inline-flex items-center gap-2 text-crimson-glow mb-2">
                <Skull className="w-10 h-10" />
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 text-amber-glow mb-2">
                <Trophy className="w-10 h-10" />
              </div>
            )}

            <h1 className="font-cinematic text-3xl sm:text-5xl font-extrabold text-ivory-100 tracking-wide mb-3">
              {isPartnerWin ? (
                <span className="text-emerald-400">PARTNERS WIN!</span>
              ) : isGaddarWin ? (
                <span className="text-crimson-glow">GADDAR WINS!</span>
              ) : (
                <span className="text-amber-glow">IT'S A DRAW</span>
              )}
            </h1>

            <p className="font-sans text-sm sm:text-base text-ivory-300 font-light max-w-lg mx-auto leading-relaxed">
              {result.message}
            </p>
          </div>

          {/* Real Backend Payload Metadata */}
          <div className="p-4 rounded-lg bg-noir-850 border border-ivory-200/10 max-w-md mx-auto mb-8 font-intel text-xs text-ivory-400 flex items-center justify-around">
            <div>
              <div className="text-[10px] text-ivory-500">WINNER</div>
              <div className="font-bold text-ivory-200 uppercase">{result.winner}</div>
            </div>
            <div className="w-[1px] h-6 bg-ivory-200/10" />
            <div>
              <div className="text-[10px] text-ivory-500">LOSER</div>
              <div className="font-bold text-ivory-200 uppercase">{result.loser || 'None'}</div>
            </div>
            <div className="w-[1px] h-6 bg-ivory-200/10" />
            <div>
              <div className="text-[10px] text-ivory-500">STATUS</div>
              <div className="font-bold text-emerald-400 uppercase">{result.status}</div>
            </div>
          </div>

          <div className="font-mono text-[10px] text-ivory-500 mb-8 truncate max-w-sm mx-auto">
            GAME ID: {result.game_id}
          </div>

          {/* Action */}
          <button
            onClick={onPlayAgain}
            className="w-full sm:w-auto px-10 py-4 bg-crimson hover:bg-crimson-accent text-ivory-50 font-cinematic font-bold tracking-widest text-sm rounded transition-all shadow-crimson-glow inline-flex items-center justify-center gap-3"
          >
            <RotateCcw className="w-4 h-4" />
            <span>COMMENCE NEW INVESTIGATION</span>
          </button>
        </div>
      </div>
    </div>
  );
};
