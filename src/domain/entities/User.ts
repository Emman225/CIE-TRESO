export type UserRole = 'Admin' | 'Analyst' | 'Direction' | 'Controller';
export type UserStatus = 'Active' | 'Inactive';

export interface UserEntity {
  id: string;
  nom: string;
  prenom: string;
  name?: string;
  email: string;
  phone?: string;
  role: UserRole;
  profileId: string;
  status: UserStatus;
  lastLogin: string;
  avatar?: string;
  createdAt: string;
  updatedAt?: string;
}
