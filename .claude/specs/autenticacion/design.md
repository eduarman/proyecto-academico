# Design — Autenticación

Referencia: [[tech]], [[autenticacion-requirements]] (RF-AUTH-01..05)

## Modelo de datos (Prisma)
```prisma
model Role {
  id    Int    @id @default(autoincrement())
  name  String @unique // "ADMIN" | "ESTUDIANTE"
  users User[]
}

model User {
  id            String   @id @default(uuid())
  email         String   @unique
  passwordHash  String
  firstName     String
  lastName      String
  status        UserStatus @default(ACTIVO)
  roleId        Int
  role          Role     @relation(fields: [roleId], references: [id])
  refreshTokens RefreshToken[]
  enrollments   Enrollment[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

enum UserStatus {
  ACTIVO
  INACTIVO
}

model RefreshToken {
  id        String   @id @default(uuid())
  tokenHash String
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  expiresAt DateTime
  revokedAt DateTime?
  createdAt DateTime @default(now())
}

model PasswordResetToken {
  id        String   @id @default(uuid())
  tokenHash String
  userId    String
  expiresAt DateTime
  usedAt    DateTime?
  createdAt DateTime @default(now())
}
```

## Endpoints (`/api/auth`)
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/auth/register` | pública | Crea usuario rol ESTUDIANTE |
| POST | `/auth/login` | pública | Retorna `{ accessToken, user }`, setea cookie `refresh_token` |
| POST | `/auth/refresh` | cookie refresh | Rota refresh token, retorna nuevo `accessToken` |
| POST | `/auth/logout` | JWT | Revoca refresh token, limpia cookie |
| GET | `/auth/me` | JWT | Retorna perfil + rol del usuario actual |
| POST | `/auth/forgot-password` | pública | Genera `PasswordResetToken` (respuesta genérica siempre 200) |
| POST | `/auth/reset-password` | pública + token | Valida token, actualiza `passwordHash` |

## Flujo de login (secuencia)
1. Frontend envía `{ email, password }` a `POST /auth/login`.
2. `AuthService.validateUser`: busca por email, compara hash con bcrypt, verifica `status === ACTIVO`.
3. `AuthService.login`: firma access token (`sub`, `role`, exp 15m) y refresh token (uuid random, exp 7d); persiste hash del refresh token en `refresh_tokens`.
4. Controller setea cookie `refresh_token` (httpOnly, Secure, SameSite=Strict, path=/api/auth/refresh) y retorna `{ accessToken, user: { id, email, firstName, lastName, role } }`.
5. Frontend guarda `accessToken` y `user` en el store `auth` (memoria, Pinia — no persistido en localStorage).

## Flujo de refresh automático (frontend)
- Interceptor de Axios: si una respuesta es 401 y no es un reintento, llama a `POST /auth/refresh` (cookie va automática), actualiza `accessToken` en el store y reintenta la request original.
- Si `/auth/refresh` también falla → `authStore.logout()` + redirect a `/login?redirect=<rutaActual>`.

## Guards y decoradores (backend)
- `JwtAuthGuard`: valida y decodifica access token, adjunta `request.user`.
- `RolesGuard` + `@Roles('ADMIN')`: compara `request.user.role` contra roles permitidos del handler; si no coincide → 403.
- `@CurrentUser()`: decorator para inyectar `request.user` en el controller.
- Aplicados globalmente vía `APP_GUARD` con excepción explícita (`@Public()`) en endpoints de auth pública.

## Guards de router (frontend)
```ts
// router/guards.ts
requireAuth: si !authStore.isAuthenticated → next('/login?redirect=' + to.fullPath)
requireRole(...roles): si rol del usuario no está en `roles` → next('/403')
```
Aplicado en `meta: { requiresAuth: true, roles: ['ADMIN'] }` de cada ruta (ver [[panel-administrador-design]], [[panel-usuario-design]]).

## Seguridad
- Password hashing: bcrypt, cost factor 12.
- Rate limiting en `/auth/login` y `/auth/register`: `@nestjs/throttler` (p. ej. 5 intentos/min por IP).
- Mensajes de error de auth genéricos para no filtrar existencia de cuentas (enumeration attacks).
- Refresh token siempre hasheado en DB (nunca se guarda en texto plano, igual que password).
