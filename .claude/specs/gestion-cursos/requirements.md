# Requirements — Gestión de cursos

Referencia: [[product]] (categorías: OFFICE, SQL, ANALISIS_DATOS, MARKETING)

## Historias de usuario

### RF-CUR-01 — Crear curso (admin)
**Como** administrador, **quiero** crear un curso con categoría, cupo y fechas, **para** publicarlo en el catálogo.

- CUANDO el admin envía el formulario con título, categoría, cupo máximo y fechas válidas (fechaInicio < fechaFin), ENTONCES el sistema DEBE crear el curso en estado `BORRADOR`.
- CUANDO faltan campos obligatorios o `cupoMaximo <= 0`, ENTONCES el sistema DEBE rechazar con 400 y detalle por campo.
- Un usuario `ESTUDIANTE` que intente `POST /courses` DEBE recibir 403.

### RF-CUR-02 — Publicar / archivar curso
**Como** administrador, **quiero** cambiar el estado de un curso, **para** controlar su visibilidad en el catálogo público.

- CUANDO un curso pasa a `PUBLICADO`, ENTONCES DEBE aparecer en el catálogo (`GET /courses`) visible para estudiantes.
- CUANDO un curso está en `BORRADOR` o `ARCHIVADO`, ENTONCES NO DEBE aparecer en el catálogo público, solo en el listado admin.
- CUANDO un curso tiene inscripciones `ACTIVA`, ENTONCES el sistema NO DEBE permitir borrarlo físicamente (solo archivar).

### RF-CUR-03 — Editar curso
**Como** administrador, **quiero** editar los datos de un curso existente, **para** corregir información.

- CUANDO se reduce `cupoMaximo` por debajo del número de inscripciones `ACTIVA` actuales, ENTONCES el sistema DEBE rechazar el cambio con 409 y mensaje explicativo.

### RF-CUR-04 — Catálogo público (estudiante)
**Como** estudiante, **quiero** ver el catálogo de cursos publicados filtrado por categoría, **para** elegir en cuál inscribirme.

- CUANDO el estudiante filtra por categoría (`OFFICE`, `SQL`, `ANALISIS_DATOS`, `MARKETING`), ENTONCES el sistema DEBE retornar solo cursos `PUBLICADO` de esa categoría.
- CUANDO el estudiante abre el detalle de un curso, ENTONCES DEBE ver cupos disponibles (`cupoMaximo - inscripcionesActivas`) sin ver datos de otros estudiantes inscritos.

### RF-CUR-05 — Validación de rol en componentes de curso
- Los componentes `CourseForm.vue` y las acciones "Editar/Publicar/Archivar" DEBEN estar ocultos para rol `ESTUDIANTE`, condicionados por `usePermissions().can('courses:manage')`.
- El backend DEBE ser la única fuente de verdad: aunque el componente esté oculto, el endpoint valida rol igualmente.

## Criterios de aceptación transversales
- Categoría es un enum cerrado (`OFFICE | SQL | ANALISIS_DATOS | MARKETING`), validado en el DTO — no texto libre.
- Todas las fechas se manejan en UTC en backend y se formatean en frontend según locale `es`.
