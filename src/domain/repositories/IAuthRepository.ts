import type { UserEntity } from '@/domain/entities/User';
import type { AuthToken } from '@/domain/entities/AuthToken';
import type { LoginAttempt } from '@/domain/entities/LoginAttempt';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: UserEntity;
  token: AuthToken;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface IAuthRepository {
  login(request: LoginRequest): Promise<LoginResponse>;
  logout(token: string): Promise<void>;
  refreshToken(refreshToken: string): Promise<AuthToken>;
  forgotPassword(email: string): Promise<ForgotPasswordResponse>;
  resetPassword(request: ResetPasswordRequest): Promise<{ success: boolean; message: string }>;
  validateToken(token: string): Promise<UserEntity | null>;
  getLoginAttempts(email: string): Promise<LoginAttempt[]>;
  logLoginAttempt(attempt: Omit<LoginAttempt, 'id'>): Promise<LoginAttempt>;
}
