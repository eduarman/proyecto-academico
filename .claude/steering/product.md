# Product Steering — Plataforma de Gestión de Cursos

## Visión
Plataforma web para gestionar la oferta académica de una escuela/academia enfocada en cursos técnicos: **Office, SQL, Análisis de Datos y Marketing**. Permite a un administrador crear y publicar cursos, gestionar las inscripciones de cada curso, y administrar usuarios; y permite a un estudiante explorar el catálogo, inscribirse y hacer seguimiento de sus cursos.

## Problema que resuelve
Hoy la gestión de cursos e inscripciones se hace de forma manual/dispersa (hojas de cálculo, correos, WhatsApp). El sistema centraliza:
- Catálogo de cursos por categoría.
- Inscripciones con estado y trazabilidad (quién se inscribió, cuándo, en qué estado).
- Control de acceso: cada rol ve solo lo que le corresponde.

## Roles y perfiles

| Rol | Descripción | Acceso principal |
|---|---|---|
| **ADMIN** | Administra la plataforma | CRUD de cursos, gestión de inscripciones por curso, gestión de usuarios/roles, panel de métricas |
| **ESTUDIANTE** | Usuario final que toma cursos | Catálogo público, inscripción a cursos, "mis cursos", perfil propio |

> Diseño extensible: el modelo de roles debe permitir agregar roles futuros (p. ej. `INSTRUCTOR`) sin romper el esquema de permisos (ver [[tech]] y spec [[gestion-usuarios-roles-requirements]]).

## Categorías de curso (dominio fijo del negocio)
`OFFICE`, `SQL`, `ANALISIS_DATOS`, `MARKETING` — administrables desde el panel admin pero con estos 4 valores iniciales.

## Módulos funcionales (mapean 1:1 a specs en `.claude/specs/`)
1. **Autenticación** — login, registro, recuperación de contraseña, sesión JWT.
2. **Gestión de usuarios y roles** — CRUD de usuarios, asignación de rol, activar/desactivar.
3. **Gestión de cursos** — CRUD de cursos, categorías, estados (borrador/publicado/archivado).
4. **Gestión de inscripciones** — un estudiante solicita inscripción; el admin la gestiona (aprobar/rechazar/cancelar/completar) **por curso**.
5. **Panel administrador** — vista consolidada: cursos, inscripciones por curso, usuarios, métricas básicas.
6. **Panel usuario** — catálogo, mis cursos, estado de mis inscripciones, perfil.

## Criterios de éxito del MVP
- Un admin puede crear un curso, publicarlo y ver quién se inscribe.
- Un estudiante puede registrarse, iniciar sesión, inscribirse a un curso y ver el estado de su inscripción.
- Ningún usuario puede ver ni ejecutar acciones fuera de lo permitido por su rol (validado en frontend **y** backend).
- El sistema es desplegable con Docker (frontend + backend + PostgreSQL) sin configuración manual adicional.

## Fuera de alcance (MVP)
- Pagos en línea / pasarelas de pago.
- Contenido de curso tipo LMS (lecciones, videos, evaluaciones) — se deja como extensión futura (`CourseModule`).
- Notificaciones por email transaccionales (se puede mockear/loggear en MVP).
