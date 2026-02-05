import {
  IUserRepository,
  CreateUserRequest,
  UpdateUserRequest,
  UserFilter,
  PaginatedResult,
} from '@/domain/repositories/IUserRepository';
import { UserEntity } from '@/domain/entities/User';
import { mockUsers, mockPasswords } from '@/infrastructure/mock-data/users';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class MockUserRepository implements IUserRepository {
  private users: UserEntity[] = mockUsers.map((u) => ({ ...u }));
  private passwords: Record<string, string> = { ...mockPasswords };

  async findAll(filter?: UserFilter): Promise<PaginatedResult<UserEntity>> {
    await delay(400);

    let filtered = [...this.users];

    if (filter?.role) {
      filtered = filtered.filter((u) => u.role === filter.role);
    }
    if (filter?.status) {
      filtered = filtered.filter((u) => u.status === filter.status);
    }
    if (filter?.search) {
      const search = filter.search.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(search) ||
          u.email.toLowerCase().includes(search) ||
          (u.phone && u.phone.includes(search))
      );
    }

    const page = filter?.page ?? 1;
    const pageSize = filter?.pageSize ?? 20;
    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const data = filtered.slice(start, start + pageSize);

    return { data, total, page, pageSize, totalPages };
  }

  async findById(id: string): Promise<UserEntity | null> {
    await delay(300);
    return this.users.find((u) => u.id === id) ?? null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    await delay(300);
    return this.users.find((u) => u.email === email) ?? null;
  }

  async create(request: CreateUserRequest): Promise<UserEntity> {
    await delay(500);

    // Check for duplicate email
    if (this.users.some((u) => u.email === request.email)) {
      throw new Error('Un utilisateur avec cet email existe deja.');
    }

    const newUser: UserEntity = {
      id: 'usr-' + Date.now().toString(36),
      name: request.name,
      email: request.email,
      phone: request.phone || '',
      role: request.role,
      profileId: request.profileId,
      status: 'Active',
      lastLogin: 'Jamais',
      avatar: `https://picsum.photos/100/100?u=${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    this.users.push(newUser);
    this.passwords[request.email] = request.password;

    return { ...newUser };
  }

  async update(id: string, data: UpdateUserRequest): Promise<UserEntity> {
    await delay(400);

    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) {
      throw new Error('Utilisateur non trouve.');
    }

    if (data.email && data.email !== this.users[index].email) {
      if (this.users.some((u) => u.email === data.email && u.id !== id)) {
        throw new Error('Un utilisateur avec cet email existe deja.');
      }
    }

    this.users[index] = {
      ...this.users[index],
      ...(data.name !== undefined && { name: data.name }),
      ...(data.email !== undefined && { email: data.email }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.role !== undefined && { role: data.role }),
      ...(data.profileId !== undefined && { profileId: data.profileId }),
    };

    return { ...this.users[index] };
  }

  async delete(id: string): Promise<void> {
    await delay(400);

    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) {
      throw new Error('Utilisateur non trouve.');
    }

    const email = this.users[index].email;
    this.users.splice(index, 1);
    delete this.passwords[email];
  }

  async activate(id: string): Promise<UserEntity> {
    await delay(300);

    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) {
      throw new Error('Utilisateur non trouve.');
    }

    this.users[index] = { ...this.users[index], status: 'Active' };
    return { ...this.users[index] };
  }

  async deactivate(id: string): Promise<UserEntity> {
    await delay(300);

    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) {
      throw new Error('Utilisateur non trouve.');
    }

    this.users[index] = { ...this.users[index], status: 'Inactive' };
    return { ...this.users[index] };
  }

  async resetPassword(id: string, _newPassword: string): Promise<void> {
    await delay(500);

    const user = this.users.find((u) => u.id === id);
    if (!user) {
      throw new Error('Utilisateur non trouve.');
    }

    // Generate a temporary password
    const tempPassword = 'Temp' + Math.random().toString(36).substring(2, 8) + '!';
    this.passwords[user.email] = _newPassword || tempPassword;
  }

  async assignProfile(userId: string, profileId: string): Promise<UserEntity> {
    await delay(300);

    const index = this.users.findIndex((u) => u.id === userId);
    if (index === -1) {
      throw new Error('Utilisateur non trouve.');
    }

    this.users[index] = { ...this.users[index], profileId };
    return { ...this.users[index] };
  }
}
