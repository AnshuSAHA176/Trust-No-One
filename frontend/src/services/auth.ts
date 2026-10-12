import { apiClient } from './api';
import { AuthTokens, User } from './types';

class AuthService {
  private listeners: Set<() => void> = new Set();

  constructor() {
    window.addEventListener('tno_auth_expired', () => {
      this.notify();
    });
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  public getAccessToken(): string | null {
    return localStorage.getItem('tno_access_token');
  }

  public getRefreshToken(): string | null {
    return localStorage.getItem('tno_refresh_token');
  }

  public getStoredEmail(): string | null {
    return localStorage.getItem('tno_user_email');
  }

  public isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  public setTokens(tokens: AuthTokens, email?: string) {
    localStorage.setItem('tno_access_token', tokens.access);
    localStorage.setItem('tno_refresh_token', tokens.refresh);
    if (email) {
      localStorage.setItem('tno_user_email', email);
    }
    this.notify();
  }

  public logout() {
    localStorage.removeItem('tno_access_token');
    localStorage.removeItem('tno_refresh_token');
    localStorage.removeItem('tno_user_email');
    this.notify();
  }

  public async register(email: string, password: string): Promise<User> {
    const res = await apiClient.post<User>('/register/', {
      email: email.trim(),
      password,
    });
    return res.data;
  }

  public async login(email: string, password: string): Promise<AuthTokens> {
    const res = await apiClient.post<AuthTokens>('/login/', {
      email: email.trim(),
      password,
    });
    this.setTokens(res.data, email.trim());
    return res.data;
  }

  /**
   * Verify token validity against real backend (GET /game/)
   */
  public async verifySession(): Promise<boolean> {
    const token = this.getAccessToken();
    if (!token) return false;

    try {
      await apiClient.get('/game/');
      return true;
    } catch (err: unknown) {
      const e = err as { response?: { status?: number } };
      if (e.response?.status === 401) {
        this.logout();
        return false;
      }
      return true; // Keep session on temporary network issues
    }
  }
}

export const authService = new AuthService();
