import type { Context, Next } from 'hono';
import type { AppEnv } from '../env';
import { verifyAccessToken } from '../lib/jwt';
import { unauthorized } from '../lib/http-error';

function extractBearerToken(c: Context<AppEnv>): string | undefined {
  const header = c.req.header('Authorization');
  return header?.startsWith('Bearer ') ? header.slice(7) : undefined;
}

// Equivalente a AuthGuard('jwt'): exige un access token válido.
export async function requireAuth(c: Context<AppEnv>, next: Next) {
  const token = extractBearerToken(c);
  if (!token) throw unauthorized('Token inválido');
  try {
    c.set('user', await verifyAccessToken(c.env.JWT_SECRET, token));
  } catch {
    throw unauthorized('Token inválido');
  }
  await next();
}

// Equivalente a OptionalJwtAuthGuard: nunca rechaza, solo adjunta el usuario si hay token válido.
export async function optionalAuth(c: Context<AppEnv>, next: Next) {
  const token = extractBearerToken(c);
  if (token) {
    try {
      c.set('user', await verifyAccessToken(c.env.JWT_SECRET, token));
    } catch {
      // sin sesión válida, sigue como visitante anónimo
    }
  }
  await next();
}
