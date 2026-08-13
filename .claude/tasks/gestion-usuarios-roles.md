# Tasks — Gestión de usuarios y roles

Specs: [[gestion-usuarios-roles-requirements]] · [[gestion-usuarios-roles-design]]
Depende de: [[autenticacion]]

## Backend
- [ ] `UsersModule`: `UsersController`, `UsersService`
- [ ] `GET /users` con paginación + filtros `role`/`status`/`q` — RF-USR-01
- [ ] `GET /users/:id`
- [ ] `POST /users` (`CreateUserDto`) — RF-USR-02
- [ ] `PATCH /users/:id` (`UpdateUserDto`, incluye rol/estado) — RF-USR-02/03, con regla "no degradar único admin activo"
- [ ] `PATCH /users/me` (`UpdateOwnProfileDto` — whitelist sin `role`/`status`) — RF-USR-04
- [ ] `GET /roles`
- [ ] Al desactivar usuario: revocar refresh tokens — RF-USR-03
- [ ] Guards `@Roles('ADMIN')` en todos los endpoints excepto `/users/me`
- [ ] Tests: creación duplicada, degradar único admin (debe fallar), desactivar revoca sesión

## Frontend
- [ ] `composables/usePermissions.ts` (`can(action)` basado en `authStore.user.role`)
- [ ] `stores/users.store.ts`
- [ ] `views/admin/AdminUsersView.vue` + `components/users/UserTable.vue` + `UserForm.vue` + `RoleSelect.vue`
- [ ] `views/user/ProfileView.vue` (compartida, sin campos rol/estado)
- [ ] Ocultar acciones de gestión si `!can('users:manage')` — RF-USR-05

## Definition of done
- [ ] Intentar cambiar el propio rol vía DevTools/Postman contra `/users/me` — confirmar que el backend lo ignora
