import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CoursesService } from '../courses/courses.service';

export type EnrollmentStatus = 'PENDIENTE' | 'ACTIVA' | 'COMPLETADA' | 'CANCELADA';

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  status: EnrollmentStatus;
  createdAt: string;
  completedAt: string | null;
}

interface RequestUser {
  id: string;
  role: 'ADMIN' | 'ESTUDIANTE';
}

// PENDIENTE -> ACTIVA (aprobar) -> COMPLETADA; PENDIENTE|ACTIVA -> CANCELADA. Ver gestion-inscripciones/design.md.
const TRANSITIONS: Record<EnrollmentStatus, EnrollmentStatus[]> = {
  PENDIENTE: ['ACTIVA', 'CANCELADA'],
  ACTIVA: ['COMPLETADA', 'CANCELADA'],
  COMPLETADA: [],
  CANCELADA: [],
};

const RESERVING_STATUSES: EnrollmentStatus[] = ['PENDIENTE', 'ACTIVA'];

@Injectable()
export class EnrollmentsService {
  private readonly enrollments: Enrollment[] = [
    {
      id: 'enr-1',
      userId: 'user-1',
      courseId: 'course-1',
      status: 'PENDIENTE',
      createdAt: '2026-08-01T00:00:00.000Z',
      completedAt: null,
    },
  ];

  constructor(private readonly coursesService: CoursesService) {}

  getMyEnrollments(userId: string) {
    return this.enrollments.filter((entry) => entry.userId === userId);
  }

  listByCourse(courseId: string) {
    return this.enrollments.filter((entry) => entry.courseId === courseId);
  }

  // Da acceso al contenido: ACTIVA (cursando) o COMPLETADA (ya cursó, conserva acceso para repasar material).
  hasContentAccess(userId: string, courseId: string) {
    return this.enrollments.some(
      (entry) =>
        entry.userId === userId &&
        entry.courseId === courseId &&
        (entry.status === 'ACTIVA' || entry.status === 'COMPLETADA'),
    );
  }

  create(userId: string, courseId: string) {
    const course = this.coursesService.findOne(courseId);

    if (course.status !== 'PUBLICADO') {
      throw new BadRequestException('El curso no está disponible para inscripción');
    }

    const existing = this.enrollments.find(
      (entry) => entry.userId === userId && entry.courseId === courseId && RESERVING_STATUSES.includes(entry.status),
    );
    if (existing) {
      throw new ConflictException('Ya existe una inscripción activa para este curso');
    }

    const reservedSeats = this.enrollments.filter(
      (entry) => entry.courseId === courseId && RESERVING_STATUSES.includes(entry.status),
    ).length;
    if (reservedSeats >= course.maxSeats) {
      throw new ConflictException('El curso no tiene cupos disponibles');
    }

    const enrollment: Enrollment = {
      id: `enr-${Date.now()}`,
      userId,
      courseId,
      status: 'PENDIENTE',
      createdAt: new Date().toISOString(),
      completedAt: null,
    };

    this.enrollments.push(enrollment);
    return enrollment;
  }

  changeStatus(user: RequestUser, id: string, newStatus: EnrollmentStatus) {
    const enrollment = this.enrollments.find((entry) => entry.id === id);
    if (!enrollment) {
      throw new NotFoundException('Inscripción no encontrada');
    }

    const isOwner = enrollment.userId === user.id;
    if (user.role !== 'ADMIN' && !isOwner) {
      throw new ForbiddenException('No tienes permisos para esta inscripción');
    }

    // Solo el admin gestiona el flujo completo; el estudiante únicamente puede cancelar su propia solicitud PENDIENTE.
    const isStudentSelfCancel = isOwner && enrollment.status === 'PENDIENTE' && newStatus === 'CANCELADA';
    if (user.role !== 'ADMIN' && !isStudentSelfCancel) {
      throw new ForbiddenException('Solo el administrador puede realizar esta transición');
    }

    if (!TRANSITIONS[enrollment.status].includes(newStatus)) {
      throw new BadRequestException(`Transición ${enrollment.status} → ${newStatus} no permitida`);
    }

    if (newStatus === 'ACTIVA') {
      const course = this.coursesService.findOne(enrollment.courseId);
      const activeSeats = this.enrollments.filter(
        (entry) => entry.courseId === enrollment.courseId && entry.id !== enrollment.id && entry.status === 'ACTIVA',
      ).length;
      if (activeSeats >= course.maxSeats) {
        throw new ConflictException('El curso ya no tiene cupos disponibles');
      }
    }

    enrollment.status = newStatus;
    if (newStatus === 'COMPLETADA') {
      enrollment.completedAt = new Date().toISOString();
    }

    return enrollment;
  }
}
