import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { EnrollmentsService } from './enrollments.service';
import { UpdateEnrollmentStatusDto } from './dto/update-enrollment-status.dto';

@Controller()
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post('courses/:courseId/enrollments')
  @Roles('ESTUDIANTE')
  create(@Req() request: any, @Param('courseId') courseId: string) {
    return this.enrollmentsService.create(request.user.id, courseId);
  }

  @Get('courses/:courseId/enrollments')
  @Roles('ADMIN')
  listByCourse(@Param('courseId') courseId: string) {
    return this.enrollmentsService.listByCourse(courseId);
  }

  @Get('enrollments/me')
  getMyEnrollments(@Req() request: any) {
    return this.enrollmentsService.getMyEnrollments(request.user.id);
  }

  @Patch('enrollments/:id/estado')
  changeStatus(@Req() request: any, @Param('id') id: string, @Body() dto: UpdateEnrollmentStatusDto) {
    return this.enrollmentsService.changeStatus(request.user, id, dto.status);
  }
}
