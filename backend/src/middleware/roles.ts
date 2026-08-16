import type { Context, Next } from 'hono';
import type { AppEnv, RequestUser } from '../env';
import { forbidden } from '../lib/http-error';

// Equivalente a RolesGuard + @Roles(...). Debe ir después de requireAuth.
export function requireRole(...roles: RequestUser['role'][]) {
  return async (c: Context<AppEnv>, next: Next) => {
    const user = c.get('user');
    if (!user || !roles.includes(user.role)) {
      throw forbidden('No tienes permisos para esta acción');
    }
    await next();
  };
}
