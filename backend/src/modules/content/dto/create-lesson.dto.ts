import { IsIn, IsString, MinLength } from 'class-validator';

const LESSON_TYPES = ['PDF', 'VIDEO'] as const;

export class CreateLessonDto {
  @IsString()
  @MinLength(2)
  title: string;

  @IsIn(LESSON_TYPES)
  type: (typeof LESSON_TYPES)[number];
}
