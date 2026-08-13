# Design — Gestión de usuarios y roles

Referencia: [[tech]], [[gestion-usuarios-roles-requirements]] (RF-USR-01..05), modelo `User`/`Role` definido en [[autenticacion-design]]

## Endpoints (`/api/users`)
| Método | Ruta | Rol requerido | Descripción |
|---|---|---|---|
| GET | `/users` | ADMIN | Lista paginada, filtros `?role=&status=&q=` |
| GET | `/users/:id` | ADMIN | Detalle de usuario |
| POST | `/users` | ADMIN | Crea usuario (con rol asignado explícitamente) |
| PATCH | `/users/:id` | ADMIN | Edita datos/rol/estado |
| PATCH | `/users/me` | JWT (cualquier rol) | Edita perfil propio (sin rol/estado) |
| GET | `/roles` | ADMIN | Lista roles disponibles (para selects del formulario) |

## Reglas de negocio críticas (service layer)
- `UsersService.updateRole`: antes de degradar el rol de un ADMIN, cuenta `count(role=ADMIN, status=ACTIVO)`; si el resultado tras el cambio sería 0, lanza `ConflictException`.
- `UsersService.deactivate`: al pasar `status=INACTIVO`, ejecuta `refreshTokensRepo.revokeAllByUser(userId)`.
- `UsersService.updateOwnProfile`: DTO (`UpdateOwnProfileDto`) explícitamente **no** incluye `role` ni `status` como campos aceptados (aunque el body los traiga, se ignoran — whitelist estricta con `class-transformer`).

## Frontend
- **Vista**: `AdminUsersView.vue` (`/admin/usuarios`) — tabla (`UserTable.vue`) + filtros + modal `UserForm.vue` (crear/editar).
- **Store**: `users.store.ts` — `fetchUsers(filters)`, `createUser`, `updateUser`, `toggleStatus`.
- **Composable de permisos**: `usePermissions()` expone `can(action: string): boolean` derivado de `authStore.user.role`; usado para condicionar botones ("Crear usuario", "Cambiar rol") además del guard de ruta.
- **Perfil propio**: `ProfileView.vue` (`/perfil`), accesible a ambos roles, usa `PATCH /users/me`.

## Validación por capas (aplicado a este módulo)
1. UI: botones/menús de gestión de usuarios solo se renderizan si `can('users:manage')`.
2. Router: `/admin/usuarios` con `meta: { requiresAuth: true, roles: ['ADMIN'] }`.
3. Backend: `@Roles('ADMIN')` + `RolesGuard` en cada endpoint mutante de `/users` (excepto `/users/me`).
