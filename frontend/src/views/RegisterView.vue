<template>
  <div class="register-page">
    <div class="register-card">
      <div class="register-card__brand">
        <span class="register-card__mark">C</span>
        <span class="register-card__word">Cursia</span>
      </div>

      <template v-if="success">
        <div class="register-card__done">
          <div class="register-card__check">✓</div>
          <h2>Cuenta creada</h2>
          <p>Ya puedes iniciar sesión con {{ form.email }}.</p>
          <RouterLink :to="{ path: '/login', query: route.query }" class="cursos-submit register-card__cta">
            Ir a iniciar sesión
          </RouterLink>
        </div>
      </template>

      <template v-else>
        <h1 class="register-card__title">Crea tu cuenta</h1>
        <p class="register-card__subtitle">Regístrate como estudiante para acceder a los cursos.</p>

        <form @submit.prevent="onSubmit">
          <div class="cursos-field">
            <label for="firstName">Nombre</label>
            <input id="firstName" v-model="form.firstName" type="text" required minlength="2" />
          </div>
          <div class="cursos-field">
            <label for="lastName">Apellido</label>
            <input id="lastName" v-model="form.lastName" type="text" required minlength="2" />
          </div>
          <div class="cursos-field">
            <label for="email">Correo electrónico</label>
            <input id="email" v-model="form.email" type="email" required />
          </div>
          <div class="cursos-field">
            <label for="password">Contraseña</label>
            <input id="password" v-model="form.password" type="password" required minlength="8" />
          </div>
          <div class="cursos-field">
            <label for="confirm">Confirmar contraseña</label>
            <input id="confirm" v-model="confirm" type="password" required minlength="8" />
          </div>

          <div class="register-card__role-note">
            Rol asignado: <strong>Estudiante</strong>. Las cuentas de administrador las crea el equipo de Cursia.
          </div>

          <label class="register-card__terms">
            <input v-model="terms" type="checkbox" required />
            Acepto los términos de uso y la política de privacidad.
          </label>

          <p v-if="error" class="cursos-form-error">{{ error }}</p>

          <button type="submit" class="cursos-submit" :disabled="loading">
            {{ loading ? 'Creando…' : 'Crear cuenta' }}
          </button>
        </form>

        <p class="register-card__switch">
          ¿Ya tienes cuenta? <RouterLink :to="{ path: '/login', query: route.query }">Inicia sesión</RouterLink>
        </p>
      </template>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
const route = useRoute();

const form = reactive({ email: '', password: '', firstName: '', lastName: '' });
const confirm = ref('');
const terms = ref(false);
const loading = ref(false);
const error = ref(null);
const success = ref(false);

async function onSubmit() {
  error.value = null;
  if (form.password !== confirm.value) {
    error.value = 'Las contraseñas no coinciden.';
    return;
  }
  loading.value = true;
  try {
    await auth.register({ ...form });
    success.value = true;
  } catch (err) {
    error.value = err.response?.data?.message ?? 'No se pudo crear la cuenta';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--cursos-bg-cream);
  font-family: var(--cursos-font-body);
  padding: 40px;
}

.register-card {
  background: var(--cursos-bg);
  border-radius: 20px;
  box-shadow: 0 6px 24px rgba(43, 42, 40, 0.08);
  padding: 44px;
  width: 100%;
  max-width: 460px;
}

.register-card__brand {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 28px;
}

.register-card__mark {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: var(--cursos-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-family: var(--cursos-font-heading);
  font-weight: 700;
  font-size: 15px;
}

.register-card__word {
  font-family: var(--cursos-font-heading);
  font-weight: 700;
  font-size: 19px;
  color: var(--cursos-text);
}

.register-card__title {
  font-family: var(--cursos-font-heading);
  font-size: 24px;
  font-weight: 700;
  color: var(--cursos-text);
  margin: 0 0 6px;
}

.register-card__subtitle {
  font-size: 14px;
  color: var(--cursos-text-muted);
  margin: 0 0 24px;
}

.register-card__role-note {
  background: var(--cursos-bg-cream);
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 12.5px;
  color: var(--cursos-text-muted);
  margin-bottom: 14px;
}

.register-card__role-note strong {
  color: var(--cursos-text);
}

.register-card__terms {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
  color: var(--cursos-text);
  margin-bottom: 16px;
}

.register-card__switch {
  font-size: 14px;
  color: var(--cursos-text-muted);
  text-align: center;
  margin: 0;
}

.register-card__switch a {
  color: var(--cursos-accent);
  font-weight: 600;
  text-decoration: none;
}

.register-card__done {
  text-align: center;
  padding: 20px 0;
}

.register-card__check {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #e4eee4;
  color: #3e7a4e;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  margin: 0 auto 16px;
}

.register-card__done h2 {
  font-family: var(--cursos-font-heading);
  font-size: 20px;
  color: var(--cursos-text);
  margin: 0 0 8px;
}

.register-card__done p {
  font-size: 14px;
  color: var(--cursos-text-muted);
  margin: 0 0 24px;
}

.register-card__cta {
  display: inline-block;
  width: auto;
  text-decoration: none;
  padding: 12px 24px;
  margin: 0;
}
</style>
