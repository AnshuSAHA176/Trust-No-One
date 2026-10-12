export interface User {
  id?: string;
  email: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface GameListItem {
  id: string;
  status: 'pending' | 'running' | 'finished' | string;
  created_at: string;
}

export interface GamePlayer {
  id: string;
  name: string;
  is_human: boolean;
  role?: string;
  is_alive?: boolean;
}

export interface GameCreateResponse {
  game_id: string;
  phase: string;
  status: string;
  player: {
    id: string;
    name: string;
    role: string;
  };
  players: Array<{
    id: string;
    name: string;
  }>;
}

export interface StartGameResponse {
  message: string;
  game_id: string;
  status: string;
  first_turn: {
    player_id: string;
    is_human: boolean;
  };
}

export interface VoteSubmitResponse {
  message: string;
  vote: {
    game: string;
    voter: string;
    target: string;
  };
}

export interface VoteCountItem {
  id: string;
  name: string;
  votes_received: number;
}

export interface VoteTallyResponse {
  game_id: string;
  status: string;
  total_votes: number;
  results: VoteCountItem[];
}

export interface GameFinishResponse {
  game_id: string;
  status: string;
  winner: string;
  loser?: string;
  message: string;
}

export interface ChatMessage {
  id: number | string;
  game: string;
  sender: string;
  sender_name?: string;
  receiver: string;
  receiver_name?: string;
  content: string;
  created_at: string;
}

export interface ActiveGameState {
  gameId: string;
  phase: string;
  status: string;
  humanPlayer: GamePlayer;
  players: GamePlayer[];
  activeTurnPlayerId?: string | null;
}
