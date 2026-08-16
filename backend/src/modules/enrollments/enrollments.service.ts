import type { Bindings, RequestUser } from '../../env';
import { getSupabase } from '../../lib/supabase';
import { badRequest, conflict, forbidden, notFound } from '../../lib/http-error';
import { findCourseById } from '../courses/courses.service';

export type EnrollmentStatus = 'PENDIENTE' | 'ACTIVA' | 'COMPLETADA' | 'CANCELADA';

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  status: EnrollmentStatus;
  createdAt: string;
  completedAt: string | null;
}

interface EnrollmentRow {
  id: string;
  user_id: string;
  course_id: string;
  status: EnrollmentStatus;
  created_at: string;
  completed_at: string | null;
}

const COLUMNS = 'id,user_id,course_id,status,created_at,completed_at';

// PENDIENTE -> ACTIVA (aprobar) -> COMPLETADA; PENDIENTE|ACTIVA -> CANCELADA. Ver gestion-inscripciones/design.md.
const TRANSITIONS: Record<EnrollmentStatus, EnrollmentStatus[]> = {
  PENDIENTE: ['ACTIVA', 'CANCELADA'],
  ACTIVA: ['COMPLETADA', 'CANCELADA'],
  COMPLETADA: [],
  CANCELADA: [],
};

const RESERVING_STATUSES: EnrollmentStatus[] = ['PENDIENTE', 'ACTIVA'];

function toEnrollment(row: EnrollmentRow): Enrollment {
  return {
    id: row.id,
    userId: row.user_id,
    courseId: row.course_id,
    status: row.status,
    createdAt: row.created_at,
    completedAt: row.completed_at,
  };
}

export async function getMyEnrollments(env: Bindings, userId: string): Promise<Enrollment[]> {
  const db = getSupabase(env);
  const { data, error } = await db.from('enrollments').select(COLUMNS).eq('user_id', userId);
  if (error) throw error;
  return (data as EnrollmentRow[]).map(toEnrollment);
}

export async function listEnrollmentsByCourse(env: Bindings, courseId: string): Promise<Enrollment[]> {
  const db = getSupabase(env);
  const { data, error } = await db.from('enrollments').select(COLUMNS).eq('course_id', courseId);
  if (error) throw error;
  return (data as EnrollmentRow[]).map(toEnrollment);
}

// Da acceso al contenido: ACTIVA (cursando) o COMPLETADA (ya cursó, conserva acceso para repasar material).
export async function hasContentAccess(env: Bindings, userId: string, courseId: string): Promise<boolean> {
  const db = getSupabase(env);
  const { data, error } = await db
    .from('enrollments')
    .select('id')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .in('status', ['ACTIVA', 'COMPLETADA'])
    .maybeSingle();
  if (error) throw error;
  return !!data;
}

export async function createEnrollment(env: Bindings, userId: string, courseId: string): Promise<Enrollment> {
  const course = await findCourseById(env, courseId);
  if (course.status !== 'PUBLICADO') {
    throw badRequest('El curso no está disponible para inscripción');
  }

  const db = getSupabase(env);

  const { data: existing, error: existingError } = await db
    .from('enrollments')
    .select('id')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .in('status', RESERVING_STATUSES)
    .maybeSingle();
  if (existingError) throw existingError;
  if (existing) throw conflict('Ya existe una inscripción activa para este curso');

  const { count, error: countError } = await db
    .from('enrollments')
    .select('id', { count: 'exact', head: true })
    .eq('course_id', courseId)
    .in('status', RESERVING_STATUSES);
  if (countError) throw countError;
  if ((count ?? 0) >= course.maxSeats) {
    throw conflict('El curso no tiene cupos disponibles');
  }

  const { data, error } = await db
    .from('enrollments')
    .insert({ user_id: userId, course_id: courseId, status: 'PENDIENTE' })
    .select(COLUMNS)
    .single();
  if (error) throw error;
  return toEnrollment(data as EnrollmentRow);
}

export async function changeEnrollmentStatus(
  env: Bindings,
  user: RequestUser,
  id: string,
  newStatus: EnrollmentStatus,
): Promise<Enrollment> {
  const db = getSupabase(env);
  const { data: row, error } = await db.from('enrollments').select(COLUMNS).eq('id', id).maybeSingle();
  if (error) throw error;
  if (!row) throw notFound('Inscripción no encontrada');
  const enrollment = toEnrollment(row as EnrollmentRow);

  const isOwner = enrollment.userId === user.id;
  if (user.role !== 'ADMIN' && !isOwner) {
    throw forbidden('No tienes permisos para esta inscripción');
  }

  // Solo el admin gestiona el flujo completo; el estudiante únicamente puede cancelar su propia solicitud PENDIENTE.
  const isStudentSelfCancel = isOwner && enrollment.status === 'PENDIENTE' && newStatus === 'CANCELADA';
  if (user.role !== 'ADMIN' && !isStudentSelfCancel) {
    throw forbidden('Solo el administrador puede realizar esta transición');
  }

  if (!TRANSITIONS[enrollment.status].includes(newStatus)) {
    throw badRequest(`Transición ${enrollment.status} → ${newStatus} no permitida`);
  }

  if (newStatus === 'ACTIVA') {
    const course = await findCourseById(env, enrollment.courseId);
    const { count, error: countError } = await db
      .from('enrollments')
      .select('id', { count: 'exact', head: true })
      .eq('course_id', enrollment.courseId)
      .neq('id', enrollment.id)
      .eq('status', 'ACTIVA');
    if (countError) throw countError;
    if ((count ?? 0) >= course.maxSeats) {
      throw conflict('El curso ya no tiene cupos disponibles');
    }
  }

  const update: Record<string, unknown> = { status: newStatus };
  if (newStatus === 'COMPLETADA') {
    update.completed_at = new Date().toISOString();
  }

  const { data: updated, error: updateError } = await db
    .from('enrollments')
    .update(update)
    .eq('id', id)
    .select(COLUMNS)
    .single();
  if (updateError) throw updateError;
  return toEnrollment(updated as EnrollmentRow);
}
