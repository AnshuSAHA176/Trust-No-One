import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ActiveGameState,
  ChatMessage,
  GameFinishResponse,
} from '../../services/types';
import { SuspectsCircle } from './SuspectsCircle';
import { LiveConversation } from './LiveConversation';
import { PrivateDossierModal } from './PrivateDossierModal';
import { VotingModal } from './VotingModal';
import { ResultSequence } from './ResultSequence';
import { GameWebSocketService, ConnectionStatus } from '../../services/websocketService';
import { gameService } from '../../services/gameService';
import {
  FileText,
  Gavel,
  ArrowLeft,
} from 'lucide-react';
import { soundEngine } from '../../audio/SoundEngine';

interface InvestigationArenaProps {
  session: ActiveGameState;
  onExit: () => void;
  onRestart: () => void;
}

export const InvestigationArena: React.FC<InvestigationArenaProps> = ({
  session,
  onExit,
  onRestart,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedTargetId, setSelectedTargetId] = useState<string>('');
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [isDossierOpen, setIsDossierOpen] = useState<boolean>(false);
  const [isVotingOpen, setIsVotingOpen] = useState<boolean>(false);
  const [finishResult, setFinishResult] = useState<GameFinishResponse | null>(null);

  const wsServiceRef = useRef<GameWebSocketService | null>(null);

  // Initialize selected target suspect (first AI bot)
  useEffect(() => {
    const firstBot = session.players.find((p) => p.id !== session.humanPlayer.id);
    if (firstBot) {
      setSelectedTargetId(firstBot.id);
    }
  }, [session]);

  // Initial fetch of conversation history from GET /conversation/history/?game=<id>
  const loadHistory = useCallback(async () => {
    try {
      const history = await gameService.getConversationHistory(session.gameId);
      if (history && history.length > 0) {
        setMessages(history);
      }
    } catch {
      // Ignored
    }
  }, [session.gameId]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Real WebSocket connection to ws/games/<game_id>/chat/?token=<token>
  useEffect(() => {
    const ws = new GameWebSocketService(session.gameId);
    wsServiceRef.current = ws;

    const unsubStatus = ws.subscribeStatus((st) => {
      setConnectionStatus(st);
      if (st === 'connected') {
        soundEngine.play('connection_alert');
      }
    });

    const unsubMessages = ws.subscribeMessages((msg) => {
      if (msg === 'send') {
        // Backend notified a message was added; refresh conversation history
        loadHistory();
      } else {
        // Direct structured AI reply or question broadcast
        setMessages((prev) => {
          if (prev.some((m) => String(m.id) === String(msg.id))) return prev;
          return [...prev, msg];
        });
        soundEngine.play('chat_receive');
      }
    });

    ws.connect();

    return () => {
      unsubStatus();
      unsubMessages();
      ws.disconnect();
    };
  }, [session.gameId, loadHistory]);

  // Send message handler (real WebSocket with REST fallback)
  const handleSendMessage = async (receiverId: string, content: string) => {
    const sentWs = wsServiceRef.current?.sendMessage(receiverId, content);
    if (!sentWs) {
      try {
        await gameService.sendMessageRest(
          session.gameId,
          session.humanPlayer.id,
          receiverId,
          content
        );
        loadHistory();
      } catch {
        // Logged or handled by UI
      }
    }
  };

  return (
    <div className="min-h-screen bg-noir-950 text-ivory-100 flex flex-col pt-4 px-4 sm:px-8 pb-8 relative">
      {/* Top Tactical Command Bar */}
      <div className="max-w-6xl w-full mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 py-3 px-5 bg-noir-900 border border-ivory-200/10 rounded-xl mb-6 shadow-noir-lg">
        {/* Back and Game ID */}
        <div className="flex items-center gap-4">
          <button
            onClick={onExit}
            className="p-2 text-ivory-400 hover:text-ivory-100 bg-noir-850 hover:bg-noir-800 rounded-lg border border-ivory-200/10 transition-colors"
            title="Exit Investigation"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-crimson animate-pulse" />
              <h1 className="font-cinematic font-bold text-base text-ivory-100">
                ACTIVE CHAMBER // 4 PLAYERS
              </h1>
            </div>
            <div className="text-[10px] font-intel text-ivory-400 font-mono">
              GAME ID: {session.gameId}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Secret Dossier Trigger */}
          <button
            onClick={() => {
              soundEngine.play('evidence_slide');
              setIsDossierOpen(true);
            }}
            className="px-4 py-2 bg-noir-800 hover:bg-noir-750 text-ivory-200 border border-amber-clue/30 hover:border-amber-clue/60 text-xs font-intel font-bold rounded-lg transition-all flex items-center gap-2"
          >
            <FileText className="w-4 h-4 text-amber-glow" />
            <span>SECRET DOSSIER</span>
          </button>

          {/* Call Vote / Accuse Trigger */}
          <button
            onClick={() => {
              soundEngine.play('select');
              setIsVotingOpen(true);
            }}
            className="px-5 py-2 bg-crimson hover:bg-crimson-accent text-ivory-50 text-xs font-cinematic font-bold tracking-wider rounded-lg transition-all shadow-crimson-glow flex items-center gap-2"
          >
            <Gavel className="w-4 h-4" />
            <span>CALL VOTE</span>
          </button>
        </div>
      </div>

      {/* Main Arena Workspace */}
      <div className="max-w-6xl w-full mx-auto flex-1 flex flex-col">
        {/* Suspects Chamber Seating & Target Selector */}
        <SuspectsCircle
          players={session.players}
          humanPlayerId={session.humanPlayer.id}
          selectedTargetId={selectedTargetId}
          onSelectTarget={setSelectedTargetId}
          activeTurnPlayerId={session.activeTurnPlayerId}
        />

        {/* Live Conversation Console */}
        <LiveConversation
          messages={messages}
          players={session.players}
          humanPlayerId={session.humanPlayer.id}
          selectedTargetId={selectedTargetId}
          onSelectTarget={setSelectedTargetId}
          onSendMessage={handleSendMessage}
          connectionStatus={connectionStatus}
        />
      </div>

      {/* Modals */}
      <PrivateDossierModal
        player={session.humanPlayer}
        gameId={session.gameId}
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
      />

      <VotingModal
        gameId={session.gameId}
        players={session.players}
        humanPlayerId={session.humanPlayer.id}
        isOpen={isVotingOpen}
        onClose={() => setIsVotingOpen(false)}
        onVoteComplete={(result) => {
          setIsVotingOpen(false);
          setFinishResult(result);
        }}
      />

      {finishResult && (
        <ResultSequence
          result={finishResult}
          onPlayAgain={() => {
            setFinishResult(null);
            onRestart();
          }}
        />
      )}
    </div>
  );
};
