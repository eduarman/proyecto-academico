# Tasks — Autenticación

Specs: [[autenticacion-requirements]] · [[autenticacion-design]]

## Backend
- [ ] Prisma schema: `Role`, `User`, `RefreshToken`, `PasswordResetToken` + migración inicial
- [ ] Seed de roles (`ADMIN`, `ESTUDIANTE`)
- [ ] `AuthModule`: `AuthController`, `AuthService`
- [ ] `POST /auth/register` con `RegisterDto` (class-validator) — RF-AUTH-01
- [ ] `POST /auth/login` — genera access+refresh, setea cookie httpOnly — RF-AUTH-02
- [ ] `POST /auth/refresh` — rota refresh token — RF-AUTH-03
- [ ] `POST /auth/logout` — revoca refresh token — RF-AUTH-03
- [ ] `GET /auth/me`
- [ ] `POST /auth/forgot-password` / `POST /auth/reset-password` — RF-AUTH-04
- [ ] `JwtStrategy` (passport-jwt), `JwtAuthGuard`, `RolesGuard`, `@Roles()`, `@CurrentUser()`, `@Public()`
- [ ] Rate limiting (`@nestjs/throttler`) en login/register
- [ ] Tests: login válido/inválido, usuario inactivo, refresh válido/expirado, reset password

## Frontend
- [ ] `services/http.ts` (Axios) con interceptores request/response (refresh automático)
- [ ] `stores/auth.store.ts`: `user`, `accessToken`, `login`, `logout`, `fetchMe`, `isAuthenticated`, `role`
- [ ] `views/auth/LoginView.vue` + `components/auth/LoginForm.vue` (VeeValidate)
- [ ] `views/auth/RegisterView.vue` + `RegisterForm.vue`
- [ ] Flujo "olvidé mi contraseña" (2 vistas: solicitar + resetear con token de la URL)
- [ ] `router/guards.ts`: `requireAuth`, `requireRole` — RF-AUTH-05
- [ ] Vista `403.vue` (no autorizado)
- [ ] Tests (Vitest): store de auth, guard de rutas

## Definition of done
- [ ] Los 3 niveles de validación (UI/router/backend) verificados manualmente para login/registro
- [ ] Ningún response de auth expone `passwordHash` ni el refresh token en el body (solo cookie)
