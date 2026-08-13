# Tech Steering — Stack y decisiones de arquitectura

Decisiones confirmadas con el usuario (2026-08-09). No renegociar estas bases sin motivo explícito nuevo.

## Frontend
- **Vue 3** (Composition API + `<script setup>`)
- **Vite** como bundler/dev server
- **Bootstrap 5** (última versión) para UI base + **SCSS** (patrón 7-1) para theming/overrides
- **Pinia** para estado global (stores: `auth`, `courses`, `enrollments`, `users`, `ui`)
- **Vue Router 4** con `meta.roles` + guards de navegación (`beforeEach`) para control de acceso por rol
- **Axios** con instancia centralizada (`src/services/http.ts`): interceptor de request (adjunta access token) e interceptor de response (refresh automático en 401)
- **VeeValidate + Zod** (o Yup) para validación de formularios (login, registro, cursos, inscripciones)
- **Vitest + @vue/test-utils** para unit tests de componentes/composables

## Backend
- **NestJS** (TypeScript) — arquitectura modular por dominio: `AuthModule`, `UsersModule`, `RolesModule`, `CoursesModule`, `EnrollmentsModule`, `CommonModule`
- **class-validator + class-transformer** para DTOs (validación en el borde de la API)
- **Passport.js** con estrategias `passport-jwt` (access token) — ver detalle de auth en [[auth-design]]
- **Guards + Decorators** propios: `@Roles('ADMIN')` + `RolesGuard`, `JwtAuthGuard`, `@CurrentUser()`
- **Prisma ORM** sobre PostgreSQL (elegido por DX, migraciones declarativas y type-safety end-to-end). Alternativa evaluada: TypeORM — descartada por preferir el flujo de migraciones de Prisma.
- **Helmet, CORS restringido, rate limiting (`@nestjs/throttler`)** en `main.ts`
- **bcrypt (o argon2)** para hash de contraseñas — nunca texto plano ni reversible
- **Jest** (default de Nest) para unit/integration tests; **Supertest** para e2e de endpoints

## Base de datos
- **PostgreSQL 16**
- Migraciones versionadas con `prisma migrate`
- Esquema relacional normalizado: `users`, `roles`, `refresh_tokens`, `courses`, `enrollments` (detalle de entidades en cada `design.md` de spec)
- Índices en FKs y en campos de filtro frecuente (`courses.categoria`, `courses.estado`, `enrollments.estado`)

## Autenticación y autorización (decisión confirmada)
- **JWT stateless**: access token (corta duración, 15 min) + refresh token (larga duración, 7 días)
- Refresh token almacenado **hasheado** en tabla `refresh_tokens` (permite revocación/rotación) y entregado al cliente en **cookie httpOnly + Secure + SameSite=Strict**
- Access token entregado en el body de login y guardado en memoria (Pinia store), **no** en localStorage, para mitigar XSS
- Rotación de refresh token en cada uso (`refresh` invalida el anterior y emite uno nuevo)
- Autorización por rol validada en **tres capas**: (1) UI oculta/deshabilita acciones no permitidas, (2) guard de router en frontend, (3) `RolesGuard` en cada endpoint del backend — la fuente de verdad es siempre el backend.

## Infraestructura / DevOps
- **Monorepo** con `/frontend` y `/backend` como paquetes independientes (ver [[structure]])
- **Docker Compose** para desarrollo local: servicios `frontend`, `backend`, `postgres`, `pgadmin` (opcional)
- Variables de entorno vía `.env` (nunca commiteadas; se versiona `.env.example`)
- CI sugerido (futuro): lint + test + build en cada PR (GitHub Actions)
- Despliegue sugerido (futuro): frontend estático (Vercel/Netlify/Nginx), backend + DB en contenedor (Railway/Render/VPS con Docker)

## Convenciones transversales
- TypeScript estricto (`strict: true`) en frontend y backend.
- Nomenclatura: entidades/tablas en `snake_case` en DB, `camelCase` en TS, DTOs con sufijo `Dto` (`CreateCourseDto`), interfaces de dominio con sufijo claro (`CourseEntity`, `CourseResponse`).
- Respuestas de API consistentes: `{ data, meta }` para colecciones paginadas, `{ statusCode, message, errors }` para errores (filtro de excepciones global en Nest).
- Todo endpoint mutante (`POST/PATCH/DELETE`) requiere DTO validado + guard de rol explícito, incluso si "solo lo usa el admin" (no confiar en el frontend).
