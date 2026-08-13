# Tasks — Panel usuario (estudiante)

Specs: [[panel-usuario-requirements]] · [[panel-usuario-design]]
Depende de: [[gestion-cursos]], [[gestion-inscripciones]]

## Frontend
- [ ] `layouts/UserLayout.vue` (navbar: Catálogo, Mis cursos, Perfil)
- [ ] `router/routes/user.routes.ts` con `meta: { requiresAuth: true, roles: ['ESTUDIANTE'] }` — RF-USR-PNL-01
- [ ] Ruta `/perfil` compartida sin restricción de rol (solo `requiresAuth`)
- [ ] `components/common/EmptyState.vue` + integración en `MyCoursesView` — RF-USR-PNL-05
- [ ] `composables/useToast.ts` (feedback de éxito/error con mensaje del backend) — RF-USR-PNL-05
- [ ] Definir ruta de aterrizaje post-login para `ESTUDIANTE` (`/mis-cursos` sugerido)

## Definition of done
- [ ] `UserLayout` no renderiza ningún link a `/admin/*` para el rol estudiante
- [ ] Estado vacío de "Mis cursos" muestra CTA a catálogo cuando no hay inscripciones
