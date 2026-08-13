# Requirements — Gestión de usuarios y roles

Referencia: [[product]]

## Historias de usuario

### RF-USR-01 — Listado y búsqueda de usuarios (admin)
**Como** administrador, **quiero** ver el listado de usuarios con filtros, **para** encontrar y gestionar cuentas.

- CUANDO el admin abre `/admin/usuarios`, ENTONCES el sistema DEBE listar usuarios paginados con email, nombre, rol y estado.
- El admin DEBE poder filtrar por rol y por estado (activo/inactivo) y buscar por nombre/email.
- Un usuario con rol distinto a `ADMIN` que intente acceder al endpoint de listado DEBE recibir 403.

### RF-USR-02 — Crear/editar usuario (admin)
**Como** administrador, **quiero** crear usuarios manualmente o editar sus datos y rol, **para** gestionar el equipo y estudiantes sin depender del autoregistro.

- CUANDO el admin crea un usuario con email ya existente, ENTONCES el sistema DEBE rechazar con 409.
- CUANDO el admin cambia el rol de un usuario, ENTONCES el cambio DEBE reflejarse inmediatamente en los permisos (el usuario afectado pierde/gana acceso en su próxima request, no requiere reiniciar sesión gracias a validación server-side por request).
- El admin NO DEBE poder autoeliminarse su propio rol de ADMIN si es el único admin activo del sistema (evitar bloqueo total del sistema).

### RF-USR-03 — Activar/desactivar usuario
**Como** administrador, **quiero** desactivar cuentas, **para** revocar acceso sin borrar el historial de inscripciones.

- CUANDO un usuario es marcado `INACTIVO`, ENTONCES sus sesiones activas (refresh tokens) DEBEN revocarse y no debe poder iniciar sesión nuevamente hasta reactivación.
- El sistema NO DEBE eliminar físicamente usuarios con inscripciones asociadas (borrado lógico vía `status`, no `DELETE` de fila).

### RF-USR-04 — Perfil propio
**Como** usuario autenticado (cualquier rol), **quiero** ver y editar mi propio perfil, **para** mantener mis datos actualizados.

- CUANDO el usuario edita su perfil (`PATCH /users/me`), ENTONCES DEBE poder cambiar nombre, apellido y contraseña, pero NUNCA su propio rol ni estado desde este endpoint.
- CUANDO el usuario cambia su contraseña, ENTONCES el sistema DEBE exigir la contraseña actual como confirmación.

### RF-USR-05 — Validación de permisos por componente
**Como** sistema, **quiero** que cada componente de UI relacionado a usuarios valide el rol antes de renderizarse o ejecutar acciones, **para** evitar exposición de funciones administrativas a estudiantes.

- Componentes de gestión de usuarios (tabla admin, formulario de creación, cambio de rol) DEBEN estar condicionados por el composable `usePermissions()` (`can('users:manage')`), además de la protección de ruta.
- Toda acción mutante de este módulo en backend DEBE pasar por `RolesGuard(['ADMIN'])`.

## Criterios de aceptación transversales
- Ningún endpoint de este módulo retorna `passwordHash`.
- Auditoría mínima: `updatedAt` se actualiza en cada cambio (suficiente para MVP; log de auditoría detallado queda fuera de alcance).
