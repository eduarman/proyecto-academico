import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCourseDto, UpdateCourseDto } from './dto';
import { CategoriesService } from '../categories/categories.service';

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

export interface RequestUser {
  role: 'ADMIN' | 'ESTUDIANTE';
}

// BORRADOR -> PUBLICADO -> ARCHIVADO; no retrocede. Ver gestion-cursos/design.md.
const STATUS_TRANSITIONS: Record<CourseStatus, CourseStatus[]> = {
  BORRADOR: ['PUBLICADO'],
  PUBLICADO: ['ARCHIVADO'],
  ARCHIVADO: [],
};

@Injectable()
export class CoursesService {
  private readonly courses: Course[] = [
    {
      id: 'course-1',
      title: 'Excel Avanzado',
      category: 'OFFICE',
      status: 'PUBLICADO',
      maxSeats: 20,
      startDate: '2026-09-01',
      endDate: '2026-09-15',
    },
    {
      id: 'course-2',
      title: 'SQL para análisis',
      category: 'SQL',
      status: 'BORRADOR',
      maxSeats: 15,
      startDate: '2026-10-01',
      endDate: '2026-10-20',
    },
  ];

  constructor(private readonly categoriesService: CategoriesService) {}

  // user es undefined para visitantes no autenticados (catálogo público): mismo trato que ESTUDIANTE.
  findAll(user: RequestUser | undefined, category?: string, status?: string) {
    if (user?.role === 'ADMIN') {
      return this.courses.filter(
        (course) => (!category || course.category === category) && (!status || course.status === status),
      );
    }

    // Estudiante o visitante público: solo cursos publicados, sin importar el filtro de estado que envíe.
    return this.courses.filter((course) => course.status === 'PUBLICADO' && (!category || course.category === category));
  }

  findOne(id: string) {
    const course = this.courses.find((entry) => entry.id === id);
    if (!course) {
      throw new NotFoundException('Curso no encontrado');
    }
    return course;
  }

  countByCategory(category: string) {
    return this.courses.filter((course) => course.category === category).length;
  }

  create(payload: CreateCourseDto) {
    this.assertValidCategory(payload.category);
    this.assertValidDateRange(payload.startDate, payload.endDate);

    const course: Course = {
      id: `course-${Date.now()}`,
      title: payload.title,
      category: payload.category,
      status: 'BORRADOR',
      maxSeats: payload.maxSeats,
      startDate: payload.startDate,
      endDate: payload.endDate,
    };
    this.courses.push(course);
    return course;
  }

  update(id: string, payload: UpdateCourseDto) {
    const course = this.findOne(id);

    if (payload.status && payload.status !== course.status) {
      if (!STATUS_TRANSITIONS[course.status].includes(payload.status)) {
        throw new BadRequestException(`Transición ${course.status} → ${payload.status} no permitida`);
      }
    }

    if (payload.category) {
      this.assertValidCategory(payload.category);
    }

    this.assertValidDateRange(payload.startDate ?? course.startDate, payload.endDate ?? course.endDate);

    Object.assign(course, payload);
    return course;
  }

  remove(id: string) {
    const index = this.courses.findIndex((course) => course.id === id);
    if (index === -1) {
      throw new NotFoundException('Curso no encontrado');
    }
    const [removed] = this.courses.splice(index, 1);
    return removed;
  }

  private assertValidDateRange(startDate: string, endDate: string) {
    if (new Date(startDate) >= new Date(endDate)) {
      throw new BadRequestException('La fecha de inicio debe ser anterior a la fecha de fin');
    }
  }

  private assertValidCategory(category: string) {
    if (!this.categoriesService.exists(category)) {
      throw new BadRequestException(`La categoría "${category}" no existe`);
    }
  }
}
