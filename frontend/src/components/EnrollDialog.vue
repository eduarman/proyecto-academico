<template>
  <div v-if="visible" class="admin-dialog-backdrop" @click.self="close">
    <div class="admin-dialog enroll-dialog">
      <template v-if="step === 'confirm'">
        <p class="admin-dialog__title">Confirmar inscripción</p>
        <p class="enroll-dialog__text">¿Quieres inscribirte a <strong>"{{ course?.title }}"</strong>?</p>
        <p class="enroll-dialog__hint">
          Tu inscripción quedará en estado <strong>PENDIENTE</strong> hasta que el administrador la apruebe. Puedes
          cancelarla mientras esté pendiente desde "Mi perfil".
        </p>
        <div class="admin-dialog__actions">
          <button type="button" class="is-primary" :disabled="loading" @click="confirm">
            {{ loading ? 'Enviando…' : 'Sí, inscribirme' }}
          </button>
          <button type="button" class="is-secondary" @click="close">Cancelar</button>
        </div>
      </template>

      <template v-else-if="step === 'success'">
        <p class="admin-dialog__title">¡Inscripción enviada!</p>
        <p class="enroll-dialog__text">
          Tu inscripción a <strong>"{{ course?.title }}"</strong> quedó en estado <strong>PENDIENTE</strong>.
        </p>
        <p class="enroll-dialog__hint">
          El administrador debe aprobarla para que quede ACTIVA. Puedes revisar el estado en cualquier momento desde
          "Mi perfil".
        </p>
        <div class="admin-dialog__actions">
          <RouterLink to="/perfil" class="is-primary enroll-dialog__link" @click="close">Ver en Mi perfil</RouterLink>
          <button type="button" class="is-secondary" @click="close">Seguir explorando</button>
        </div>
      </template>

      <template v-else-if="step === 'error'">
        <p class="admin-dialog__title">No se pudo completar la inscripción</p>
        <p class="enroll-dialog__text enroll-dialog__text--error">{{ errorMessage }}</p>
        <div class="admin-dialog__actions">
          <button type="button" class="is-secondary" @click="close">Cerrar</button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import { useEnrollmentsStore } from '../stores/enrollments';

const enrollments = useEnrollmentsStore();

const visible = ref(false);
const step = ref('confirm');
const loading = ref(false);
const course = ref(null);
const errorMessage = ref('');

function open(courseObj) {
  course.value = courseObj;
  step.value = 'confirm';
  errorMessage.value = '';
  visible.value = true;
}

function close() {
  visible.value = false;
}

async function confirm() {
  loading.value = true;
  try {
    await enrollments.enroll(course.value.id);
    step.value = 'success';
  } catch (err) {
    errorMessage.value = err.response?.data?.message ?? 'No se pudo completar la inscripción';
    step.value = 'error';
  } finally {
    loading.value = false;
  }
}

defineExpose({ open });
</script>

<style scoped>
.enroll-dialog__text {
  font-size: 14px;
  color: var(--cursos-text);
  margin: 0 0 10px;
  line-height: 1.5;
}

.enroll-dialog__hint {
  font-size: 12.5px;
  color: var(--cursos-text-muted);
  margin: 0 0 18px;
  line-height: 1.5;
}

.enroll-dialog__text--error {
  margin-bottom: 18px;
}

.enroll-dialog__link {
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}
</style>
