import { Module } from '@nestjs/common';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';
import { CoursesModule } from '../courses/courses.module';
import { EnrollmentsModule } from '../enrollments/enrollments.module';

@Module({
  imports: [CoursesModule, EnrollmentsModule],
  controllers: [ContentController],
  providers: [ContentService],
})
export class ContentModule {}
