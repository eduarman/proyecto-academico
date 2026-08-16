import { Hono } from 'hono';
import { z } from 'zod';
import type { AppEnv, Bindings, RequestUser } from '../../env';
import { requireAuth } from '../../middleware/auth';
import { requireRole } from '../../middleware/roles';
import { parseJsonBody } from '../../lib/validate';
import { badRequest, forbidden } from '../../lib/http-error';
import {
  findContentByCourse,
  createCourseModule,
  removeModuleWithLessons,
  findLesson,
  createLesson,
  removeLessonRecord,
  buildLessonFileKey,
  assertValidUpload,
  type LessonType,
} from './content.service';
import { uploadLessonFile, deleteLessonFile, getLessonFileSignedUrl } from './storage';
import { hasContentAccess } from '../enrollments/enrollments.service';

// Límite del plan free de Supabase Storage (50MB por objeto, configurable en
// Settings -> Storage en planes pagos). El original en disco permitía 300MB.
const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;
const LESSON_TYPES: LessonType[] = ['PDF', 'VIDEO'];

const createModuleSchema = z.object({ title: z.string().min(2) }).strict();

async function assertCanView(env: Bindings, user: RequestUser, courseId: string) {
  if (user.role === 'ADMIN') return;
  if (!(await hasContentAccess(env, user.id, courseId))) {
    throw forbidden('Debes tener una inscripción activa o completada para ver este contenido');
  }
}

export const contentRoutes = new Hono<AppEnv>();

contentRoutes.use('*', requireAuth);

contentRoutes.get('/courses/:courseId/content', async (c) => {
  const user = c.get('user')!;
  const courseId = c.req.param('courseId')!;
  await assertCanView(c.env, user, courseId);
  return c.json(await findContentByCourse(c.env, courseId));
});

contentRoutes.post('/courses/:courseId/modules', requireRole('ADMIN'), async (c) => {
  const dto = await parseJsonBody(c, createModuleSchema);
  return c.json(await createCourseModule(c.env, c.req.param('courseId')!, dto.title));
});

contentRoutes.delete('/modules/:id', requireRole('ADMIN'), async (c) => {
  const { module, removedLessons } = await removeModuleWithLessons(c.env, c.req.param('id')!);
  await Promise.all(removedLessons.map((lesson) => deleteLessonFile(c.env, lesson.fileKey)));
  return c.json(module);
});

contentRoutes.post('/modules/:moduleId/lessons', requireRole('ADMIN'), async (c) => {
  const body = await c.req.parseBody();
  const title = typeof body.title === 'string' ? body.title : '';
  const type = typeof body.type === 'string' ? body.type : '';
  const file = body.file;

  if (title.trim().length < 2) throw badRequest('El título debe tener al menos 2 caracteres');
  if (!LESSON_TYPES.includes(type as LessonType)) throw badRequest('Tipo de lección inválido');

  const uploadedFile = file instanceof File ? file : undefined;
  assertValidUpload(uploadedFile);
  if (uploadedFile.size > MAX_UPLOAD_BYTES) {
    throw badRequest('El archivo supera el tamaño máximo permitido (300MB)');
  }

  const fileKey = buildLessonFileKey(uploadedFile.name);
  await uploadLessonFile(c.env, fileKey, uploadedFile);

  const lesson = await createLesson(c.env, {
    moduleId: c.req.param('moduleId')!,
    title,
    type: type as LessonType,
    fileKey,
    originalName: uploadedFile.name,
    mimeType: uploadedFile.type,
  });
  const { fileKey: _omit, ...rest } = lesson;
  return c.json(rest);
});

contentRoutes.delete('/lessons/:id', requireRole('ADMIN'), async (c) => {
  const lesson = await removeLessonRecord(c.env, c.req.param('id')!);
  await deleteLessonFile(c.env, lesson.fileKey);
  const { fileKey, ...rest } = lesson;
  return c.json(rest);
});

// Redirige a una signed URL de Supabase Storage de corta duración (60s) en vez de
// proxyear los bytes por el Worker: más simple y evita límites de tamaño de respuesta
// del Worker con videos grandes. El check de acceso ocurre acá, antes de firmar la URL.
contentRoutes.get('/lessons/:id/file', async (c) => {
  const user = c.get('user')!;
  const lesson = await findLesson(c.env, c.req.param('id')!);
  await assertCanView(c.env, user, lesson.courseId);

  const signedUrl = await getLessonFileSignedUrl(c.env, lesson.fileKey);
  return c.redirect(signedUrl, 302);
});
