import { Hono } from 'hono';
import type { AppEnv } from '../../env';
import { requireAuth } from '../../middleware/auth';
import { parseJsonBody } from '../../lib/validate';
import { setRefreshCookie, clearRefreshCookie, getRefreshCookie } from '../../lib/cookies';
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from './auth.schemas';
import * as authService from './auth.service';

export const authRoutes = new Hono<AppEnv>();

authRoutes.post('/register', async (c) => {
  const dto = await parseJsonBody(c, registerSchema);
  return c.json(await authService.register(c.env, dto));
});

authRoutes.post('/login', async (c) => {
  const dto = await parseJsonBody(c, loginSchema);
  const result = await authService.login(c.env, dto);
  setRefreshCookie(c, result.refreshToken);
  return c.json({ accessToken: result.accessToken, user: result.user });
});

authRoutes.post('/refresh', async (c) => {
  const result = await authService.refresh(c.env, getRefreshCookie(c));
  setRefreshCookie(c, result.refreshToken);
  return c.json({ accessToken: result.accessToken, user: result.user });
});

authRoutes.post('/logout', async (c) => {
  await authService.logout(c.env, getRefreshCookie(c));
  clearRefreshCookie(c);
  return c.json({ message: 'Sesión cerrada' });
});

authRoutes.get('/me', requireAuth, async (c) => {
  return c.json(c.get('user'));
});

authRoutes.post('/forgot-password', async (c) => {
  const dto = await parseJsonBody(c, forgotPasswordSchema);
  return c.json(await authService.forgotPassword(c.env, dto.email));
});

authRoutes.post('/reset-password', async (c) => {
  const dto = await parseJsonBody(c, resetPasswordSchema);
  return c.json(await authService.resetPassword(c.env, dto));
});

authRoutes.patch('/password', requireAuth, async (c) => {
  const user = c.get('user')!;
  const dto = await parseJsonBody(c, changePasswordSchema);
  return c.json(await authService.changePassword(c.env, user.id, dto));
});
