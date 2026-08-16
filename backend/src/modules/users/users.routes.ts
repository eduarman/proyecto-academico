import { Hono } from 'hono';
import { z } from 'zod';
import type { AppEnv } from '../../env';
import { requireAuth } from '../../middleware/auth';
import { requireRole } from '../../middleware/roles';
import { parseJsonBody } from '../../lib/validate';
import { findAllUsers, findUserById, updateUserProfile } from './users.service';

const ROLES = ['ADMIN', 'ESTUDIANTE'] as const;
const STATUSES = ['ACTIVO', 'INACTIVO'] as const;

const updateUserSchema = z
  .object({
    firstName: z.string().min(2).optional(),
    lastName: z.string().min(2).optional(),
    role: z.enum(ROLES).optional(),
    status: z.enum(STATUSES).optional(),
  })
  .strict();

export const usersRoutes = new Hono<AppEnv>();

usersRoutes.use('*', requireAuth);

usersRoutes.get('/', requireRole('ADMIN'), async (c) => {
  const role = c.req.query('role');
  const status = c.req.query('status');
  return c.json(await findAllUsers(c.env, role, status));
});

// Un usuario no puede escalar su propio rol/estado: solo firstName/lastName llegan al service.
usersRoutes.patch('/me', async (c) => {
  const user = c.get('user')!;
  const body = await parseJsonBody(c, updateUserSchema);
  return c.json(await updateUserProfile(c.env, user.id, { firstName: body.firstName, lastName: body.lastName }));
});

usersRoutes.get('/:id', requireRole('ADMIN'), async (c) => {
  return c.json(await findUserById(c.env, c.req.param('id')!));
});

usersRoutes.patch('/:id', requireRole('ADMIN'), async (c) => {
  const body = await parseJsonBody(c, updateUserSchema);
  return c.json(await updateUserProfile(c.env, c.req.param('id')!, body));
});
