# Tasks — Panel administrador

Specs: [[panel-administrador-requirements]] · [[panel-administrador-design]]
Depende de: [[gestion-usuarios-roles]], [[gestion-cursos]], [[gestion-inscripciones]]

## Backend
- [ ] `AdminModule` liviano con `GET /admin/metrics` (counts agregados) — RF-ADM-02

## Frontend
- [ ] `layouts/AdminLayout.vue` (sidebar + header)
- [ ] `router/routes/admin.routes.ts` con `meta: { requiresAuth: true, roles: ['ADMIN'] }` y children — RF-ADM-01
- [ ] `views/admin/AdminDashboardView.vue` + `components/common/StatCard.vue` — RF-ADM-02
- [ ] Atajo "Cursos con inscripciones pendientes" desde dashboard — RF-ADM-03
- [ ] Verificación defensiva de rol dentro de componentes clave (no confiar solo en el guard) — RF-ADM-04

## Definition of done
- [ ] Un estudiante que navega manualmente a `/admin` es redirigido a `/403` sin parpadeo de contenido admin
