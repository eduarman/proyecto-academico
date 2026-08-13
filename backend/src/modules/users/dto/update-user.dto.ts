import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';

const ROLES = ['ADMIN', 'ESTUDIANTE'] as const;
const STATUSES = ['ACTIVO', 'INACTIVO'] as const;

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  lastName?: string;

  @IsOptional()
  @IsIn(ROLES)
  role?: (typeof ROLES)[number];

  @IsOptional()
  @IsIn(STATUSES)
  status?: (typeof STATUSES)[number];
}
