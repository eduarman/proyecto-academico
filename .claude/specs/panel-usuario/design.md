# Design — Panel usuario (estudiante)

Referencia: [[tech]], [[panel-usuario-requirements]] (RF-USR-PNL-01..05)

No define endpoints nuevos: reutiliza los de [[gestion-cursos-design]] y [[gestion-inscripciones-design]]. Este documento cubre solo composición de frontend.

## Layout
- `UserLayout.vue`: navbar (Catálogo, Mis cursos, Perfil) + info de sesión/logout. Envuelve rutas `/catalogo`, `/mis-cursos`, `/perfil`, `/cursos/:id`.

## Rutas (`router/routes/user.routes.ts`)
```ts
{
  path: '/',
  component: UserLayout,
  meta: { requiresAuth: true, roles: ['ESTUDIANTE'] },
  children: [
    { path: 'catalogo', name: 'catalog', component: CatalogView },
    { path: 'cursos/:id', name: 'course-detail', component: CourseDetailView },
    { path: 'mis-cursos', name: 'my-courses', component: MyCoursesView },
    { path: 'perfil', name: 'profile', component: ProfileView },
  ],
}
```
> `ProfileView` es en realidad accesible a ambos roles (ver [[gestion-usuarios-roles-design]]); en la implementación puede vivir fuera del bloque `roles: ['ESTUDIANTE']` o duplicarse como ruta compartida sin restricción de rol (solo `requiresAuth`).

## Componentes clave
- `CourseCard.vue`: usado en catálogo, muestra categoría (badge de color por categoría), cupos disponibles, botón "Ver detalle".
- `EnrollmentStatusBadge.vue`: reutilizado del módulo de inscripciones, colores: `PENDIENTE` (amarillo), `ACTIVA` (verde), `COMPLETADA` (azul), `CANCELADA` (gris).
- `EmptyState.vue` (common): usado en `/mis-cursos` cuando no hay inscripciones (RF-USR-PNL-05).

## Estado y feedback
- `enrollments.store.ts.enroll(courseId)` maneja loading/error y dispara un composable `useToast()` (wrapper simple sobre un sistema de notificaciones Bootstrap) con el mensaje de éxito/error devuelto por la API.
