import { IsIn } from 'class-validator';

const NEXT_STATUSES = ['ACTIVA', 'COMPLETADA', 'CANCELADA'] as const;

export class UpdateEnrollmentStatusDto {
  @IsIn(NEXT_STATUSES)
  status: (typeof NEXT_STATUSES)[number];
}
