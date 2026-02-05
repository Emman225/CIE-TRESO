import {
  IAuthRepository,
  LoginRequest,
  LoginResponse,
  ForgotPasswordResponse,
} from '@/domain/repositories/IAuthRepository';
import { UserEntity } from '@/domain/entities/User';
import { AuthToken } from '@/domain/entities/AuthToken';
import { LoginAttempt } from '@/domain/entities/LoginAttempt';
import { mockUsers, mockPasswords } from '@/infrastructure/mock-data/users';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function generateFakeJwt(userId: string, role: string): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      sub: userId,
      userId,
      role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 8 * 3600,
    })
  );
  const signature = btoa(
    Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2)
  );
  return `${header}.${payload}.${signature}`;
}

function generateToken(user: UserEntity): AuthToken {
  return {
    accessToken: generateFakeJwt(user.id, user.role),
    refreshToken: 'refresh-' + Math.random().toString(36).substring(2, 15),
    expiresAt: Date.now() + 8 * 60 * 60 * 1000,
    tokenType: 'Bearer',
  };
}

export class MockAuthRepository implements IAuthRepository {
  private loginAttempts: LoginAttempt[] = [];

  async login(request: LoginRequest): Promise<LoginResponse> {
    await delay(500);

    const attempt: LoginAttempt = {
      id: 'att-' + Date.now().toString(36),
      email: request.email,
      ipAddress: '192.168.1.' + Math.floor(Math.random() * 255),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'MockBrowser/1.0',
      success: false,
      attemptedAt: new Date().toISOString(),
    };

    // Check password
    const storedPassword = mockPasswords[request.email];
    if (!storedPassword || storedPassword !== request.password) {
      attempt.failureReason = 'Invalid credentials';
      this.loginAttempts.push(attempt);
      throw new Error('Email ou mot de passe incorrect');
    }

    // Find user
    const user = mockUsers.find((u) => u.email === request.email);
    if (!user) {
      attempt.failureReason = 'User not found';
      this.loginAttempts.push(attempt);
      throw new Error('Email ou mot de passe incorrect');
    }

    if (user.status === 'Inactive') {
      attempt.failureReason = 'Account inactive';
      this.loginAttempts.push(attempt);
      throw new Error("Ce compte est desactive. Contactez l'administrateur.");
    }

    attempt.success = true;
    this.loginAttempts.push(attempt);

    const loggedInUser: UserEntity = {
      ...user,
      lastLogin: new Date().toISOString(),
    };

    return {
      user: loggedInUser,
      token: generateToken(loggedInUser),
    };
  }

  async logout(_token: string): Promise<void> {
    await delay(300);
  }

  async refreshToken(_refreshToken: string): Promise<AuthToken> {
    await delay(300);
    const user = mockUsers.find((u) => u.status === 'Active') || mockUsers[0];
    return generateToken(user);
  }

  async forgotPassword(_email: string): Promise<ForgotPasswordResponse> {
    await delay(1000);
    return {
      success: true,
      message: 'Si un compte existe avec cet email, un lien de reinitialisation a ete envoye.',
    };
  }

  async validateToken(_token: string): Promise<UserEntity | null> {
    await delay(200);
    try {
      const parts = _token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        const user = mockUsers.find((u) => u.id === payload.userId || u.id === payload.sub);
        if (user && payload.exp * 1000 > Date.now()) {
          return user;
        }
      }
    } catch {
      // Token decode failed, fallback
    }
    return mockUsers.find((u) => u.status === 'Active') || null;
  }

  getLoginAttempts(): LoginAttempt[] {
    return [...this.loginAttempts];
  }

  getLoginAttemptsForEmail(email: string): LoginAttempt[] {
    return this.loginAttempts.filter((a) => a.email === email);
  }
}
