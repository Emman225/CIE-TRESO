import type { UserEntity, UserRole, UserStatus } from '@/domain/entities/User';

export interface CreateUserRequest {
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  profileId: string;
  password: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  phone?: string;
  role?: UserRole;
  profileId?: string;
}

export interface UserFilter {
  role?: UserRole;
  status?: UserStatus;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface IUserRepository {
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findAll(filter?: UserFilter): Promise<PaginatedResult<UserEntity>>;
  create(user: CreateUserRequest): Promise<UserEntity>;
  update(id: string, data: UpdateUserRequest): Promise<UserEntity>;
  delete(id: string): Promise<void>;
  activate(id: string): Promise<UserEntity>;
  deactivate(id: string): Promise<UserEntity>;
  resetPassword(id: string, newPassword: string): Promise<void>;
  assignProfile(userId: string, profileId: string): Promise<UserEntity>;
}
