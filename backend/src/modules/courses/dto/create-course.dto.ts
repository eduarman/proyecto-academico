import { IsDateString, IsInt, IsString, Min, MinLength } from 'class-validator';

export class CreateCourseDto {
  @IsString()
  @MinLength(3)
  title: string;

  // El código debe existir en CategoriesService; se valida en CoursesService (lista dinámica, administrable).
  @IsString()
  @MinLength(1)
  category: string;

  @IsInt()
  @Min(1)
  maxSeats: number;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;
}
