import type { ProfileEntity } from '@/domain/entities/Profile';

export interface IProfileRepository {
  findById(id: string): Promise<ProfileEntity | null>;
  findAll(): Promise<ProfileEntity[]>;
  findByName(name: string): Promise<ProfileEntity | null>;
  create(profile: Omit<ProfileEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProfileEntity>;
  update(id: string, data: Partial<ProfileEntity>): Promise<ProfileEntity>;
  delete(id: string): Promise<void>;
}
