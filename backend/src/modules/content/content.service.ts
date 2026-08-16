import type { Bindings } from '../../env';
import { getSupabase } from '../../lib/supabase';
import { badRequest, notFound } from '../../lib/http-error';
import { findCourseById } from '../courses/courses.service';

export type LessonType = 'PDF' | 'VIDEO';

export interface CourseModuleRecord {
  id: string;
  courseId: string;
  title: string;
  createdAt: string;
}

export interface LessonRecord {
  id: string;
  moduleId: string;
  courseId: string;
  title: string;
  type: LessonType;
  fileKey: string;
  originalName: string;
  mimeType: string;
  createdAt: string;
}

interface ModuleRow {
  id: string;
  course_id: string;
  title: string;
  created_at: string;
}

interface LessonRow {
  id: string;
  module_id: string;
  course_id: string;
  title: string;
  type: LessonType;
  file_key: string;
  original_name: string;
  mime_type: string;
  created_at: string;
}

const MODULE_COLUMNS = 'id,course_id,title,created_at';
const LESSON_COLUMNS = 'id,module_id,course_id,title,type,file_key,original_name,mime_type,created_at';

function toModule(row: ModuleRow): CourseModuleRecord {
  return { id: row.id, courseId: row.course_id, title: row.title, createdAt: row.created_at };
}

function toLesson(row: LessonRow): LessonRecord {
  return {
    id: row.id,
    moduleId: row.module_id,
    courseId: row.course_id,
    title: row.title,
    type: row.type,
    fileKey: row.file_key,
    originalName: row.original_name,
    mimeType: row.mime_type,
    createdAt: row.created_at,
  };
}

export async function findContentByCourse(env: Bindings, courseId: string) {
  await findCourseById(env, courseId);

  const db = getSupabase(env);
  const { data: moduleRows, error: moduleError } = await db
    .from('course_modules')
    .select(MODULE_COLUMNS)
    .eq('course_id', courseId)
    .order('created_at');
  if (moduleError) throw moduleError;

  const { data: lessonRows, error: lessonError } = await db
    .from('lessons')
    .select(LESSON_COLUMNS)
    .eq('course_id', courseId)
    .order('created_at');
  if (lessonError) throw lessonError;

  const lessons = (lessonRows as LessonRow[]).map(toLesson);

  return (moduleRows as ModuleRow[]).map((moduleRow) => {
    const module = toModule(moduleRow);
    return {
      ...module,
      lessons: lessons
        .filter((lesson) => lesson.moduleId === module.id)
        .map(({ fileKey, ...rest }) => rest),
    };
  });
}

export async function createCourseModule(env: Bindings, courseId: string, title: string): Promise<CourseModuleRecord> {
  await findCourseById(env, courseId);

  const db = getSupabase(env);
  const { data, error } = await db
    .from('course_modules')
    .insert({ course_id: courseId, title: title.trim() })
    .select(MODULE_COLUMNS)
    .single();
  if (error) throw error;
  return toModule(data as ModuleRow);
}

export async function findModule(env: Bindings, id: string): Promise<CourseModuleRecord> {
  const db = getSupabase(env);
  const { data, error } = await db.from('course_modules').select(MODULE_COLUMNS).eq('id', id).maybeSingle();
  if (error) throw error;
  if (!data) throw notFound('Módulo no encontrado');
  return toModule(data as ModuleRow);
}

// Devuelve las lecciones eliminadas (con fileKey) para que el caller borre los objetos R2.
export async function removeModuleWithLessons(
  env: Bindings,
  id: string,
): Promise<{ module: CourseModuleRecord; removedLessons: LessonRecord[] }> {
  const module = await findModule(env, id);

  const db = getSupabase(env);
  const { data: lessonRows, error: lessonError } = await db
    .from('lessons')
    .select(LESSON_COLUMNS)
    .eq('module_id', id);
  if (lessonError) throw lessonError;

  const { error: deleteError } = await db.from('course_modules').delete().eq('id', id);
  if (deleteError) throw deleteError;

  return { module, removedLessons: (lessonRows as LessonRow[]).map(toLesson) };
}

export async function findLesson(env: Bindings, id: string): Promise<LessonRecord> {
  const db = getSupabase(env);
  const { data, error } = await db.from('lessons').select(LESSON_COLUMNS).eq('id', id).maybeSingle();
  if (error) throw error;
  if (!data) throw notFound('Lección no encontrada');
  return toLesson(data as LessonRow);
}

export interface CreateLessonInput {
  moduleId: string;
  title: string;
  type: LessonType;
  fileKey: string;
  originalName: string;
  mimeType: string;
}

export async function createLesson(env: Bindings, input: CreateLessonInput): Promise<LessonRecord> {
  const module = await findModule(env, input.moduleId);

  const db = getSupabase(env);
  const { data, error } = await db
    .from('lessons')
    .insert({
      module_id: module.id,
      course_id: module.courseId,
      title: input.title.trim(),
      type: input.type,
      file_key: input.fileKey,
      original_name: input.originalName,
      mime_type: input.mimeType,
    })
    .select(LESSON_COLUMNS)
    .single();
  if (error) throw error;
  return toLesson(data as LessonRow);
}

export async function removeLessonRecord(env: Bindings, id: string): Promise<LessonRecord> {
  const lesson = await findLesson(env, id);
  const db = getSupabase(env);
  const { error } = await db.from('lessons').delete().eq('id', id);
  if (error) throw error;
  return lesson;
}

export function buildLessonFileKey(originalName: string): string {
  const dotIndex = originalName.lastIndexOf('.');
  const ext = dotIndex >= 0 ? originalName.slice(dotIndex) : '';
  return `lessons/${crypto.randomUUID()}${ext}`;
}

export function assertValidUpload(file: File | undefined): asserts file is File {
  if (!file) throw badRequest('El archivo es obligatorio');
  const isPdf = file.type === 'application/pdf';
  const isVideo = file.type.startsWith('video/');
  if (!isPdf && !isVideo) throw badRequest('Tipo de archivo no permitido (solo PDF o video)');
}
