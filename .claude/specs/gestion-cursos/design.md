# Design — Gestión de cursos

Referencia: [[tech]], [[gestion-cursos-requirements]] (RF-CUR-01..05)

## Modelo de datos (Prisma)
```prisma
enum CourseCategory {
  OFFICE
  SQL
  ANALISIS_DATOS
  MARKETING
}

enum CourseStatus {
  BORRADOR
  PUBLICADO
  ARCHIVADO
}

model Course {
  id           String         @id @default(uuid())
  titulo       String
  descripcion  String
  categoria    CourseCategory
  nivel        String?        // "Básico" | "Intermedio" | "Avanzado" (texto libre corto, no crítico)
  duracionHoras Int
  cupoMaximo   Int
  precio       Decimal        @default(0)
  estado       CourseStatus   @default(BORRADOR)
  imagenUrl    String?
  fechaInicio  DateTime
  fechaFin     DateTime
  createdById  String
  createdBy    User           @relation(fields: [createdById], references: [id])
  enrollments  Enrollment[]
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt

  @@index([categoria])
  @@index([estado])
}
```

## Endpoints (`/api/courses`)
| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| GET | `/courses` | pública/JWT | Estudiante: solo `PUBLICADO` (+ filtro `?categoria=`). Admin: todos + filtro `?estado=` |
| GET | `/courses/:id` | pública/JWT | Detalle + `cuposDisponibles` calculado |
| POST | `/courses` | ADMIN | Crea en `BORRADOR` |
| PATCH | `/courses/:id` | ADMIN | Edita datos; valida `cupoMaximo >= inscripcionesActivas` |
| PATCH | `/courses/:id/estado` | ADMIN | Transición `BORRADOR→PUBLICADO→ARCHIVADO` |
| DELETE | `/courses/:id` | ADMIN | Solo si `enrollments.count(estado='ACTIVA') === 0`, si no → 409 |

`GET /courses` diferencia comportamiento según si `request.user` existe y su rol — mismo endpoint, dos "vistas" controladas en el service (`CoursesService.findAll(user?)`).

## Reglas de negocio (service layer)
- `cuposDisponibles = cupoMaximo - count(enrollments where estado IN ['PENDIENTE','ACTIVA'])` (pendientes reservan cupo tentativo — decisión de diseño para evitar sobreventa; ver [[gestion-inscripciones-design]]).
- Transición de estado validada con máquina de estados simple: `BORRADOR → PUBLICADO → ARCHIVADO`, y `ARCHIVADO → PUBLICADO` (desarchivar). No retrocede a `BORRADOR`.

## Frontend
- **Catálogo**: `CatalogView.vue` (`/catalogo`) — `CourseCard.vue` en grid, `CourseFilters.vue` (categoría).
- **Detalle**: `CourseDetailView.vue` (`/cursos/:id`) — botón "Inscribirme" visible solo si rol `ESTUDIANTE` y curso `PUBLICADO` con cupos.
- **Admin**: `AdminCoursesView.vue` (`/admin/cursos`) — tabla + `CourseForm.vue` (modal/página crear-editar) + acciones publicar/archivar.
- **Store**: `courses.store.ts` — `fetchCatalog(filters)`, `fetchAdminCourses(filters)`, `createCourse`, `updateCourse`, `changeStatus`.
