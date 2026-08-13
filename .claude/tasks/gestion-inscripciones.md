# Tasks — Gestión de inscripciones

Specs: [[gestion-inscripciones-requirements]] · [[gestion-inscripciones-design]]
Depende de: [[gestion-cursos]]

> Estado: **funcional**. Incluye un módulo extra no planeado: **contenido de curso** (`ContentModule` — módulos + lecciones PDF/video subidas como archivo real), accesible solo con inscripción `ACTIVA` o `COMPLETADA`.

## Backend
- [ ] Prisma schema: `Enrollment` (+ enum) + migración — en memoria en su lugar (`enrollments.service.ts`)
- [x] `EnrollmentsModule`: `EnrollmentsController`, `EnrollmentsService`
- [x] Tabla de transiciones válidas de estado (`TRANSITIONS` constante) — `PENDIENTE→ACTIVA→COMPLETADA`, cancelación desde `PENDIENTE`/`ACTIVA`
- [x] `POST /courses/:courseId/enrollments` — valida cupo + no-duplicado — RF-INS-01
- [x] `GET /courses/:courseId/enrollments` (ADMIN) — RF-INS-02
- [x] `GET /enrollments/me` — RF-INS-03
- [x] `PATCH /enrollments/:id/estado` — valida rol Y propiedad del recurso (estudiante solo puede cancelar su propia `PENDIENTE`) — RF-INS-02/03/05
- [ ] `$transaction` con recheck de cupo — no aplica tal cual (no hay DB); el recheck de cupo sí ocurre en el service al aprobar, pero no hay test de condición de carrera real
- [ ] Tests automatizados (cupo lleno, duplicado, transición inválida, 403 en inscripción ajena) — verificado manualmente, no como suite

## Backend — contenido de curso (extra, no estaba en el spec original)
- [x] `ContentModule`: módulos (`CourseModule`) y lecciones (`Lesson`) por curso
- [x] Subida de archivo real (PDF/video) con `multer`, guardado en `backend/uploads/lessons/`
- [x] `GET /lessons/:id/file` valida en el servidor: admin siempre, estudiante solo si tiene inscripción `ACTIVA` o `COMPLETADA` en ese curso — verificado con 403 real (no solo ocultar el link)

## Frontend
- [x] `stores/enrollments.js`, `stores/content.js`
- [x] `views/admin/AdminEnrollmentsView.vue` — lista **global** con filtro por curso (mejora sobre el plan original, que era solo por-curso) + acciones aprobar/rechazar/completar/cancelar
- [x] `views/ProfileView.vue` hace de "Mis cursos" (no hay `MyCoursesView.vue` separada) — lista propias inscripciones, agrupadas por curso (solo la más relevante por curso, para no acumular canceladas duplicadas), cancelar si `PENDIENTE`, "Ver contenido" si `ACTIVA`/`COMPLETADA`
- [x] `views/admin/AdminCourseContentView.vue` — crear módulos/lecciones, subir archivo
- [x] `views/CourseContentView.vue` — vista de contenido para el estudiante, con mensaje claro si no tiene acceso todavía
- [x] Acciones admin ocultas para rol `ESTUDIANTE` (rutas separadas, no un componente compartido con `v-if`)
- [x] Modal de confirmación al inscribirse (`EnrollDialog.vue`) — no estaba en el plan original, se agregó para mejorar el feedback

## Definition of done
- [ ] Simular carrera: dos solicitudes casi simultáneas para el último cupo — no probado
- [x] Estudiante sin inscripción `ACTIVA`/`COMPLETADA` no puede ver ni descargar el contenido del curso aunque tenga el ID exacto de la lección — verificado (403)
