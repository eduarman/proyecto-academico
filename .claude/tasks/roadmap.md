# Roadmap — Plataforma de Gestión de Cursos

Orden recomendado de implementación (cada fase depende de que la anterior tenga su "camino feliz" funcionando). Detalle por módulo en los archivos hermanos de esta carpeta.

## Fase 0 — Fundaciones
- [ ] Scaffolding monorepo (`/frontend`, `/backend`) según [[structure]]
- [ ] `docker-compose.yml` con `postgres` + `backend` + `frontend`
- [ ] Backend: Nest CLI init, Prisma init, conexión a PostgreSQL, `main.ts` con Helmet/CORS/ValidationPipe global
- [ ] Frontend: Vite + Vue3 init, Bootstrap 5 + SCSS (estructura 7-1), Pinia, Vue Router, Axios instance
- [ ] Seed inicial de `Role` (`ADMIN`, `ESTUDIANTE`)

## Fase 1 — Autenticación (bloquea todo lo demás)
Checklist: [[autenticacion]]

## Fase 2 — Gestión de usuarios y roles
Checklist: [[gestion-usuarios-roles]] (requiere Fase 1)

## Fase 3 — Gestión de cursos
Checklist: [[gestion-cursos]] (requiere Fase 1)

## Fase 4 — Gestión de inscripciones
Checklist: [[gestion-inscripciones]] (requiere Fase 3)

## Fase 5 — Panel administrador (ensambla 2, 3, 4)
Checklist: [[panel-administrador]]

## Fase 6 — Panel usuario (ensambla 3, 4)
Checklist: [[panel-usuario]]

## Fase 7 — Endurecimiento y despliegue
- [ ] Revisar los 3 niveles de validación de rol (UI/router/backend) en cada módulo — checklist de seguridad
- [ ] Tests e2e de flujos críticos: registro→login→inscripción→aprobación admin
- [ ] Rate limiting activo en producción, revisar CORS/cookies en dominio real
- [ ] `.env.example` completo y documentado en README
- [ ] Documentar despliegue (frontend estático + backend/DB en Docker)

## Cómo usar este roadmap con Claude Code
Cada checklist referencia sus requisitos (`requirements.md`) y diseño (`design.md`) en `.claude/specs/<modulo>/`. Al pedir implementación de una tarea, apunta directamente al spec correspondiente para que el contexto (entidades, endpoints, reglas de negocio) esté completo.
