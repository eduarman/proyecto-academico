# Requirements — Gestión de inscripciones

Referencia: [[product]] ("el admin gestiona las inscripciones de cada curso")

## Historias de usuario

### RF-INS-01 — Solicitar inscripción (estudiante)
**Como** estudiante, **quiero** inscribirme a un curso publicado, **para** participar en él.

- CUANDO el estudiante solicita inscripción a un curso `PUBLICADO` con cupos disponibles, ENTONCES el sistema DEBE crear una inscripción en estado `PENDIENTE`.
- CUANDO el curso no tiene cupos disponibles, ENTONCES el sistema DEBE rechazar con 409 ("cupo lleno").
- CUANDO el estudiante ya tiene una inscripción `PENDIENTE` o `ACTIVA` para ese mismo curso, ENTONCES el sistema DEBE rechazar duplicados (constraint único `userId+courseId` con estado no `CANCELADA`).

### RF-INS-02 — Gestionar inscripciones por curso (admin)
**Como** administrador, **quiero** ver y gestionar todas las inscripciones de un curso específico, **para** aprobar, rechazar o marcar avance.

- CUANDO el admin abre `/admin/cursos/:id/inscripciones`, ENTONCES el sistema DEBE listar todas las inscripciones de ese curso con datos del estudiante y estado.
- El admin DEBE poder cambiar el estado de una inscripción: `PENDIENTE → ACTIVA` (aprobar), `PENDIENTE → CANCELADA` (rechazar), `ACTIVA → COMPLETADA`, `ACTIVA → CANCELADA` (baja).
- CUANDO el admin intenta aprobar una inscripción pero el curso ya no tiene cupo (por condiciones de carrera), ENTONCES el sistema DEBE rechazar la transición con 409.
- Un usuario `ESTUDIANTE` que intente acceder a este listado o cambiar el estado de una inscripción ajena DEBE recibir 403.

### RF-INS-03 — Ver mis inscripciones (estudiante)
**Como** estudiante, **quiero** ver el estado de mis inscripciones, **para** saber si fui aceptado en un curso.

- CUANDO el estudiante abre `/mis-cursos`, ENTONCES el sistema DEBE listar solo sus propias inscripciones (nunca las de otros usuarios), con el estado actual y datos del curso.
- CUANDO una inscripción propia está `PENDIENTE`, ENTONCES el estudiante DEBE poder cancelarla (`PENDIENTE → CANCELADA` por el propio usuario); no puede cancelar una `COMPLETADA`.

### RF-INS-04 — Trazabilidad de estado
- Cada cambio de estado de inscripción DEBE registrar `fecha` del cambio relevante (`fechaInscripcion` al crear, `fechaFinalizacion` al completar).
- El sistema DEBE exponer un historial mínimo (estado actual + fechas clave); un log de auditoría exhaustivo queda fuera de alcance del MVP.

### RF-INS-05 — Validación de rol y propiedad
- El backend DEBE validar no solo el rol sino la **propiedad del recurso**: un estudiante solo puede leer/cancelar inscripciones donde `enrollment.userId === request.user.id`.
- El componente `EnrollmentTable.vue` en modo admin DEBE ocultar acciones de aprobar/rechazar para roles distintos de `ADMIN` (defensa en profundidad, no sustituye validación backend).

## Criterios de aceptación transversales
- Transiciones de estado inválidas (p. ej. `COMPLETADA → PENDIENTE`) DEBEN ser rechazadas por una máquina de estados explícita en el backend, no solo por el frontend.
