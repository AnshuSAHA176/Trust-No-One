import { authService } from './auth';
import { ChatMessage } from './types';

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export class GameWebSocketService {
  private ws: WebSocket | null = null;
  private gameId: string;
  private status: ConnectionStatus = 'disconnected';
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 6;
  private reconnectTimeout: number | null = null;
  private messageListeners: Set<(message: ChatMessage | 'send') => void> = new Set();
  private statusListeners: Set<(status: ConnectionStatus) => void> = new Set();

  constructor(gameId: string) {
    this.gameId = gameId;
  }

  public getStatus(): ConnectionStatus {
    return this.status;
  }

  public subscribeMessages(listener: (message: ChatMessage | 'send') => void) {
    this.messageListeners.add(listener);
    return () => this.messageListeners.delete(listener);
  }

  public subscribeStatus(listener: (status: ConnectionStatus) => void) {
    this.statusListeners.add(listener);
    return () => this.statusListeners.delete(listener);
  }

  private setStatus(status: ConnectionStatus) {
    this.status = status;
    this.statusListeners.forEach((fn) => fn(status));
  }

  public connect() {
    if (
      this.ws &&
      (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    const token = authService.getAccessToken();
    if (!token) {
      this.setStatus('error');
      return;
    }

    this.setStatus('connecting');

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // Use current host (proxied through Vite/tunnel) or custom VITE_WS_URL
    const wsHost =
      import.meta.env.VITE_WS_URL ||
      `${wsProtocol}//${window.location.host}`;

    const fullWsPath = `${wsHost.replace(/\/+$/, '')}/ws/games/${this.gameId}/chat/?token=${encodeURIComponent(token)}`;

    try {
      this.ws = new WebSocket(fullWsPath);

      this.ws.onopen = () => {
        this.setStatus('connected');
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const raw = JSON.parse(event.data);

          if (raw === 'send' || raw?.message === 'send') {
            this.messageListeners.forEach((fn) => fn('send'));
            return;
          }

          if (raw && typeof raw === 'object' && raw.content) {
            const msg: ChatMessage = {
              id: raw.id || `ws-${Date.now()}`,
              game: raw.game || this.gameId,
              sender: raw.sender,
              sender_name: raw.sender_name,
              receiver: raw.receiver,
              receiver_name: raw.receiver_name,
              content: raw.content,
              created_at: raw.created_at || new Date().toISOString(),
            };
            this.messageListeners.forEach((fn) => fn(msg));
          }
        } catch {
          if (event.data === 'send') {
            this.messageListeners.forEach((fn) => fn('send'));
          }
        }
      };

      this.ws.onerror = () => {
        this.setStatus('error');
      };

      this.ws.onclose = () => {
        this.setStatus('disconnected');
        this.scheduleReconnect();
      };
    } catch {
      this.setStatus('error');
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;

    this.reconnectAttempts += 1;
    const delay = Math.min(10000, 1000 * Math.pow(1.8, this.reconnectAttempts));

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectTimeout = window.setTimeout(() => {
      this.connect();
    }, delay);
  }

  public sendMessage(receiverId: string, content: string): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return false;
    }

    const payload = {
      receiver: receiverId,
      content: content.trim(),
    };

    try {
      this.ws.send(JSON.stringify(payload));
      return true;
    } catch {
      return false;
    }
  }

  public disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onerror = null;
      this.ws.onclose = null;
      this.ws.close();
      this.ws = null;
    }

    this.setStatus('disconnected');
  }
}
