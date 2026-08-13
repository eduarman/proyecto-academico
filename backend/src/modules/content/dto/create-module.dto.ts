import { IsString, MinLength } from 'class-validator';

export class CreateModuleDto {
  @IsString()
  @MinLength(2)
  title: string;
}
