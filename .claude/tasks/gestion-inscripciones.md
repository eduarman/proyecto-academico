# Tasks — Gestión de inscripciones

Specs: [[gestion-inscripciones-requirements]] · [[gestion-inscripciones-design]]
Depende de: [[gestion-cursos]]

## Backend
- [ ] Prisma schema: `Enrollment` (+ enum `EnrollmentStatus`) + migración
- [ ] `EnrollmentsModule`: `EnrollmentsController`, `EnrollmentsService`
- [ ] Tabla de transiciones válidas de estado (constante, no if/else disperso)
- [ ] `POST /courses/:courseId/enrollments` — valida cupo + no-duplicado — RF-INS-01
- [ ] `GET /courses/:courseId/enrollments` (ADMIN) — RF-INS-02
- [ ] `GET /enrollments/me` — RF-INS-03
- [ ] `PATCH /enrollments/:id/estado` — valida rol Y propiedad del recurso — RF-INS-02/03/05
- [ ] Aprobación (`PENDIENTE→ACTIVA`) dentro de `$transaction` con recheck de cupo — control de concurrencia
- [ ] Tests: cupo lleno, duplicado, transición inválida, estudiante intenta cambiar inscripción ajena (403)

## Frontend
- [ ] `stores/enrollments.store.ts`
- [ ] `components/enrollments/EnrollmentTable.vue` + `EnrollmentStatusBadge.vue`
- [ ] `views/admin/AdminCourseEnrollmentsView.vue` — acciones aprobar/rechazar/completar/cancelar
- [ ] `views/user/MyCoursesView.vue` — listar propias + cancelar si `PENDIENTE`
- [ ] Ocultar acciones admin en `EnrollmentTable` si rol no es `ADMIN`

## Definition of done
- [ ] Simular carrera: dos solicitudes casi simultáneas para el último cupo → solo una queda `ACTIVA` tras aprobación
