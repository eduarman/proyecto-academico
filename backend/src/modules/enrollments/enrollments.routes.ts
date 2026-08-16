import { Hono } from 'hono';
import { z } from 'zod';
import type { AppEnv } from '../../env';
import { requireAuth } from '../../middleware/auth';
import { requireRole } from '../../middleware/roles';
import { parseJsonBody } from '../../lib/validate';
import { createEnrollment, listEnrollmentsByCourse, getMyEnrollments, changeEnrollmentStatus } from './enrollments.service';

const NEXT_STATUSES = ['ACTIVA', 'COMPLETADA', 'CANCELADA'] as const;
const updateStatusSchema = z.object({ status: z.enum(NEXT_STATUSES) }).strict();

export const enrollmentsRoutes = new Hono<AppEnv>();

enrollmentsRoutes.use('*', requireAuth);

enrollmentsRoutes.post('/courses/:courseId/enrollments', requireRole('ESTUDIANTE'), async (c) => {
  const user = c.get('user')!;
  return c.json(await createEnrollment(c.env, user.id, c.req.param('courseId')!));
});

enrollmentsRoutes.get('/courses/:courseId/enrollments', requireRole('ADMIN'), async (c) => {
  return c.json(await listEnrollmentsByCourse(c.env, c.req.param('courseId')!));
});

enrollmentsRoutes.get('/enrollments/me', async (c) => {
  const user = c.get('user')!;
  return c.json(await getMyEnrollments(c.env, user.id));
});

enrollmentsRoutes.patch('/enrollments/:id/estado', async (c) => {
  const user = c.get('user')!;
  const dto = await parseJsonBody(c, updateStatusSchema);
  return c.json(await changeEnrollmentStatus(c.env, user, c.req.param('id')!, dto.status));
});
