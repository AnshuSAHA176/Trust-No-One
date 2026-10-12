import React, { useState, useRef, useEffect } from 'react';
import { Send, Radio } from 'lucide-react';
import { ChatMessage, GamePlayer } from '../../services/types';
import { ConnectionStatus } from '../../services/websocketService';
import { soundEngine } from '../../audio/SoundEngine';

interface LiveConversationProps {
  messages: ChatMessage[];
  players: GamePlayer[];
  humanPlayerId: string;
  selectedTargetId: string;
  onSelectTarget: (id: string) => void;
  onSendMessage: (receiverId: string, content: string) => void;
  connectionStatus: ConnectionStatus;
  isSending?: boolean;
}

export const LiveConversation: React.FC<LiveConversationProps> = ({
  messages,
  players,
  humanPlayerId,
  selectedTargetId,
  onSelectTarget,
  onSendMessage,
  connectionStatus,
  isSending = false,
}) => {
  const [inputText, setInputText] = useState('');
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedTargetId) return;

    soundEngine.play('chat_send');
    onSendMessage(selectedTargetId, inputText.trim());
    setInputText('');
  };

  const selectedTargetPlayer = players.find((p) => p.id === selectedTargetId);

  return (
    <div className="w-full flex-1 flex flex-col bg-noir-900 border border-ivory-200/10 rounded-xl overflow-hidden shadow-noir-lg min-h-[440px]">
      {/* Header with Connection Status */}
      <div className="p-4 bg-noir-850 border-b border-ivory-200/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-intel text-xs font-bold text-ivory-200 tracking-wider uppercase">
            LIVE INTERROGATION TRANSCRIPT
          </span>
          <span className="text-[10px] font-intel text-ivory-400">
            ({messages.length} STATEMENTS RECORDED)
          </span>
        </div>

        {/* WebSocket Status Indicator */}
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              connectionStatus === 'connected'
                ? 'bg-emerald-500 animate-pulse'
                : connectionStatus === 'connecting'
                ? 'bg-amber-500 animate-bounce'
                : 'bg-crimson'
            }`}
          />
          <span className="font-intel text-[10px] uppercase tracking-widest text-ivory-400">
            {connectionStatus === 'connected'
              ? 'WS CONNECTED'
              : connectionStatus === 'connecting'
              ? 'RECONNECTING'
              : 'OFFLINE'}
          </span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div
        ref={chatScrollRef}
        className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 max-h-[460px] bg-noir-950/60"
      >
        {messages.length === 0 ? (
          <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center p-6 text-ivory-400">
            <Radio className="w-8 h-8 text-crimson-glow/40 mb-3 animate-pulse" />
            <h4 className="font-cinematic text-lg text-ivory-200 mb-1">
              THE ROOM IS SILENT
            </h4>
            <p className="text-xs text-ivory-400 max-w-sm font-light">
              Select an AI suspect above and transmit your question via WebSocket. The backend Celery queue will process responses in real time.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isHuman = msg.sender === humanPlayerId;
            const senderPlayer = players.find((p) => p.id === msg.sender);
            const receiverPlayer = players.find((p) => p.id === msg.receiver);

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isHuman ? 'items-end' : 'items-start'}`}
              >
                {/* Meta details */}
                <div className="flex items-center gap-2 mb-1 text-[10px] font-intel text-ivory-400 px-1">
                  <span className="font-bold text-ivory-200">
                    {msg.sender_name || senderPlayer?.name || (isHuman ? 'You' : 'Suspect')}
                  </span>
                  <span>→</span>
                  <span className="text-ivory-300">
                    {msg.receiver_name || receiverPlayer?.name || 'Chamber'}
                  </span>
                  <span>•</span>
                  <span>
                    {new Date(msg.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[85%] sm:max-w-[75%] p-3.5 rounded-lg text-xs sm:text-sm font-sans leading-relaxed border ${
                    isHuman
                      ? 'bg-crimson/20 border-crimson/40 text-ivory-50 rounded-br-none shadow-sm'
                      : 'bg-noir-800 border-ivory-200/10 text-ivory-200 rounded-bl-none shadow-md'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Form Bar */}
      <form onSubmit={handleSend} className="p-4 bg-noir-850 border-t border-ivory-200/10 flex items-center gap-3">
        {/* Target Suspect Dropdown */}
        <select
          value={selectedTargetId}
          onChange={(e) => onSelectTarget(e.target.value)}
          className="bg-noir-800 border border-ivory-200/15 rounded px-3 py-2.5 text-xs font-intel text-ivory-200 focus:outline-none focus:border-crimson"
          aria-label="Target suspect to question"
        >
          <option value="" disabled>Select Suspect</option>
          {players
            .filter((p) => p.id !== humanPlayerId && p.is_alive !== false)
            .map((p) => (
              <option key={p.id} value={p.id}>
                Question {p.name}
              </option>
            ))}
        </select>

        {/* Text Input */}
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            selectedTargetPlayer
              ? `Interrogate ${selectedTargetPlayer.name}... (Press Enter)`
              : 'Select a suspect to interrogate...'
          }
          disabled={!selectedTargetId}
          className="flex-1 bg-noir-800 border border-ivory-200/15 rounded px-4 py-2.5 text-xs sm:text-sm font-sans text-ivory-100 placeholder:text-ivory-500 focus:outline-none focus:border-crimson disabled:opacity-50"
        />

        {/* Send Action */}
        <button
          type="submit"
          disabled={!inputText.trim() || !selectedTargetId || isSending}
          className="px-5 py-2.5 bg-crimson hover:bg-crimson-accent disabled:opacity-40 text-ivory-50 font-intel font-bold text-xs rounded transition-all flex items-center gap-1.5 shadow-crimson-glow flex-shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">TRANSMIT</span>
        </button>
      </form>
    </div>
  );
};
