import { cors } from 'hono/cors';
import type { Context } from 'hono';
import type { AppEnv } from '../env';

// Refleja el Origin del request solo si coincide con FRONTEND_ORIGIN (o localhost en dev),
// igual de permisivo que el `origin: true` de Nest pero explícito en vez de aceptar cualquiera.
export const corsMiddleware = cors({
  origin: (origin: string, c: Context<AppEnv>) => {
    const allowed = [c.env.FRONTEND_ORIGIN, 'http://localhost:5173'];
    return allowed.includes(origin) ? origin : '';
  },
  credentials: true,
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
});
