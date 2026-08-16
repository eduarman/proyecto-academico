import { Hono } from 'hono';
import type { AppEnv } from './env';
import { corsMiddleware } from './middleware/cors';
import { HttpError } from './lib/http-error';
import { authRoutes } from './modules/auth/auth.routes';
import { usersRoutes } from './modules/users/users.routes';
import { categoriesRoutes } from './modules/categories/categories.routes';
import { coursesRoutes } from './modules/courses/courses.routes';
import { enrollmentsRoutes } from './modules/enrollments/enrollments.routes';
import { contentRoutes } from './modules/content/content.routes';

const app = new Hono<AppEnv>();

app.use('/api/*', corsMiddleware);

app.onError((err, c) => {
  if (err instanceof HttpError) {
    return c.json(err.toJSON(), err.status as 400 | 401 | 403 | 404 | 409);
  }
  console.error(err);
  return c.json({ statusCode: 500, message: 'Error interno del servidor', error: 'Internal Server Error' }, 500);
});

const api = new Hono<AppEnv>();
api.route('/auth', authRoutes);
api.route('/users', usersRoutes);
api.route('/categories', categoriesRoutes);
api.route('/courses', coursesRoutes);
api.route('/', enrollmentsRoutes);
api.route('/', contentRoutes);

app.route('/api', api);

export default app;
