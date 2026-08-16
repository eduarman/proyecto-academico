import { Hono } from 'hono';
import { z } from 'zod';
import type { AppEnv } from '../../env';
import { optionalAuth, requireAuth } from '../../middleware/auth';
import { requireRole } from '../../middleware/roles';
import { parseJsonBody } from '../../lib/validate';
import { conflict } from '../../lib/http-error';
import { findAllCourses, findCourseById, createCourse, updateCourse, removeCourse } from './courses.service';
import { listEnrollmentsByCourse } from '../enrollments/enrollments.service';

const STATUSES = ['BORRADOR', 'PUBLICADO', 'ARCHIVADO'] as const;

const createCourseSchema = z
  .object({
    title: z.string().min(3),
    category: z.string().min(1),
    maxSeats: z.number().int().min(1),
    startDate: z.string(),
    endDate: z.string(),
  })
  .strict();

const updateCourseSchema = z
  .object({
    title: z.string().min(3).optional(),
    category: z.string().min(1).optional(),
    status: z.enum(STATUSES).optional(),
    maxSeats: z.number().int().min(1).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  })
  .strict();

export const coursesRoutes = new Hono<AppEnv>();

// Público: cualquiera ve el catálogo (solo cursos PUBLICADO); si hay sesión de
// ADMIN válida, ve todos + filtro por estado.
coursesRoutes.get('/', optionalAuth, async (c) => {
  const category = c.req.query('category');
  const status = c.req.query('status');
  return c.json(await findAllCourses(c.env, c.get('user'), category, status));
});

coursesRoutes.get('/:id', optionalAuth, async (c) => {
  return c.json(await findCourseById(c.env, c.req.param('id')!));
});

coursesRoutes.post('/', requireAuth, requireRole('ADMIN'), async (c) => {
  const dto = await parseJsonBody(c, createCourseSchema);
  return c.json(await createCourse(c.env, dto));
});

coursesRoutes.patch('/:id', requireAuth, requireRole('ADMIN'), async (c) => {
  const dto = await parseJsonBody(c, updateCourseSchema);
  return c.json(await updateCourse(c.env, c.req.param('id')!, dto));
});

coursesRoutes.delete('/:id', requireAuth, requireRole('ADMIN'), async (c) => {
  const id = c.req.param('id')!;
  const enrollments = await listEnrollmentsByCourse(c.env, id);
  const hasActiveEnrollments = enrollments.some((entry) => entry.status === 'ACTIVA');
  if (hasActiveEnrollments) {
    throw conflict('No se puede eliminar un curso con inscripciones activas; archívalo en su lugar');
  }
  return c.json(await removeCourse(c.env, id));
});
