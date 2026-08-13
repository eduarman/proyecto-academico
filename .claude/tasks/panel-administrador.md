# Tasks — Panel administrador

Specs: [[panel-administrador-requirements]] · [[panel-administrador-design]]
Depende de: [[gestion-usuarios-roles]], [[gestion-cursos]], [[gestion-inscripciones]]

> Estado: **funcional** como conjunto de vistas de gestión; no existe el dashboard de métricas agregadas planeado originalmente.

## Backend
- [ ] `GET /admin/metrics` (counts agregados) — no existe — RF-ADM-02

## Frontend
- [x] `components/AdminSidebar.vue` (equivalente a `AdminLayout.vue`) — sidebar con Cursos / Inscripciones / Usuarios y roles / Categorías / Mi perfil / Cerrar sesión
- [x] Rutas admin (`/admin/cursos`, `/admin/inscripciones`, `/admin/usuarios`, `/admin/categorias`, `/admin/cursos/:id/contenido`) con `meta: { requiresAuth: true, roles: ['ADMIN'] }` — RF-ADM-01
- [ ] `AdminDashboardView.vue` + `StatCard.vue` — no existe; `/admin/cursos` (gestión de cursos) es la landing de admin directamente, sin panel de métricas — RF-ADM-02
- [ ] Atajo "Cursos con inscripciones pendientes" desde dashboard — no existe (no hay dashboard) — RF-ADM-03
- [x] Verificación defensiva de rol: router guard (frontend) + `RolesGuard`/`@Roles('ADMIN')` (backend) en cada endpoint mutante — RF-ADM-04

## Definition of done
- [x] Un estudiante que navega manualmente a `/admin/*` es redirigido — a `/catalogo`, no a una página `/403` dedicada (no existe esa vista). Verificado también que el backend rechaza (403) las llamadas directas a la API sin pasar por el guard del frontend.
