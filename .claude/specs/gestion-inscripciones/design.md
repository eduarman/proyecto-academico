# Design — Gestión de inscripciones

Referencia: [[tech]], [[gestion-inscripciones-requirements]] (RF-INS-01..05)

## Modelo de datos (Prisma)
```prisma
enum EnrollmentStatus {
  PENDIENTE
  ACTIVA
  COMPLETADA
  CANCELADA
}

model Enrollment {
  id                 String           @id @default(uuid())
  userId             String
  user               User             @relation(fields: [userId], references: [id])
  courseId           String
  course             Course           @relation(fields: [courseId], references: [id])
  estado             EnrollmentStatus @default(PENDIENTE)
  fechaInscripcion   DateTime         @default(now())
  fechaFinalizacion  DateTime?
  notas              String?          // notas internas del admin (opcional)
  createdAt          DateTime         @default(now())
  updatedAt          DateTime         @updatedAt

  @@index([courseId, estado])
  @@index([userId])
}
```
> Nota: no se define `@@unique([userId, courseId])` directo porque se permite re-inscripción tras `CANCELADA`; la unicidad "no duplicar activa/pendiente" se valida en el service (constraint de aplicación), no en el schema.

## Máquina de estados (backend, `EnrollmentsService`)
```
PENDIENTE ──aprobar(admin)──> ACTIVA ──completar(admin)──> COMPLETADA
   │                              │
   └──rechazar/cancelar──────────┴──cancelar(admin o propio estudiante si PENDIENTE)──> CANCELADA
```
Transiciones no listadas → `BadRequestException`. Implementado como tabla de transiciones válidas (`Record<EnrollmentStatus, EnrollmentStatus[]>`), no if/else disperso.

## Endpoints
| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| POST | `/courses/:courseId/enrollments` | ESTUDIANTE | Crea inscripción `PENDIENTE` (valida cupo y no-duplicado) |
| GET | `/courses/:courseId/enrollments` | ADMIN | Lista inscripciones de un curso (para vista de gestión) |
| GET | `/enrollments/me` | JWT | Lista inscripciones propias |
| PATCH | `/enrollments/:id/estado` | ADMIN, o ESTUDIANTE dueño si transición es `PENDIENTE→CANCELADA` | Cambia estado según máquina de estados |

`EnrollmentsController` valida propiedad del recurso con un guard/check explícito: `if (user.role !== 'ADMIN' && enrollment.userId !== user.id) throw ForbiddenException`.

## Control de concurrencia (cupo)
- `aprobar` (`PENDIENTE→ACTIVA`) ejecuta dentro de una transacción Prisma (`$transaction`): relee `course.cupoMaximo` y `count(estado IN ['ACTIVA'])`+`count('PENDIENTE')` según regla de negocio de [[gestion-cursos-design]], y solo confirma si hay cupo; si no, revierte con 409.

## Frontend
- **Admin**: `AdminCourseEnrollmentsView.vue` (`/admin/cursos/:id/inscripciones`) — `EnrollmentTable.vue` con `EnrollmentStatusBadge.vue` y acciones (aprobar/rechazar/completar/cancelar) según estado actual.
- **Estudiante**: `MyCoursesView.vue` (`/mis-cursos`) — lista de inscripciones propias con badge de estado y botón "Cancelar" solo si `PENDIENTE`.
- **Store**: `enrollments.store.ts` — `enroll(courseId)`, `fetchMine()`, `fetchByCourse(courseId)` (admin), `changeStatus(id, nuevoEstado)`.
