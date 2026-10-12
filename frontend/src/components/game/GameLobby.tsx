import React, { useState, useEffect } from 'react';
import { Shield, Play, Loader2, Sparkles, AlertCircle, History, Plus } from 'lucide-react';
import { gameService } from '../../services/gameService';
import { ActiveGameState, GameListItem } from '../../services/types';
import { soundEngine } from '../../audio/SoundEngine';

interface GameLobbyProps {
  onGameReady: (session: ActiveGameState) => void;
  onCancel: () => void;
}

export const GameLobby: React.FC<GameLobbyProps> = ({ onGameReady, onCancel }) => {
  const [playerName, setPlayerName] = useState<string>('Inspector Sharma');
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isStarting, setIsStarting] = useState<boolean>(false);
  const [createdSession, setCreatedSession] = useState<ActiveGameState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pastGames, setPastGames] = useState<GameListItem[]>([]);
  const [isLoadingPast, setIsLoadingPast] = useState<boolean>(true);

  // Fetch real past games from Django: GET /game/
  useEffect(() => {
    const fetchGames = async () => {
      setIsLoadingPast(true);
      try {
        const games = await gameService.listGames();
        setPastGames(games);
      } catch {
        // Handled silently
      } finally {
        setIsLoadingPast(false);
      }
    };
    fetchGames();
  }, []);

  const handleCreateGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;

    setError(null);
    setIsCreating(true);
    soundEngine.play('select');

    try {
      // Real backend endpoint: POST /game/
      const session = await gameService.createGame(playerName.trim());
      setCreatedSession(session);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(
        e.response?.data?.error ||
          'Failed to initialize game with the Django backend. Ensure backend server is active.'
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleStartGame = async () => {
    if (!createdSession) return;
    setIsStarting(true);
    soundEngine.play('game_enter');

    try {
      // Real backend endpoint: POST /game/<id>/start/
      const startRes = await gameService.startGame(createdSession.gameId);
      const updated: ActiveGameState = {
        ...createdSession,
        status: 'running',
        phase: 'investigation',
        activeTurnPlayerId: startRes.first_turn?.player_id || createdSession.humanPlayer.id,
      };
      onGameReady(updated);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(
        e.response?.data?.error ||
          'Failed to start game on the server. The chamber requires living players.'
      );
      setIsStarting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-noir-950/95 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-2xl bg-noir-900 border border-ivory-200/10 rounded-xl p-6 sm:p-10 shadow-noir-lg relative">
        {/* Top classified stamp */}
        <div className="flex items-center justify-between mb-8 border-b border-ivory-200/10 pb-4">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-crimson-glow" />
            <span className="font-intel text-xs text-ivory-300 tracking-widest uppercase">
              INTERROGATION LOBBY // CHAMBER MANAGEMENT
            </span>
          </div>
          <button
            onClick={onCancel}
            className="text-ivory-400 hover:text-ivory-100 font-intel text-xs uppercase"
          >
            RETURN TO ARCHIVE
          </button>
        </div>

        {!createdSession ? (
          <div>
            <div className="stamp-top-secret mb-4 text-xs">INVESTIGATOR CREDENTIALS</div>
            <h2 className="font-cinematic text-2xl sm:text-4xl font-bold text-ivory-100 mb-3 tracking-wide">
              CREATE A NEW CHAMBER
            </h2>
            <p className="text-sm text-ivory-300 font-light mb-8">
              The Django orchestrator will assemble exactly 4 players (you and 3 autonomous AI suspects).
            </p>

            {error && (
              <div className="p-3 mb-6 bg-crimson/15 border border-crimson/40 rounded text-xs text-crimson-glow flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateGame} className="space-y-6 mb-10">
              <div>
                <label className="block text-xs font-intel text-ivory-400 uppercase tracking-widest mb-2">
                  AGENT CODENAME / DESIGNATION
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="e.g. Inspector Sharma"
                  className="w-full px-4 py-3 bg-noir-800 border border-ivory-200/20 rounded font-sans text-ivory-100 focus:outline-none focus:border-crimson focus:ring-1 focus:ring-crimson text-sm"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isCreating || !playerName.trim()}
                className="w-full py-4 bg-crimson hover:bg-crimson-accent disabled:opacity-50 text-ivory-50 font-cinematic font-bold tracking-widest text-sm rounded transition-all shadow-crimson-glow flex items-center justify-center gap-2"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>SYNCHRONIZING WITH BACKEND...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>INITIALIZE REAL CHAMBER (POST /game/)</span>
                  </>
                )}
              </button>
            </form>

            {/* Past Games from Django GET /game/ */}
            {pastGames.length > 0 && (
              <div className="pt-6 border-t border-ivory-200/10">
                <div className="flex items-center gap-2 mb-3 text-xs font-intel text-ivory-400 uppercase tracking-wider">
                  <History className="w-3.5 h-3.5" />
                  <span>YOUR RECORDED GAMES ON SERVER ({pastGames.length})</span>
                </div>
                <div className="space-y-2 max-h-36 overflow-y-auto">
                  {pastGames.map((g) => (
                    <div
                      key={g.id}
                      className="p-3 rounded bg-noir-850 border border-ivory-200/5 flex items-center justify-between text-xs font-intel"
                    >
                      <div className="truncate text-ivory-300 font-mono text-[11px]">
                        ID: {g.id}
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded uppercase ${
                            g.status === 'running'
                              ? 'bg-amber-950/60 text-amber-glow border border-amber-800/40'
                              : g.status === 'finished'
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                              : 'bg-noir-800 text-ivory-400'
                          }`}
                        >
                          {g.status}
                        </span>
                        <span className="text-ivory-500 text-[10px]">
                          {new Date(g.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* STEP 2: 4 PARTICIPANT SLOTS LOBBY (REAL BACKEND DATA) */
          <div>
            <div className="stamp-classified mb-3 text-xs">CHAMBER INITIALIZED</div>
            <h2 className="font-cinematic text-2xl sm:text-3xl font-bold text-ivory-100 mb-2 tracking-wide">
              FOUR PARTICIPANTS REGISTERED ON SERVER
            </h2>
            <p className="text-xs sm:text-sm text-ivory-300 font-light mb-6">
              Backend Game ID: <span className="font-mono text-ivory-200">{createdSession.gameId}</span>.
              Roles and secret alibis are committed to the PostgreSQL database.
            </p>

            {error && (
              <div className="p-3 mb-6 bg-crimson/15 border border-crimson/40 rounded text-xs text-crimson-glow flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Real 4 Player Slots from Server */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {createdSession.players.map((p, idx) => (
                <div
                  key={p.id}
                  className={`p-4 rounded-lg border flex items-center justify-between ${
                    p.is_human
                      ? 'bg-crimson/10 border-crimson/30 text-ivory-100 shadow-sm'
                      : 'bg-noir-800/80 border-ivory-200/10 text-ivory-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold font-intel text-xs ${
                        p.is_human
                          ? 'bg-crimson text-ivory-50'
                          : 'bg-noir-700 text-ivory-300'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <div>
                      <div className="font-cinematic font-bold text-sm text-ivory-100">
                        {p.name}
                      </div>
                      <div className="font-intel text-[10px] text-ivory-400">
                        {p.is_human ? 'HUMAN INVESTIGATOR' : 'AI CONTROLLED BOT'}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-intel text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded">
                    SEATED
                  </span>
                </div>
              ))}
            </div>

            {/* Start Game Action */}
            <button
              onClick={handleStartGame}
              disabled={isStarting}
              className="w-full py-4 bg-crimson hover:bg-crimson-accent text-ivory-50 font-cinematic font-bold tracking-widest text-sm rounded transition-all shadow-crimson-glow flex items-center justify-center gap-2"
            >
              {isStarting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>COMMENCING TURN DISPATCH (POST /start/)...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>START INVESTIGATION (POST /start/)</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
