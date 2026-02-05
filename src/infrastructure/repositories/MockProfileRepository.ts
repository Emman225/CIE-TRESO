import { IProfileRepository } from '@/domain/repositories/IProfileRepository';
import { ProfileEntity } from '@/domain/entities/Profile';
import { mockProfiles } from '@/infrastructure/mock-data/profiles';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class MockProfileRepository implements IProfileRepository {
  private profiles: ProfileEntity[] = mockProfiles.map((p) => ({
    ...p,
    permissions: p.permissions.map((perm) => ({ ...perm, actions: [...perm.actions] })),
  }));

  async findById(id: string): Promise<ProfileEntity | null> {
    await delay(200);
    const profile = this.profiles.find((p) => p.id === id);
    return profile ? { ...profile } : null;
  }

  async findAll(): Promise<ProfileEntity[]> {
    await delay(300);
    return this.profiles.map((p) => ({ ...p }));
  }

  async create(
    data: Omit<ProfileEntity, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ProfileEntity> {
    await delay(500);

    if (this.profiles.some((p) => p.nom === data.nom)) {
      throw new Error('Un profil avec ce nom existe deja.');
    }

    const profile: ProfileEntity = {
      ...data,
      id: 'prf-' + Date.now().toString(36),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.profiles.push(profile);
    return { ...profile };
  }

  async update(id: string, data: Partial<ProfileEntity>): Promise<ProfileEntity> {
    await delay(400);

    const index = this.profiles.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error('Profil non trouve.');
    }

    this.profiles[index] = {
      ...this.profiles[index],
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    };

    return { ...this.profiles[index] };
  }

  async delete(id: string): Promise<void> {
    await delay(300);

    const index = this.profiles.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error('Profil non trouve.');
    }

    if (this.profiles[index].isDefault) {
      throw new Error('Impossible de supprimer le profil par defaut.');
    }

    this.profiles.splice(index, 1);
  }
}
