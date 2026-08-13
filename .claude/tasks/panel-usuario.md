# Tasks — Panel usuario (estudiante)

Specs: [[panel-usuario-requirements]] · [[panel-usuario-design]]
Depende de: [[gestion-cursos]], [[gestion-inscripciones]]

> Estado: **funcional**. Decisión distinta al plan original: el catálogo (`/catalogo`) es **público** (no requiere `requiresAuth`); solo se pide login al iniciar una inscripción, con redirect de vuelta al curso tras loguearse/registrarse.

## Frontend
- [x] `components/CursosTopNav.vue` (equivalente a `UserLayout` navbar) — Inicio / Mi perfil; en modo invitado muestra "Iniciar sesión" / "Regístrate" en vez del menú de usuario
- [x] Rutas con `meta: { requiresAuth: true, roles: ['ESTUDIANTE'] }` donde corresponde (p. ej. `/cursos/:id/contenido` exige auth pero no rol específico, se valida por inscripción)
- [x] Ruta `/perfil` compartida sin restricción de rol (solo `requiresAuth`) — RF-USR-PNL-01
- [ ] `components/common/EmptyState.vue` reusable — no existe; los estados vacíos son mensajes de texto inline (`.cursos-muted`) — RF-USR-PNL-05
- [ ] `composables/useToast.ts` — no existe; el feedback es vía `EnrollDialog.vue` (modal de confirmación/éxito/error) y mensajes inline por vista, no un sistema de toast global — RF-USR-PNL-05
- [x] Ruta de aterrizaje post-login para `ESTUDIANTE`: `/catalogo` (no `/mis-cursos` como sugería el plan — se decidió así porque el catálogo ahora es la landing pública general)

## Definition of done
- [x] `CursosTopNav` no renderiza ningún link a `/admin/*` para el rol estudiante
- [x] Estado vacío de "Mis cursos" (dentro de `ProfileView.vue`) muestra mensaje — sin CTA explícito a catálogo todavía (mejora menor pendiente)
