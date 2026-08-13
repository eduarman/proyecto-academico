# Design — Panel administrador

Referencia: [[tech]], [[panel-administrador-requirements]] (RF-ADM-01..04)

## Endpoint de métricas
| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| GET | `/admin/metrics` | ADMIN | `{ cursosPublicados, inscripcionesPendientes, usuariosActivos }` — agregados vía `count()` de Prisma, sin traer filas completas |

`AdminMetricsController` puede vivir en un módulo liviano `AdminModule` que solo orquesta counts de `CoursesService`, `EnrollmentsService`, `UsersService` (no duplica lógica de negocio).

## Frontend

### Layout
- `AdminLayout.vue`: sidebar (Dashboard, Cursos, Usuarios) + header con datos del usuario/logout. Envuelve todas las rutas `/admin/*` vía router nested routes.

### Rutas (`router/routes/admin.routes.ts`)
```ts
{
  path: '/admin',
  component: AdminLayout,
  meta: { requiresAuth: true, roles: ['ADMIN'] },
  children: [
    { path: '', name: 'admin-dashboard', component: AdminDashboardView },
    { path: 'cursos', name: 'admin-courses', component: AdminCoursesView },
    { path: 'cursos/:id/inscripciones', name: 'admin-course-enrollments', component: AdminCourseEnrollmentsView },
    { path: 'usuarios', name: 'admin-users', component: AdminUsersView },
  ],
}
```
El guard global (`router.beforeEach`, definido en [[autenticacion-design]]) intercepta por `meta.roles` antes de resolver cualquier `children`.

### Dashboard
- `AdminDashboardView.vue`: 3 tarjetas de métricas (`StatCard.vue` en `components/common`) consumiendo `GET /admin/metrics`, + tabla resumida "Cursos con inscripciones pendientes" (reutiliza `courses.store` + `enrollments.store` con filtro).

### Composable de permisos compartido
`usePermissions()` (definido junto a [[gestion-usuarios-roles-design]]) se reutiliza en todo este panel para ocultar/mostrar acciones específicas, aunque el acceso a la vista completa ya está resuelto por el guard de ruta.
