# Tasks — Autenticación

Specs: [[autenticacion-requirements]] · [[autenticacion-design]]

> Estado: **funcional**. Diferencia principal con el plan: todo en memoria (`UsersService`), no Prisma/PostgreSQL.

## Backend
- [ ] Prisma schema: `Role`, `User`, `RefreshToken`, `PasswordResetToken` + migración inicial — en memoria en su lugar (`backend/src/modules/users/users.service.ts`, `auth.service.ts`)
- [x] Seed de roles (`ADMIN`, `ESTUDIANTE`) — hardcoded, no tabla `Role`
- [x] `AuthModule`: `AuthController`, `AuthService`
- [x] `POST /auth/register` con `RegisterDto` (class-validator) — RF-AUTH-01
- [x] `POST /auth/login` — genera access+refresh, setea cookie httpOnly (`sameSite=strict`) — RF-AUTH-02
- [x] `POST /auth/refresh` — rota refresh token — RF-AUTH-03
- [x] `POST /auth/logout` — revoca refresh token — RF-AUTH-03
- [x] `GET /auth/me` (requiere `AuthGuard('jwt')`; se agregó porque faltaba y dejaba `request.user` vacío)
- [x] `POST /auth/forgot-password` / `POST /auth/reset-password` — RF-AUTH-04
- [x] `PATCH /auth/password` — cambiar contraseña propia (no estaba en el spec original, se agregó para el flujo de perfil)
- [x] `JwtStrategy` (passport-jwt), `RolesGuard`, `@Roles()`, `OptionalJwtAuthGuard` (variante que no rechaza si no hay token — usada en catálogo público)
- [ ] `@CurrentUser()` / `@Public()` decorators — no se crearon, se usa `request.user` directo y guards explícitos por ruta
- [ ] Rate limiting (`@nestjs/throttler`) en login/register — no configurado
- [ ] Tests automatizados — no hay suite; se verificó manualmente (curl + Playwright) en cada cambio

## Frontend
- [x] `services/http.js` (Axios) con interceptores request/response (refresh automático en 401)
- [x] `stores/auth.js`: `user`, `accessToken`, `login`, `logout`, `register`, `updateProfile`, `changePassword`, `forgotPassword`, `init` (silent refresh al cargar la app), `isAuthenticated`, `isAdmin`
- [x] `views/LoginView.vue` — split-screen, incluye panel "olvidé mi contraseña" inline (sin vista separada)
- [x] `views/RegisterView.vue`
- [x] Flujo "olvidé mi contraseña" — inline en `LoginView.vue`, no dos vistas separadas
- [x] Guards de rol/auth — inline en `router/index.js` (`beforeEach`), no archivo `guards.ts` separado
- [ ] Vista `403.vue` dedicada — no existe; los redirects por rol van a `/catalogo` o `/admin/cursos` según corresponda
- [ ] Tests (Vitest) — no hay

## Definition of done
- [x] Los 3 niveles de validación (UI/router/backend) verificados manualmente — incluye caso real encontrado y corregido: `PATCH /users/me` permitía auto-escalar rol antes de la corrección
- [x] Ningún response de auth expone el hash de contraseña ni el refresh token en el body (solo cookie httpOnly)
