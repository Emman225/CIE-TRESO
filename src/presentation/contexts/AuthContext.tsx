import React, { createContext, useState, useEffect, useCallback } from 'react';
import { UserEntity } from '@/domain/entities/User';
import { AuthToken } from '@/domain/entities/AuthToken';
import { authRepository, auditLogRepository } from '@/infrastructure/di/container';
import { TokenStorage } from '@/infrastructure/storage/TokenStorage';

interface AuthContextValue {
  user: UserEntity | null;
  token: AuthToken | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserEntity | null>(null);
  const [token, setToken] = useState<AuthToken | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = user !== null && token !== null;

  // On mount, check TokenStorage for existing session
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedToken = TokenStorage.getToken();
        const storedUser = TokenStorage.getUser();

        if (storedToken && storedUser) {
          // Validate the stored token against the backend
          const validatedUser = await authRepository.validateToken(storedToken.accessToken);
          if (validatedUser) {
            setUser(validatedUser);
            setToken(storedToken);
          } else {
            // Token is no longer valid
            TokenStorage.clearAll();
          }
        }
      } catch {
        // Session restoration failed silently
        TokenStorage.clearAll();
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authRepository.login({ email, password });

      // Persist to storage first
      TokenStorage.saveToken(response.token);
      TokenStorage.saveUser(response.user);

      // Update state
      setUser(response.user);
      setToken(response.token);

      // Log successful login audit event
      try {
        await auditLogRepository.log({
          userId: response.user.id,
          userName: response.user.name,
          action: 'LOGIN',
          resource: 'auth',
          details: `Connexion reussie pour ${response.user.email}`,
        });
      } catch {
        // Silently ignore audit logging failure
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur de connexion';
      setError(message);

      // Log failed login audit event
      try {
        await auditLogRepository.log({
          userId: 'unknown',
          userName: 'Inconnu',
          action: 'LOGIN_FAILED',
          resource: 'auth',
          details: `Tentative de connexion echouee pour ${email}: ${message}`,
        });
      } catch {
        // Silently ignore audit logging failure
      }

      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    const currentUser = user;
    const currentToken = token;

    try {
      // Log audit event before clearing state
      if (currentUser) {
        await auditLogRepository.log({
          userId: currentUser.id,
          userName: currentUser.name,
          action: 'LOGOUT',
          resource: 'auth',
          details: `Deconnexion de ${currentUser.email}`,
        });
      }

      // Notify the backend
      if (currentToken) {
        await authRepository.logout(currentToken.accessToken);
      }
    } catch {
      // Silently ignore logout errors - still clear local state
    } finally {
      // Always clear local state and storage
      setUser(null);
      setToken(null);
      setError(null);
      TokenStorage.clearAll();
    }
  }, [user, token]);

  const forgotPassword = useCallback(
    async (email: string): Promise<{ success: boolean; message: string }> => {
      setError(null);

      try {
        const response = await authRepository.forgotPassword(email);

        // Log audit event
        try {
          await auditLogRepository.log({
            userId: 'unknown',
            userName: 'Inconnu',
            action: 'PASSWORD_RESET_REQUEST',
            resource: 'auth',
            details: `Demande de reinitialisation de mot de passe pour ${email}`,
          });
        } catch {
          // Silently ignore audit logging failure
        }

        return response;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erreur lors de la demande';
        setError(message);
        return { success: false, message };
      }
    },
    []
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AuthContextValue = {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    forgotPassword,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
