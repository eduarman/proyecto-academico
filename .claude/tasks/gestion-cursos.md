# Tasks — Gestión de cursos

Specs: [[gestion-cursos-requirements]] · [[gestion-cursos-design]]
Depende de: [[autenticacion]]

## Backend
- [ ] Prisma schema: `Course` (+ enums `CourseCategory`, `CourseStatus`) + migración
- [ ] `CoursesModule`: `CoursesController`, `CoursesService`
- [ ] `GET /courses` — comportamiento dual público/admin según `request.user` — RF-CUR-04
- [ ] `GET /courses/:id` — incluye `cuposDisponibles` calculado
- [ ] `POST /courses` (`CreateCourseDto`) — RF-CUR-01
- [ ] `PATCH /courses/:id` — valida `cupoMaximo >= inscripcionesActivas` — RF-CUR-03
- [ ] `PATCH /courses/:id/estado` — máquina de estados `BORRADOR→PUBLICADO→ARCHIVADO` — RF-CUR-02
- [ ] `DELETE /courses/:id` — bloqueado si hay inscripciones `ACTIVA`
- [ ] Guards `@Roles('ADMIN')` en todos los mutantes
- [ ] Tests: publicar/archivar, edición de cupo con inscripciones activas, catálogo filtra por estado+rol

## Frontend
- [ ] `stores/courses.store.ts`
- [ ] `views/user/CatalogView.vue` + `components/courses/CourseCard.vue` + `CourseFilters.vue`
- [ ] `views/user/CourseDetailView.vue`
- [ ] `views/admin/AdminCoursesView.vue` + `components/courses/CourseForm.vue`
- [ ] Acciones publicar/archivar en tabla admin
- [ ] Ocultar `CourseForm`/acciones de gestión para rol `ESTUDIANTE` — RF-CUR-05

## Definition of done
- [ ] Un curso `BORRADOR` no aparece en `/catalogo` aunque se llame directo al endpoint sin filtros desde el frontend
