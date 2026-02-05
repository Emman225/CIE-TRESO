import { AuthToken } from '@/domain/entities/AuthToken';
import { UserEntity } from '@/domain/entities/User';

const TOKEN_KEY = 'cie_treso_auth_token';
const USER_KEY = 'cie_treso_auth_user';

export class TokenStorage {
  static saveTokens(token: AuthToken): void {
    try {
      localStorage.setItem(TOKEN_KEY, JSON.stringify(token));
    } catch {
      console.error('Failed to save token to localStorage');
    }
  }

  static getAccessToken(): string | null {
    try {
      const raw = localStorage.getItem(TOKEN_KEY);
      if (!raw) return null;
      const token: AuthToken = JSON.parse(raw);
      return token.accessToken;
    } catch {
      return null;
    }
  }

  static getRefreshToken(): string | null {
    try {
      const raw = localStorage.getItem(TOKEN_KEY);
      if (!raw) return null;
      const token: AuthToken = JSON.parse(raw);
      return token.refreshToken;
    } catch {
      return null;
    }
  }

  static isTokenExpired(): boolean {
    try {
      const raw = localStorage.getItem(TOKEN_KEY);
      if (!raw) return true;
      const token: AuthToken = JSON.parse(raw);
      return token.expiresAt < Date.now();
    } catch {
      return true;
    }
  }

  static clearTokens(): void {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {
      console.error('Failed to clear tokens from localStorage');
    }
  }

  static getUserFromToken(): { userId: string; role: string } | null {
    try {
      const raw = localStorage.getItem(TOKEN_KEY);
      if (!raw) return null;
      const token: AuthToken = JSON.parse(raw);
      if (token.expiresAt < Date.now()) {
        TokenStorage.clearTokens();
        return null;
      }
      // Try to decode the mock JWT payload (base64 middle part)
      const parts = token.accessToken.split('.');
      if (parts.length === 3) {
        try {
          const payload = JSON.parse(atob(parts[1]));
          return { userId: payload.userId || payload.sub, role: payload.role };
        } catch {
          // Fallback to stored user data
        }
      }
      // Fallback: read from stored user
      const userRaw = localStorage.getItem(USER_KEY);
      if (userRaw) {
        const user = JSON.parse(userRaw);
        return { userId: user.id, role: user.role };
      }
      return null;
    } catch {
      return null;
    }
  }

  // Backward-compatible aliases
  static saveToken(token: AuthToken): void {
    TokenStorage.saveTokens(token);
  }

  static getToken(): AuthToken | null {
    try {
      const raw = localStorage.getItem(TOKEN_KEY);
      if (!raw) return null;
      const token: AuthToken = JSON.parse(raw);
      if (token.expiresAt < Date.now()) {
        TokenStorage.clearTokens();
        return null;
      }
      return token;
    } catch {
      return null;
    }
  }

  static clearToken(): void {
    TokenStorage.clearTokens();
  }

  static saveUser(user: UserEntity): void {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch {
      console.error('Failed to save user to localStorage');
    }
  }

  static getUser(): UserEntity | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  static clearUser(): void {
    try {
      localStorage.removeItem(USER_KEY);
    } catch {
      console.error('Failed to clear user from localStorage');
    }
  }

  static clearAll(): void {
    TokenStorage.clearTokens();
  }

  static isSessionValid(): boolean {
    return !TokenStorage.isTokenExpired();
  }
}
