# Requirements — Panel administrador

Referencia: [[product]], depende de [[gestion-cursos-requirements]], [[gestion-inscripciones-requirements]], [[gestion-usuarios-roles-requirements]]

## Historias de usuario

### RF-ADM-01 — Layout y navegación exclusiva de admin
**Como** administrador, **quiero** un layout propio con navegación a cursos, inscripciones y usuarios, **para** gestionar todo desde un solo lugar.

- CUANDO un usuario con rol `ADMIN` inicia sesión, ENTONCES DEBE ser redirigido a `/admin` (dashboard) por defecto.
- CUANDO un usuario con rol `ESTUDIANTE` intenta navegar manualmente a cualquier ruta bajo `/admin/*`, ENTONCES el router DEBE bloquear el acceso y redirigir a `/403`, sin llegar a renderizar el layout admin.

### RF-ADM-02 — Dashboard con métricas básicas
**Como** administrador, **quiero** ver un resumen al entrar, **para** tener contexto rápido del estado de la plataforma.

- El dashboard DEBE mostrar: total de cursos publicados, total de inscripciones pendientes (requieren acción), total de usuarios activos.
- Los contadores DEBEN obtenerse de endpoints agregados del backend (no calculados trayendo listados completos al frontend).

### RF-ADM-03 — Acceso centralizado a gestión de cursos e inscripciones
- Desde el dashboard, el admin DEBE poder navegar directamente a "Cursos con inscripciones pendientes" (atajo a `/admin/cursos/:id/inscripciones` filtrado).

### RF-ADM-04 — Defensa en profundidad
- Cada vista/componente bajo `/admin` DEBE asumir que puede ser alcanzada incluso si el guard de router falla (defensa en profundidad): los componentes también verifican `authStore.user.role === 'ADMIN'` antes de disparar llamadas mutantes.
- Todos los endpoints consumidos por este panel ya están protegidos por `RolesGuard(['ADMIN'])` en su módulo correspondiente (no se definen endpoints nuevos aquí salvo el de métricas agregadas).
