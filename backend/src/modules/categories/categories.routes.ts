import { Hono } from 'hono';
import { z } from 'zod';
import type { AppEnv } from '../../env';
import { requireAuth } from '../../middleware/auth';
import { requireRole } from '../../middleware/roles';
import { parseJsonBody } from '../../lib/validate';
import { conflict } from '../../lib/http-error';
import { findAllCategories, createCategory, updateCategory, removeCategory } from './categories.service';
import { countCoursesByCategory } from '../courses/courses.service';

const categoryLabelSchema = z.object({ label: z.string().min(2) }).strict();

export const categoriesRoutes = new Hono<AppEnv>();

// Público: el catálogo sin sesión también necesita "Explora por categoría".
categoriesRoutes.get('/', async (c) => {
  return c.json(await findAllCategories(c.env));
});

categoriesRoutes.post('/', requireAuth, requireRole('ADMIN'), async (c) => {
  const dto = await parseJsonBody(c, categoryLabelSchema);
  return c.json(await createCategory(c.env, dto.label));
});

categoriesRoutes.patch('/:code', requireAuth, requireRole('ADMIN'), async (c) => {
  const dto = await parseJsonBody(c, categoryLabelSchema);
  return c.json(await updateCategory(c.env, c.req.param('code')!, dto.label));
});

categoriesRoutes.delete('/:code', requireAuth, requireRole('ADMIN'), async (c) => {
  const code = c.req.param('code')!;
  const coursesUsingIt = await countCoursesByCategory(c.env, code);
  if (coursesUsingIt > 0) {
    throw conflict(`No se puede eliminar: ${coursesUsingIt} curso(s) usan esta categoría`);
  }
  return c.json(await removeCategory(c.env, code));
});
