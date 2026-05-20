import 'server-only';

import { getSupabase } from '@/server/db/client';
import type { UserRow, UserRole } from '@/types/database';

export type CreateUserInput = {
  email?: string | null;
  phone?: string | null;
  name?: string | null;
  passwordHash?: string | null;
  githubUrl?: string | null;
} & ({ email: string } | { phone: string });

export type UpdateUserPatch = Partial<
  Pick<
    UserRow,
    | 'email'
    | 'phone'
    | 'passwordHash'
    | 'name'
    | 'bio'
    | 'githubUrl'
    | 'contactEmail'
    | 'websiteUrl'
    | 'role'
  >
>;

async function findOneBy(column: 'id' | 'email' | 'phone', value: string): Promise<UserRow | null> {
  const { data, error } = await getSupabase()
    .from('User')
    .select('*')
    .eq(column, value)
    .maybeSingle();
  if (error) throw error;
  return (data as UserRow | null) ?? null;
}

export const UserRepository = {
  async findById(id: string): Promise<UserRow | null> {
    return findOneBy('id', id);
  },

  async findByEmail(email: string): Promise<UserRow | null> {
    return findOneBy('email', email);
  },

  async findByPhone(phone: string): Promise<UserRow | null> {
    return findOneBy('phone', phone);
  },

  async create(input: CreateUserInput): Promise<UserRow> {
    const { data, error } = (await getSupabase()
      .from('User')
      .insert(input as never)
      .select('*')) as { data: UserRow[] | null; error: unknown };
    if (error || !data?.[0]) {
      throw error instanceof Error ? error : new Error('Failed to create user');
    }
    return data[0];
  },

  async update(id: string, patch: UpdateUserPatch): Promise<UserRow> {
    const { data, error } = (await getSupabase()
      .from('User')
      .update(patch as never)
      .eq('id', id)
      .select('*')) as { data: UserRow[] | null; error: unknown };
    if (error || !data?.[0]) {
      throw error instanceof Error ? error : new Error(`Failed to update user ${id}`);
    }
    return data[0];
  },

  async updateRole(id: string, role: UserRole): Promise<void> {
    const { error } = await getSupabase()
      .from('User')
      .update({ role } as never)
      .eq('id', id);
    if (error) throw error;
  },
};

export type UserRepositoryType = typeof UserRepository;
