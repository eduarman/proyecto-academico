# Roadmap — Plataforma de Gestión de Cursos

Orden recomendado de implementación (cada fase depende de que la anterior tenga su "camino feliz" funcionando). Detalle por módulo en los archivos hermanos de esta carpeta.

> Estado general (13-ago-2026): MVP funcional de punta a punta (auth, cursos, categorías, inscripciones, contenido de curso, paneles admin/usuario) corriendo sobre **stores en memoria**, no sobre Prisma/PostgreSQL. Es la desviación más importante respecto al plan original — ver Fase 0.

## Fase 0 — Fundaciones
- [x] Scaffolding monorepo (`/frontend`, `/backend`)
- [ ] `docker-compose.yml` con `postgres` + `backend` + `frontend` — no existe
- [x] Backend: Nest CLI init, `main.ts` con CORS + ValidationPipe global + cookie-parser
- [ ] Backend: Prisma init, conexión a PostgreSQL — **no hecho**; cada módulo usa un array en memoria como store (se pierde todo al reiniciar el proceso)
- [ ] Backend: Helmet — no agregado
- [x] Frontend: Vite + Vue3 init, Pinia, Vue Router, Axios instance (`services/http.js`)
- [ ] Frontend: Bootstrap 5 + SCSS 7-1 — se instaló Bootstrap pero el diseño real ("Cursia", importado desde Claude Design) es un sistema de tokens propio en `styles/main.scss`; Bootstrap quedó sin usar en las vistas
- [x] Roles `ADMIN` / `ESTUDIANTE` — como enum de string, no como tabla `Role` (no hay tabla, es en memoria)

## Fase 1 — Autenticación (bloquea todo lo demás)
Checklist: [[autenticacion]] — **funcional**, falta rate limiting y tests automatizados.

## Fase 2 — Gestión de usuarios y roles
Checklist: [[gestion-usuarios-roles]] — **funcional**, faltan paginación, "no degradar único admin" y revocar sesión al desactivar.

## Fase 3 — Gestión de cursos
Checklist: [[gestion-cursos]] — **funcional**, incluye extra no planeado: categorías administrables por el admin (CRUD completo).

## Fase 4 — Gestión de inscripciones
Checklist: [[gestion-inscripciones]] — **funcional**, incluye extra no planeado: contenido de curso (módulos + lecciones PDF/video) gateado por inscripción ACTIVA/COMPLETADA.

## Fase 5 — Panel administrador (ensambla 2, 3, 4)
Checklist: [[panel-administrador]] — **funcional** sin dashboard de métricas (`/admin/cursos` es la landing de admin directamente).

## Fase 6 — Panel usuario (ensambla 3, 4)
Checklist: [[panel-usuario]] — **funcional**; el catálogo (`/catalogo`) es público (no requiere login), la inscripción sí pide login.

## Fase 7 — Endurecimiento y despliegue
- [x] Revisar los 3 niveles de validación de rol (UI/router/backend) — verificado manualmente con Playwright en varios módulos (courses, enrollments, users, content)
- [ ] Tests e2e automatizados — no hay suite de tests; toda la verificación de esta sesión fue manual/Playwright ad-hoc, no quedó como test repetible
- [ ] Rate limiting — no configurado
- [ ] `.env.example` — no existe
- [ ] Documentar despliegue — no existe

## Cómo usar este roadmap con Claude Code
Cada checklist referencia sus requisitos (`requirements.md`) y diseño (`design.md`) en `.claude/specs/<modulo>/`. Al pedir implementación de una tarea, apunta directamente al spec correspondiente para que el contexto (entidades, endpoints, reglas de negocio) esté completo.

**Siguiente paso recomendado:** migrar de stores en memoria a Prisma + PostgreSQL (Fase 0) — es la base que le falta a todo lo demás para dejar de perder datos en cada reinicio del backend.
