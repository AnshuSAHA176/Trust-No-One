import { apiClient } from './api';
import {
  GameListItem,
  GameCreateResponse,
  StartGameResponse,
  VoteSubmitResponse,
  VoteTallyResponse,
  GameFinishResponse,
  ChatMessage,
  ActiveGameState,
  GamePlayer,
} from './types';

export const gameService = {
  /**
   * Fetch user's existing games from Django backend: GET /game/
   */
  async listGames(): Promise<GameListItem[]> {
    const res = await apiClient.get<GameListItem[]>('/game/');
    return res.data;
  },

  /**
   * Create a new 4-player game on the Django backend: POST /game/
   */
  async createGame(name: string): Promise<ActiveGameState> {
    const res = await apiClient.post<GameCreateResponse>('/game/', {
      name: name.trim(),
    });
    const data = res.data;

    const humanPlayer: GamePlayer = {
      id: data.player.id,
      name: data.player.name,
      role: data.player.role,
      is_human: true,
      is_alive: true,
    };

    const players: GamePlayer[] = data.players.map((p) => {
      if (p.id === humanPlayer.id) {
        return humanPlayer;
      }
      return {
        id: p.id,
        name: p.name,
        is_human: false,
        is_alive: true,
      };
    });

    return {
      gameId: data.game_id,
      phase: data.phase,
      status: data.status,
      humanPlayer,
      players,
    };
  },

  /**
   * Start a created pending game: POST /game/<id>/start/
   */
  async startGame(gameId: string): Promise<StartGameResponse> {
    const res = await apiClient.post<StartGameResponse>(`/game/${gameId}/start/`);
    return res.data;
  },

  /**
   * Submit a player accusation vote: POST /game/<id>/vote/
   */
  async castVote(gameId: string, targetPlayerId: string): Promise<VoteSubmitResponse> {
    const res = await apiClient.post<VoteSubmitResponse>(`/game/${gameId}/vote/`, {
      target: targetPlayerId,
    });
    return res.data;
  },

  /**
   * Fetch live vote tally from backend: GET /game/<id>/vote/
   */
  async getVoteTally(gameId: string): Promise<VoteTallyResponse> {
    const res = await apiClient.get<VoteTallyResponse>(`/game/${gameId}/vote/`);
    return res.data;
  },

  /**
   * Calculate final results and evaluate winner: POST /game/<id>/finish/
   */
  async finishGame(gameId: string): Promise<GameFinishResponse> {
    const res = await apiClient.post<GameFinishResponse>(`/game/${gameId}/finish/`);
    return res.data;
  },

  /**
   * Fetch conversation history: GET /conversation/history/?game=<game_id>
   */
  async getConversationHistory(gameId: string): Promise<ChatMessage[]> {
    const res = await apiClient.get<ChatMessage[]>('/conversation/history/', {
      params: { game: gameId },
    });
    return res.data;
  },

  /**
   * Transmit message via REST: POST /conversation/message/
   */
  async sendMessageRest(
    gameId: string,
    senderId: string,
    receiverId: string,
    content: string
  ): Promise<ChatMessage> {
    const res = await apiClient.post<ChatMessage>('/conversation/message/', {
      game: gameId,
      sender: senderId,
      receiver: receiverId,
      content: content.trim(),
    });
    return res.data;
  },
};
