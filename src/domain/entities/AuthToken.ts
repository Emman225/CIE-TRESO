import type { UserRole } from '@/domain/entities/User';

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  userId: string;
  role: UserRole;
}
