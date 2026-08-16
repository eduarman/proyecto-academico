import type { Bindings, RequestUser } from '../../env';
import { getSupabase } from '../../lib/supabase';
import { conflict, notFound } from '../../lib/http-error';

export type UserRole = RequestUser['role'];
export type UserStatus = 'ACTIVO' | 'INACTIVO';

export interface AppUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
}

interface UserRow {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  status: UserStatus;
}

const PUBLIC_COLUMNS = 'id,email,first_name,last_name,role,status';

function toAppUser(row: UserRow): AppUser {
  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    role: row.role,
    status: row.status,
  };
}

export async function findAllUsers(env: Bindings, role?: string, status?: string): Promise<AppUser[]> {
  const db = getSupabase(env);
  let query = db.from('users').select(PUBLIC_COLUMNS);
  if (role) query = query.eq('role', role);
  if (status) query = query.eq('status', status);
  const { data, error } = await query;
  if (error) throw error;
  return (data as UserRow[]).map(toAppUser);
}

export async function findUserById(env: Bindings, id: string): Promise<AppUser> {
  const user = await tryFindUserById(env, id);
  if (!user) throw notFound('Usuario no encontrado');
  return user;
}

export async function tryFindUserById(env: Bindings, id: string): Promise<AppUser | undefined> {
  const db = getSupabase(env);
  const { data, error } = await db.from('users').select(PUBLIC_COLUMNS).eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? toAppUser(data as UserRow) : undefined;
}

// Incluye password_hash: uso interno del módulo auth únicamente.
export async function findUserRowByEmail(
  env: Bindings,
  email: string,
): Promise<(UserRow & { password_hash: string }) | undefined> {
  const db = getSupabase(env);
  const { data, error } = await db
    .from('users')
    .select(`${PUBLIC_COLUMNS},password_hash`)
    .eq('email', email)
    .maybeSingle();
  if (error) throw error;
  return (data as (UserRow & { password_hash: string }) | null) ?? undefined;
}

export interface CreateUserInput {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
}

export async function createUser(env: Bindings, input: CreateUserInput): Promise<AppUser> {
  const db = getSupabase(env);
  const { data, error } = await db
    .from('users')
    .insert({
      email: input.email,
      password_hash: input.passwordHash,
      first_name: input.firstName,
      last_name: input.lastName,
      role: input.role ?? 'ESTUDIANTE',
    })
    .select(PUBLIC_COLUMNS)
    .single();

  if (error) {
    if (error.code === '23505') throw conflict('El email ya está registrado');
    throw error;
  }
  return toAppUser(data as UserRow);
}

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  status?: UserStatus;
}

export async function updateUserProfile(env: Bindings, id: string, payload: UpdateProfileInput): Promise<AppUser> {
  await findUserById(env, id);

  const update: Record<string, unknown> = {};
  if (payload.firstName !== undefined) update.first_name = payload.firstName;
  if (payload.lastName !== undefined) update.last_name = payload.lastName;
  if (payload.role !== undefined) update.role = payload.role;
  if (payload.status !== undefined) update.status = payload.status;

  const db = getSupabase(env);
  const { data, error } = await db.from('users').update(update).eq('id', id).select(PUBLIC_COLUMNS).single();
  if (error) throw error;
  return toAppUser(data as UserRow);
}

export async function updatePasswordHashByEmail(env: Bindings, email: string, passwordHash: string): Promise<void> {
  const db = getSupabase(env);
  const { error } = await db.from('users').update({ password_hash: passwordHash }).eq('email', email);
  if (error) throw error;
}
