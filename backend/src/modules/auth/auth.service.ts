import type { Bindings } from '../../env';
import { getSupabase } from '../../lib/supabase';
import { hashPassword, comparePassword } from '../../lib/password';
import { signAccessToken } from '../../lib/jwt';
import { badRequest, unauthorized } from '../../lib/http-error';
import {
  createUser,
  findUserRowByEmail,
  tryFindUserById,
  updatePasswordHashByEmail,
  type AppUser,
} from '../users/users.service';

const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const RESET_TTL_MS = 30 * 60 * 1000;
const GENERIC_FORGOT_MESSAGE = 'Si el email existe, revisa tu bandeja de entrada.';

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export async function register(env: Bindings, dto: RegisterInput): Promise<AppUser> {
  const passwordHash = await hashPassword(dto.password);
  return createUser(env, {
    email: dto.email,
    passwordHash,
    firstName: dto.firstName,
    lastName: dto.lastName,
    role: 'ESTUDIANTE',
  });
}

interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: AppUser;
}

export async function login(env: Bindings, dto: { email: string; password: string }): Promise<LoginResult> {
  const row = await findUserRowByEmail(env, dto.email);
  if (!row) throw unauthorized('Credenciales inválidas');

  const valid = await comparePassword(dto.password, row.password_hash);
  if (!valid) throw unauthorized('Credenciales inválidas');

  if (row.status !== 'ACTIVO') throw unauthorized('Usuario inactivo');

  const user: AppUser = {
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    role: row.role,
    status: row.status,
  };

  const accessToken = await signAccessToken(env.JWT_SECRET, { id: user.id, email: user.email, role: user.role });
  const refreshToken = await createRefreshToken(env, user.id);
  return { accessToken, refreshToken, user };
}

async function createRefreshToken(env: Bindings, userId: string): Promise<string> {
  const db = getSupabase(env);
  const expiresAt = new Date(Date.now() + REFRESH_TTL_MS).toISOString();
  const { data, error } = await db
    .from('refresh_tokens')
    .insert({ user_id: userId, expires_at: expiresAt })
    .select('token')
    .single();
  if (error) throw error;
  return data.token as string;
}

export async function refresh(env: Bindings, refreshToken: string | undefined): Promise<LoginResult> {
  if (!refreshToken) throw unauthorized('Token de refresh no válido');

  const db = getSupabase(env);
  const { data: tokenRow, error } = await db
    .from('refresh_tokens')
    .select('user_id, expires_at')
    .eq('token', refreshToken)
    .maybeSingle();
  if (error) throw error;

  if (!tokenRow || new Date(tokenRow.expires_at).getTime() < Date.now()) {
    await db.from('refresh_tokens').delete().eq('token', refreshToken);
    throw unauthorized('Refresh token inválido');
  }

  const user = await tryFindUserById(env, tokenRow.user_id);
  if (!user || user.status !== 'ACTIVO') throw unauthorized('Usuario no autorizado');

  await db.from('refresh_tokens').delete().eq('token', refreshToken);
  const newRefreshToken = await createRefreshToken(env, user.id);
  const accessToken = await signAccessToken(env.JWT_SECRET, { id: user.id, email: user.email, role: user.role });

  return { accessToken, refreshToken: newRefreshToken, user };
}

export async function logout(env: Bindings, refreshToken: string | undefined): Promise<void> {
  if (!refreshToken) return;
  const db = getSupabase(env);
  await db.from('refresh_tokens').delete().eq('token', refreshToken);
}

export async function forgotPassword(env: Bindings, email: string): Promise<{ message: string; token?: string }> {
  const row = await findUserRowByEmail(env, email);
  if (!row) return { message: GENERIC_FORGOT_MESSAGE };

  const db = getSupabase(env);
  const expiresAt = new Date(Date.now() + RESET_TTL_MS).toISOString();
  const { data, error } = await db
    .from('password_reset_tokens')
    .insert({ user_id: row.id, expires_at: expiresAt })
    .select('token')
    .single();
  if (error) throw error;

  return { message: GENERIC_FORGOT_MESSAGE, token: data.token as string };
}

export async function resetPassword(env: Bindings, dto: { token: string; password: string }): Promise<{ message: string }> {
  const db = getSupabase(env);
  const { data: tokenRow, error } = await db
    .from('password_reset_tokens')
    .select('user_id, expires_at, used')
    .eq('token', dto.token)
    .maybeSingle();
  if (error) throw error;

  if (!tokenRow || tokenRow.used || new Date(tokenRow.expires_at).getTime() < Date.now()) {
    throw badRequest('Token de restablecimiento inválido o vencido');
  }

  const user = await tryFindUserById(env, tokenRow.user_id);
  if (!user) throw badRequest('Usuario no encontrado');

  const passwordHash = await hashPassword(dto.password);
  await updatePasswordHashByEmail(env, user.email, passwordHash);
  await db.from('password_reset_tokens').update({ used: true }).eq('token', dto.token);

  return { message: 'Contraseña actualizada con éxito' };
}

export async function changePassword(
  env: Bindings,
  userId: string,
  dto: { currentPassword: string; newPassword: string },
): Promise<{ message: string }> {
  const user = await tryFindUserById(env, userId);
  if (!user) throw unauthorized('La contraseña actual no es correcta');

  const row = await findUserRowByEmail(env, user.email);
  const valid = row && (await comparePassword(dto.currentPassword, row.password_hash));
  if (!valid) throw unauthorized('La contraseña actual no es correcta');

  const newHash = await hashPassword(dto.newPassword);
  await updatePasswordHashByEmail(env, user.email, newHash);

  return { message: 'Contraseña actualizada con éxito' };
}
