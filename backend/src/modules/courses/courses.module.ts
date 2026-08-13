import { Module, forwardRef } from '@nestjs/common';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { EnrollmentsModule } from '../enrollments/enrollments.module';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [forwardRef(() => EnrollmentsModule), forwardRef(() => CategoriesModule)],
  controllers: [CoursesController],
  providers: [CoursesService],
  exports: [CoursesService],
})
export class CoursesModule {}
