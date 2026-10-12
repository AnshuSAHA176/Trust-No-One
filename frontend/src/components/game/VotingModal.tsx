import React, { useState } from 'react';
import { GamePlayer, GameFinishResponse, VoteCountItem } from '../../services/types';
import { Gavel, AlertCircle, Loader2, X, RefreshCw } from 'lucide-react';
import { gameService } from '../../services/gameService';
import { soundEngine } from '../../audio/SoundEngine';

interface VotingModalProps {
  gameId: string;
  players: GamePlayer[];
  humanPlayerId: string;
  isOpen: boolean;
  onClose: () => void;
  onVoteComplete: (result: GameFinishResponse) => void;
}

export const VotingModal: React.FC<VotingModalProps> = ({
  gameId,
  players,
  humanPlayerId,
  isOpen,
  onClose,
  onVoteComplete,
}) => {
  const [selectedSuspectId, setSelectedSuspectId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isFinalizing, setIsFinalizing] = useState<boolean>(false);
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [tally, setTally] = useState<VoteCountItem[]>([]);
  const [totalVotes, setTotalVotes] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const eligibleSuspects = players.filter(
    (p) => p.id !== humanPlayerId && p.is_alive !== false
  );

  const fetchTally = async () => {
    try {
      const data = await gameService.getVoteTally(gameId);
      setTally(data.results);
      setTotalVotes(data.total_votes);
    } catch {
      // Ignored
    }
  };

  const handleCastVote = async () => {
    if (!selectedSuspectId) return;

    setError(null);
    setIsSubmitting(true);
    soundEngine.play('vote_cast');

    try {
      // Real backend endpoint: POST /game/<id>/vote/
      await gameService.castVote(gameId, selectedSuspectId);
      setHasVoted(true);
      await fetchTally();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      const errMsg =
        e.response?.data?.error ||
        'Vote submission failed. Each player can vote only once in a running game.';
      setError(errMsg);
      if (errMsg.includes('already voted')) {
        setHasVoted(true);
        fetchTally();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinalizeGame = async () => {
    setError(null);
    setIsFinalizing(true);
    soundEngine.play('game_enter');

    try {
      // Real backend endpoint: POST /game/<id>/finish/
      const finishRes = await gameService.finishGame(gameId);
      onVoteComplete(finishRes);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(
        e.response?.data?.error ||
          'Failed to conclude game on the server. Please ensure votes have been registered.'
      );
    } finally {
      setIsFinalizing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-noir-950/90 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-xl bg-noir-900 border border-crimson/30 rounded-xl p-6 sm:p-8 shadow-noir-lg relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-ivory-200/10 mb-6">
          <div className="flex items-center gap-2">
            <Gavel className="w-5 h-5 text-crimson-glow" />
            <span className="font-intel text-xs text-crimson-glow tracking-widest font-bold uppercase">
              FORMAL ACCUSATION // CAST VERDICT (POST /game/vote/)
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-ivory-400 hover:text-ivory-100 p-1"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 mb-6 bg-crimson/15 border border-crimson/40 rounded text-xs text-crimson-glow flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!hasVoted ? (
          <div>
            <h2 className="font-cinematic text-2xl sm:text-3xl font-bold text-ivory-100 mb-2">
              DESIGNATE THE SUSPECT
            </h2>
            <p className="text-xs sm:text-sm text-ivory-300 font-light mb-6">
              You must vote for one of the three AI suspects. Self-voting is rejected by the server constraint. Once submitted, your vote is recorded in the PostgreSQL database.
            </p>

            {/* Suspect Choices */}
            <div className="space-y-3 mb-8">
              {eligibleSuspects.map((suspect) => {
                const isSelected = selectedSuspectId === suspect.id;
                return (
                  <div
                    key={suspect.id}
                    onClick={() => setSelectedSuspectId(suspect.id)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-crimson/15 border-crimson ring-1 ring-crimson'
                        : 'bg-noir-850 border-ivory-200/10 hover:border-ivory-200/25'
                    }`}
                  >
                    <div>
                      <div className="font-cinematic font-bold text-sm text-ivory-100">
                        {suspect.name}
                      </div>
                      <div className="font-intel text-[10px] text-ivory-400">
                        ID: {suspect.id}
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        isSelected
                          ? 'border-crimson bg-crimson'
                          : 'border-ivory-200/30'
                      }`}
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-ivory-50" />}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleCastVote}
              disabled={!selectedSuspectId || isSubmitting}
              className="w-full py-4 bg-crimson hover:bg-crimson-accent disabled:opacity-40 text-ivory-50 font-cinematic font-bold tracking-widest text-sm rounded transition-all shadow-crimson-glow flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>COMMITTING BALLOT TO SERVER...</span>
                </>
              ) : (
                <>
                  <Gavel className="w-4 h-4" />
                  <span>SUBMIT REAL VOTE (POST /game/vote/)</span>
                </>
              )}
            </button>
          </div>
        ) : (
          /* VOTE CAST - LIVE TALLY & CONCLUDE */
          <div>
            <div className="text-center mb-6">
              <div className="stamp-classified text-xs mb-2">BALLOT PERSISTED</div>
              <h3 className="font-cinematic text-xl sm:text-2xl font-bold text-ivory-100 mb-2">
                SERVER VOTE TALLY // GET /game/vote/
              </h3>
              <p className="text-xs text-ivory-300 font-light">
                Total ballots recorded on server: <span className="font-bold text-ivory-100">{totalVotes}</span>
              </p>
            </div>

            {/* Live Tally Cards */}
            <div className="space-y-2 mb-6">
              {tally.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-noir-850 rounded border border-ivory-200/10 flex items-center justify-between text-xs font-intel"
                >
                  <span className="text-ivory-200 font-bold">{item.name}</span>
                  <span className="text-crimson-glow font-bold bg-crimson/10 px-2 py-0.5 rounded border border-crimson/20">
                    {item.votes_received} VOTES
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchTally}
                className="px-4 py-3 bg-noir-800 hover:bg-noir-750 text-ivory-300 font-intel text-xs rounded border border-ivory-200/10 flex items-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>REFRESH TALLY</span>
              </button>

              <button
                onClick={handleFinalizeGame}
                disabled={isFinalizing}
                className="flex-1 py-3 bg-crimson hover:bg-crimson-accent disabled:opacity-50 text-ivory-50 font-cinematic font-bold tracking-widest text-xs rounded transition-all shadow-crimson-glow flex items-center justify-center gap-2"
              >
                {isFinalizing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>TALLYING WINNER (POST /finish/)...</span>
                  </>
                ) : (
                  <>
                    <Gavel className="w-4 h-4" />
                    <span>CONCLUDE GAME & REVEAL (POST /finish/)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
