import { Body, ConflictException, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';
import { CoursesService } from './courses.service';
import { EnrollmentsService } from '../enrollments/enrollments.service';
import { CreateCourseDto, UpdateCourseDto } from './dto';

@Controller('courses')
export class CoursesController {
  constructor(
    private readonly coursesService: CoursesService,
    private readonly enrollmentsService: EnrollmentsService,
  ) {}

  // Público: cualquiera ve el catálogo (solo cursos PUBLICADO); si hay sesión de
  // ADMIN válida, ve todos + filtro por estado.
  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  findAll(@Req() request: any, @Query('category') category?: string, @Query('status') status?: string) {
    return this.coursesService.findAll(request.user, category, status);
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  create(@Body() body: CreateCourseDto) {
    return this.coursesService.create(body);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() body: UpdateCourseDto) {
    return this.coursesService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    const hasActiveEnrollments = this.enrollmentsService
      .listByCourse(id)
      .some((enrollment) => enrollment.status === 'ACTIVA');
    if (hasActiveEnrollments) {
      throw new ConflictException('No se puede eliminar un curso con inscripciones activas; archívalo en su lugar');
    }
    return this.coursesService.remove(id);
  }
}
