import type { Bindings, RequestUser } from '../../env';
import { getSupabase } from '../../lib/supabase';
import { badRequest, notFound } from '../../lib/http-error';
import { categoryExists } from '../categories/categories.service';

export type CourseStatus = 'BORRADOR' | 'PUBLICADO' | 'ARCHIVADO';

export interface Course {
  id: string;
  title: string;
  category: string;
  status: CourseStatus;
  maxSeats: number;
  startDate: string;
  endDate: string;
}

interface CourseRow {
  id: string;
  title: string;
  category: string;
  status: CourseStatus;
  max_seats: number;
  start_date: string;
  end_date: string;
}

const COLUMNS = 'id,title,category,status,max_seats,start_date,end_date';

// BORRADOR -> PUBLICADO -> ARCHIVADO; no retrocede. Ver gestion-cursos/design.md.
const STATUS_TRANSITIONS: Record<CourseStatus, CourseStatus[]> = {
  BORRADOR: ['PUBLICADO'],
  PUBLICADO: ['ARCHIVADO'],
  ARCHIVADO: [],
};

function toCourse(row: CourseRow): Course {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    status: row.status,
    maxSeats: row.max_seats,
    startDate: row.start_date,
    endDate: row.end_date,
  };
}

// user es undefined para visitantes no autenticados (catálogo público): mismo trato que ESTUDIANTE.
export async function findAllCourses(
  env: Bindings,
  user: RequestUser | undefined,
  category?: string,
  status?: string,
): Promise<Course[]> {
  const db = getSupabase(env);
  let query = db.from('courses').select(COLUMNS);

  if (user?.role === 'ADMIN') {
    if (category) query = query.eq('category', category);
    if (status) query = query.eq('status', status);
  } else {
    query = query.eq('status', 'PUBLICADO');
    if (category) query = query.eq('category', category);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data as CourseRow[]).map(toCourse);
}

export async function findCourseById(env: Bindings, id: string): Promise<Course> {
  const db = getSupabase(env);
  const { data, error } = await db.from('courses').select(COLUMNS).eq('id', id).maybeSingle();
  if (error) throw error;
  if (!data) throw notFound('Curso no encontrado');
  return toCourse(data as CourseRow);
}

export async function countCoursesByCategory(env: Bindings, category: string): Promise<number> {
  const db = getSupabase(env);
  const { count, error } = await db
    .from('courses')
    .select('id', { count: 'exact', head: true })
    .eq('category', category);
  if (error) throw error;
  return count ?? 0;
}

export interface CreateCourseInput {
  title: string;
  category: string;
  maxSeats: number;
  startDate: string;
  endDate: string;
}

export async function createCourse(env: Bindings, payload: CreateCourseInput): Promise<Course> {
  await assertValidCategory(env, payload.category);
  assertValidDateRange(payload.startDate, payload.endDate);

  const db = getSupabase(env);
  const { data, error } = await db
    .from('courses')
    .insert({
      title: payload.title,
      category: payload.category,
      status: 'BORRADOR',
      max_seats: payload.maxSeats,
      start_date: payload.startDate,
      end_date: payload.endDate,
    })
    .select(COLUMNS)
    .single();
  if (error) throw error;
  return toCourse(data as CourseRow);
}

export interface UpdateCourseInput {
  title?: string;
  category?: string;
  status?: CourseStatus;
  maxSeats?: number;
  startDate?: string;
  endDate?: string;
}

export async function updateCourse(env: Bindings, id: string, payload: UpdateCourseInput): Promise<Course> {
  const course = await findCourseById(env, id);

  if (payload.status && payload.status !== course.status) {
    if (!STATUS_TRANSITIONS[course.status].includes(payload.status)) {
      throw badRequest(`Transición ${course.status} → ${payload.status} no permitida`);
    }
  }

  if (payload.category) {
    await assertValidCategory(env, payload.category);
  }

  assertValidDateRange(payload.startDate ?? course.startDate, payload.endDate ?? course.endDate);

  const update: Record<string, unknown> = {};
  if (payload.title !== undefined) update.title = payload.title;
  if (payload.category !== undefined) update.category = payload.category;
  if (payload.status !== undefined) update.status = payload.status;
  if (payload.maxSeats !== undefined) update.max_seats = payload.maxSeats;
  if (payload.startDate !== undefined) update.start_date = payload.startDate;
  if (payload.endDate !== undefined) update.end_date = payload.endDate;

  const db = getSupabase(env);
  const { data, error } = await db.from('courses').update(update).eq('id', id).select(COLUMNS).single();
  if (error) throw error;
  return toCourse(data as CourseRow);
}

export async function removeCourse(env: Bindings, id: string): Promise<Course> {
  const db = getSupabase(env);
  const { data, error } = await db.from('courses').delete().eq('id', id).select(COLUMNS).maybeSingle();
  if (error) throw error;
  if (!data) throw notFound('Curso no encontrado');
  return toCourse(data as CourseRow);
}

function assertValidDateRange(startDate: string, endDate: string) {
  if (new Date(startDate) >= new Date(endDate)) {
    throw badRequest('La fecha de inicio debe ser anterior a la fecha de fin');
  }
}

async function assertValidCategory(env: Bindings, category: string) {
  if (!(await categoryExists(env, category))) {
    throw badRequest(`La categoría "${category}" no existe`);
  }
}
