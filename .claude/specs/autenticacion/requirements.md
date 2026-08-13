# Requirements — Autenticación

Referencia: [[product]], [[tech]]

## Historias de usuario

### RF-AUTH-01 — Registro
**Como** visitante, **quiero** crear una cuenta con email y contraseña, **para** poder inscribirme a cursos.

- CUANDO el visitante envía el formulario de registro con email, contraseña, nombre y apellido válidos, ENTONCES el sistema DEBE crear el usuario con rol `ESTUDIANTE` por defecto y estado `ACTIVO`.
- CUANDO el email ya existe en la base de datos, ENTONCES el sistema DEBE rechazar el registro con error 409 y mensaje claro, sin revelar si el email pertenece a otro usuario de forma ambigua.
- CUANDO la contraseña no cumple la política (mínimo 8 caracteres, 1 mayúscula, 1 número), ENTONCES el sistema DEBE rechazar el registro con detalle del campo inválido.
- La contraseña NUNCA se almacena ni se transmite en texto plano fuera del canal HTTPS de envío inicial; se hashea antes de persistir.

### RF-AUTH-02 — Login
**Como** usuario registrado, **quiero** iniciar sesión con email y contraseña, **para** acceder a mi panel según mi rol.

- CUANDO las credenciales son correctas, ENTONCES el sistema DEBE emitir un access token (JWT, 15 min) en la respuesta y un refresh token en cookie httpOnly.
- CUANDO las credenciales son incorrectas, ENTONCES el sistema DEBE responder 401 con mensaje genérico ("credenciales inválidas"), sin indicar si el email existe.
- CUANDO el usuario está `INACTIVO`, ENTONCES el sistema DEBE rechazar el login con 403 y mensaje específico.
- El sistema DEBE limitar intentos de login (rate limiting) para mitigar fuerza bruta.

### RF-AUTH-03 — Sesión persistente / refresh
**Como** usuario autenticado, **quiero** que mi sesión se renueve automáticamente, **para** no tener que loguearme cada 15 minutos.

- CUANDO el access token expira y existe un refresh token válido, ENTONCES el frontend DEBE solicitar un nuevo access token de forma transparente al usuario.
- CUANDO el refresh token es inválido, expiró o fue revocado, ENTONCES el sistema DEBE forzar logout y redirigir a `/login`.
- CUANDO el usuario hace logout explícito, ENTONCES el sistema DEBE revocar el refresh token en base de datos y limpiar la cookie.

### RF-AUTH-04 — Recuperación de contraseña
**Como** usuario que olvidó su contraseña, **quiero** poder restablecerla vía email, **para** recuperar acceso a mi cuenta.

- CUANDO el usuario solicita recuperación con un email existente, ENTONCES el sistema DEBE generar un token de un solo uso con expiración (p. ej. 30 min) y (en MVP) loguearlo/mockearlo en vez de enviar email real.
- CUANDO el email no existe, ENTONCES el sistema DEBE responder con el mismo mensaje genérico de éxito (no revelar existencia de cuentas).
- CUANDO el token de reseteo es válido y no expiró, ENTONCES el sistema DEBE permitir definir una nueva contraseña y DEBE invalidar el token tras el uso.

### RF-AUTH-05 — Validación de sesión en frontend
**Como** sistema, **quiero** validar en cada componente protegido si el usuario tiene sesión y rol adecuado, **para** no exponer contenido no autorizado.

- CUANDO un usuario sin sesión intenta acceder a una ruta protegida, ENTONCES el router DEBE redirigir a `/login` conservando la ruta destino (`redirect` query).
- CUANDO un usuario autenticado intenta acceder a una ruta de un rol distinto al suyo, ENTONCES el router DEBE redirigir a una vista `403/No autorizado` (no a login).
- El estado de autenticación (usuario, rol, expiración) DEBE vivir en el store `auth` y ser la única fuente de verdad en frontend.

## Criterios de aceptación transversales
- Todos los endpoints de auth validan DTO de entrada (formato email, longitud password) antes de tocar la base de datos.
- Ningún endpoint de auth devuelve el hash de contraseña en la respuesta.
- Cobertura de test mínima: casos felices + credenciales inválidas + usuario inactivo + token expirado, tanto backend (Jest) como flujo de formulario (Vitest).
