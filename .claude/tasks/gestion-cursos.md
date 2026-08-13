# Tasks — Gestión de cursos

Specs: [[gestion-cursos-requirements]] · [[gestion-cursos-design]]
Depende de: [[autenticacion]]

> Estado: **funcional**. Incluye un módulo extra no planeado originalmente: **categorías administrables** (`CategoriesModule`) — el admin puede crear/editar/eliminar categorías desde `/admin/categorias`, y el formulario de crear curso las lee dinámicamente en vez de un enum fijo.

## Backend
- [ ] Prisma schema: `Course` (+ enums) + migración — en memoria en su lugar (`courses.service.ts`)
- [x] `CoursesModule`: `CoursesController`, `CoursesService`
- [x] `GET /courses` — dual público/admin según `request.user` (usa `OptionalJwtAuthGuard`: visitante sin login ve solo `PUBLICADO`, admin ve todo + filtro por estado) — RF-CUR-04
- [x] `GET /courses/:id` — público también; **no** calcula `cuposDisponibles` (solo expone `maxSeats`, el cálculo de cupos ocupados vive en `EnrollmentsService`)
- [x] `POST /courses` (`CreateCourseDto`) — siempre crea en `BORRADOR` — RF-CUR-01
- [x] `PATCH /courses/:id` — valida rango de fechas y transición de estado (`BORRADOR→PUBLICADO→ARCHIVADO`, tabla de transiciones, no endpoint `/estado` separado) — RF-CUR-02
- [ ] Validar `cupoMaximo >= inscripcionesActivas` al editar — **no implementado** (gap real: se puede bajar el cupo por debajo de las inscripciones activas actuales) — RF-CUR-03
- [x] `DELETE /courses/:id` — bloqueado (409) si hay inscripciones `ACTIVA`
- [x] Guards `@Roles('ADMIN')` en todos los mutantes (create/update/delete/categorías)
- [x] Categoría del curso validada contra `CategoriesService` (lista dinámica), no contra un enum fijo
- [ ] Tests automatizados — no hay; verificado manualmente

## Frontend
- [x] `stores/courses.js`, `stores/categories.js`
- [x] `views/CatalogView.vue` — catálogo público, tarjetas inline (sin `CourseCard.vue`/`CourseFilters.vue` separados), buscador por título client-side
- [x] `views/CourseDetailView.vue` — público, con botón de inscripción (pide login si no hay sesión)
- [x] `views/admin/AdminCoursesView.vue` — tabla + diálogo crear/editar inline (sin `CourseForm.vue` separado) + gestión rápida de categorías desde el mismo diálogo
- [x] `views/admin/AdminCategoriesView.vue` — CRUD de categorías (crear/renombrar/eliminar; eliminar bloqueado si hay cursos usándola)
- [x] Acciones publicar/archivar en tabla admin
- [x] Rutas admin protegidas por rol — estudiante nunca ve estas vistas

## Definition of done
- [x] Un curso `BORRADOR` no aparece en `/catalogo` — verificado (filtro server-side en `findAll`, no solo en frontend)
