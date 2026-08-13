import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { randomUUID } from 'crypto';
import { extname, join } from 'path';
import { Response } from 'express';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ContentService, UPLOADS_DIR } from './content.service';
import { EnrollmentsService } from '../enrollments/enrollments.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { CreateLessonDto } from './dto/create-lesson.dto';

const MAX_UPLOAD_BYTES = 300 * 1024 * 1024;

const uploadInterceptor = FileInterceptor('file', {
  storage: diskStorage({
    destination: UPLOADS_DIR,
    filename: (_req, file, cb) => cb(null, `${randomUUID()}${extname(file.originalname)}`),
  }),
  limits: { fileSize: MAX_UPLOAD_BYTES },
  fileFilter: (_req, file, cb) => {
    const isPdf = file.mimetype === 'application/pdf';
    const isVideo = file.mimetype.startsWith('video/');
    cb(null, isPdf || isVideo);
  },
});

@Controller()
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ContentController {
  constructor(
    private readonly contentService: ContentService,
    private readonly enrollmentsService: EnrollmentsService,
  ) {}

  @Get('courses/:courseId/content')
  getContent(@Req() request: any, @Param('courseId') courseId: string) {
    this.assertCanView(request.user, courseId);
    return this.contentService.findByCourse(courseId);
  }

  @Post('courses/:courseId/modules')
  @Roles('ADMIN')
  createModule(@Param('courseId') courseId: string, @Body() dto: CreateModuleDto) {
    return this.contentService.createModule(courseId, dto.title);
  }

  @Delete('modules/:id')
  @Roles('ADMIN')
  removeModule(@Param('id') id: string) {
    return this.contentService.removeModule(id);
  }

  @Post('modules/:moduleId/lessons')
  @Roles('ADMIN')
  @UseInterceptors(uploadInterceptor)
  createLesson(
    @Param('moduleId') moduleId: string,
    @Body() dto: CreateLessonDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    ContentService.assertValidUpload(file);
    return this.contentService.createLesson(moduleId, dto, file);
  }

  @Delete('lessons/:id')
  @Roles('ADMIN')
  removeLesson(@Param('id') id: string) {
    return this.contentService.removeLesson(id);
  }

  @Get('lessons/:id/file')
  streamFile(@Req() request: any, @Param('id') id: string, @Res() response: Response) {
    const lesson = this.contentService.findLesson(id);
    this.assertCanView(request.user, lesson.courseId);

    response.setHeader('Content-Type', lesson.mimeType);
    response.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(lesson.originalName)}"`);
    response.sendFile(join(UPLOADS_DIR, lesson.fileName));
  }

  private assertCanView(user: { id: string; role: string }, courseId: string) {
    if (user.role === 'ADMIN') return;
    if (!this.enrollmentsService.hasContentAccess(user.id, courseId)) {
      throw new ForbiddenException('Debes tener una inscripción activa o completada para ver este contenido');
    }
  }
}
