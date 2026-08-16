import type { Context } from 'hono';
import { setCookie, deleteCookie, getCookie } from 'hono/cookie';
import type { AppEnv } from '../env';

const COOKIE_NAME = 'refresh_token';
const COOKIE_PATH = '/api/auth/refresh';
const MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

// SameSite=None es obligatorio porque frontend y backend viven en dominios
// distintos (*.pages.dev/dominio propio vs *.workers.dev del Worker). None
// exige Secure=true, que Cloudflare cumple siempre en producción.
export function setRefreshCookie(c: Context<AppEnv>, token: string) {
  setCookie(c, COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'None',
    secure: true,
    path: COOKIE_PATH,
    maxAge: MAX_AGE_SECONDS,
  });
}

export function clearRefreshCookie(c: Context<AppEnv>) {
  deleteCookie(c, COOKIE_NAME, { path: COOKIE_PATH, secure: true, sameSite: 'None' });
}

export function getRefreshCookie(c: Context<AppEnv>): string | undefined {
  return getCookie(c, COOKIE_NAME);
}
