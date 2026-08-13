# Tasks — Gestión de usuarios y roles

Specs: [[gestion-usuarios-roles-requirements]] · [[gestion-usuarios-roles-design]]
Depende de: [[autenticacion]]

> Estado: **funcional**, con algunos gaps de robustez pendientes (ver abajo). `UsersService` es ahora la única fuente de verdad de usuarios (antes `AuthService` mantenía su propia copia duplicada — corregido en esta sesión).

## Backend
- [x] `UsersModule`: `UsersController`, `UsersService`
- [x] `GET /users` con filtros `role`/`status` — **sin paginación** ni filtro de texto `q`
- [x] `GET /users/:id`
- [ ] `POST /users` dedicado — no existe; el frontend crea usuarios reusando `POST /auth/register` + `PATCH /users/:id` para asignar el rol — RF-USR-02
- [x] `PATCH /users/:id` (rol/estado) — RF-USR-02/03
- [ ] Regla "no degradar único admin activo" — **no implementada** (gap real: se puede dejar la plataforma sin ningún admin)
- [x] `PATCH /users/me` — whitelist sin `role`/`status` (bug de seguridad real encontrado y corregido: antes aceptaba `role` del body y permitía auto-escalar a ADMIN) — RF-USR-04
- [ ] `GET /roles` — no existe; los roles están hardcoded en el frontend (`ADMIN`/`ESTUDIANTE`)
- [ ] Al desactivar usuario, revocar refresh tokens — **no implementado** (un usuario desactivado con un access token vigente sigue pudiendo usarlo hasta que expire, ~15 min)
- [x] Guards `@Roles('ADMIN')` en todos los endpoints excepto `/users/me`
- [ ] Tests automatizados — no hay; verificado manualmente (incluye prueba explícita de que un estudiante no puede auto-promoverse)

## Frontend
- [ ] `composables/usePermissions.ts` — no existe; los checks de rol son inline (`auth.user?.role === 'ADMIN'`) en cada vista
- [x] `stores/users.js`
- [x] `views/admin/AdminUsersView.vue` — tabla + diálogo de creación inline (sin `UserTable.vue`/`UserForm.vue`/`RoleSelect.vue` separados); cambio de rol y estado inline en la tabla
- [x] `views/ProfileView.vue` compartida, sin campos de rol/estado editables por el propio usuario
- [x] Acciones de gestión de usuarios ocultas para no-admin (ruta protegida por rol)

## Definition of done
- [x] Intentar cambiar el propio rol vía `PATCH /users/me` — confirmado que el backend lo ignora (probado con curl directo, no solo desde la UI)
