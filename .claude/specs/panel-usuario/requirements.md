# Requirements — Panel usuario (estudiante)

Referencia: [[product]], depende de [[gestion-cursos-requirements]], [[gestion-inscripciones-requirements]]

## Historias de usuario

### RF-USR-PNL-01 — Layout y navegación de estudiante
**Como** estudiante, **quiero** un layout con acceso a catálogo, mis cursos y perfil, **para** navegar mi experiencia sin ver opciones administrativas.

- CUANDO un usuario con rol `ESTUDIANTE` inicia sesión, ENTONCES DEBE ser redirigido a `/catalogo` o `/mis-cursos` por defecto (a definir en implementación, sugerido: `/mis-cursos`).
- El layout de estudiante NUNCA DEBE renderizar enlaces a rutas `/admin/*`, incluso si se manipula el DOM manualmente (el guard de ruta backend-validado es la protección real).

### RF-USR-PNL-02 — Catálogo y detalle
- Ver [[gestion-cursos-requirements]] RF-CUR-04 (catálogo público filtrado por categoría).

### RF-USR-PNL-03 — Mis cursos
- Ver [[gestion-inscripciones-requirements]] RF-INS-03 (listado propio + cancelación de pendientes).

### RF-USR-PNL-04 — Perfil
- Ver [[gestion-usuarios-roles-requirements]] RF-USR-04 (edición de datos propios, cambio de contraseña).

### RF-USR-PNL-05 — Estado vacío y feedback
**Como** estudiante nuevo sin inscripciones, **quiero** ver un mensaje claro y un llamado a la acción, **para** saber qué hacer a continuación.

- CUANDO `/mis-cursos` no tiene inscripciones, ENTONCES el sistema DEBE mostrar un estado vacío con botón "Explorar catálogo" en vez de una tabla vacía sin contexto.
- Toda acción del estudiante (inscribirse, cancelar) DEBE dar feedback inmediato (toast/alert) de éxito o error, usando el mensaje que retorna el backend.
