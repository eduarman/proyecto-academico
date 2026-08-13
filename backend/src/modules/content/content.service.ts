import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { existsSync, mkdirSync, unlinkSync } from 'fs';
import { join } from 'path';
import { CoursesService } from '../courses/courses.service';

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
  fileName: string;
  originalName: string;
  mimeType: string;
  createdAt: string;
}

export const UPLOADS_DIR = join(process.cwd(), 'uploads', 'lessons');

@Injectable()
export class ContentService {
  private readonly modules: CourseModuleRecord[] = [];
  private readonly lessons: LessonRecord[] = [];

  constructor(private readonly coursesService: CoursesService) {
    if (!existsSync(UPLOADS_DIR)) {
      mkdirSync(UPLOADS_DIR, { recursive: true });
    }
  }

  findByCourse(courseId: string) {
    this.coursesService.findOne(courseId);
    return this.modules
      .filter((module) => module.courseId === courseId)
      .map((module) => ({
        ...module,
        lessons: this.lessons
          .filter((lesson) => lesson.moduleId === module.id)
          .map(({ fileName, ...rest }) => rest),
      }));
  }

  createModule(courseId: string, title: string) {
    this.coursesService.findOne(courseId);
    const module: CourseModuleRecord = {
      id: `mod-${randomUUID()}`,
      courseId,
      title: title.trim(),
      createdAt: new Date().toISOString(),
    };
    this.modules.push(module);
    return module;
  }

  removeModule(id: string) {
    const index = this.modules.findIndex((module) => module.id === id);
    if (index === -1) {
      throw new NotFoundException('Módulo no encontrado');
    }

    const lessonsToRemove = this.lessons.filter((lesson) => lesson.moduleId === id);
    lessonsToRemove.forEach((lesson) => this.deleteLessonFile(lesson.fileName));
    this.lessons.splice(
      0,
      this.lessons.length,
      ...this.lessons.filter((lesson) => lesson.moduleId !== id),
    );

    const [removed] = this.modules.splice(index, 1);
    return removed;
  }

  findModule(id: string) {
    const module = this.modules.find((entry) => entry.id === id);
    if (!module) {
      throw new NotFoundException('Módulo no encontrado');
    }
    return module;
  }

  createLesson(
    moduleId: string,
    data: { title: string; type: LessonType },
    file: Express.Multer.File,
  ) {
    const module = this.findModule(moduleId);

    const lesson: LessonRecord = {
      id: `lesson-${randomUUID()}`,
      moduleId,
      courseId: module.courseId,
      title: data.title.trim(),
      type: data.type,
      fileName: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      createdAt: new Date().toISOString(),
    };
    this.lessons.push(lesson);
    const { fileName, ...rest } = lesson;
    return rest;
  }

  findLesson(id: string) {
    const lesson = this.lessons.find((entry) => entry.id === id);
    if (!lesson) {
      throw new NotFoundException('Lección no encontrada');
    }
    return lesson;
  }

  removeLesson(id: string) {
    const index = this.lessons.findIndex((entry) => entry.id === id);
    if (index === -1) {
      throw new NotFoundException('Lección no encontrada');
    }
    const [removed] = this.lessons.splice(index, 1);
    this.deleteLessonFile(removed.fileName);
    return removed;
  }

  private deleteLessonFile(fileName: string) {
    const filePath = join(UPLOADS_DIR, fileName);
    if (existsSync(filePath)) {
      try {
        unlinkSync(filePath);
      } catch {
        // Best-effort: si el archivo no se puede borrar, no bloquea la operación.
      }
    }
  }

  static assertValidUpload(file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('El archivo es obligatorio');
    }
  }
}
