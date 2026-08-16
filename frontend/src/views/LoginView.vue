<template>
  <div class="login-page">
    <div class="login-page__form-col">
      <div class="login-page__brand">
        <span class="login-page__mark">C</span>
        <span class="login-page__word">Cursia</span>
      </div>

      <template v-if="!showForgot">
        <h1 class="login-page__title">{{ admin ? 'Acceso administrador' : 'Bienvenido de nuevo' }}</h1>
        <p class="login-page__subtitle">
          {{
            admin
              ? 'Inicia sesión con tu cuenta de administrador para gestionar cursos, usuarios e inscripciones.'
              : 'Inicia sesión para continuar con tus cursos de Office, SQL, Análisis de Datos y Marketing.'
          }}
        </p>

        <p v-if="isEnrollIntent" class="login-page__intent">
          Inicia sesión como estudiante para completar tu inscripción. Si no tienes cuenta,
          <RouterLink :to="{ path: '/registro', query: route.query }">regístrate aquí</RouterLink>.
        </p>

        <form @submit.prevent="onSubmit">
          <div class="cursos-field">
            <label for="email">Correo electrónico</label>
            <input id="email" v-model="form.email" type="email" required />
          </div>
          <div class="cursos-field">
            <label for="password">Contraseña</label>
            <input id="password" v-model="form.password" type="password" required />
          </div>
          <div class="login-page__forgot-row">
            <a href="#" @click.prevent="showForgot = true">¿Olvidaste tu contraseña?</a>
          </div>

          <p v-if="error" class="cursos-form-error">{{ error }}</p>

          <button type="submit" class="cursos-submit" :disabled="loading">
            {{ loading ? 'Ingresando…' : 'Iniciar sesión' }}
          </button>
        </form>

        <p v-if="!admin" class="login-page__switch">
          ¿No tienes cuenta? <RouterLink :to="{ path: '/registro', query: route.query }">Regístrate</RouterLink>
        </p>

        <div class="login-page__demo">
          <strong>Cuenta de prueba:</strong><br />
          <template v-if="admin">admin@academia.com · contraseña <code>Admin123</code></template>
          <template v-else>estudiante@academia.com · contraseña <code>Estudiante123</code></template>
        </div>
      </template>

      <template v-else>
        <div class="login-page__forgot-panel">
          <template v-if="forgotSent">
            <p>
              Si el correo <strong>{{ forgotEmail }}</strong> existe en Cursia, te enviamos un enlace para
              restablecer tu contraseña.
            </p>
            <button type="button" class="admin-link-btn" @click="showForgot = false">Volver a iniciar sesión</button>
          </template>
          <template v-else>
            <p class="login-page__forgot-title">Recuperar contraseña</p>
            <div class="cursos-field">
              <input v-model="forgotEmail" type="email" placeholder="tu@correo.com" />
            </div>
            <div class="login-page__forgot-actions">
              <button type="button" class="cursos-submit" @click="onSendForgot">Enviar enlace</button>
              <button type="button" class="admin-link-btn" @click="showForgot = false">Cancelar</button>
            </div>
          </template>
        </div>
      </template>
    </div>

    <div class="login-page__hero-col">
      <div class="login-page__hero-inner">
        <template v-if="admin">
          <h2>Panel de administración</h2>
          <p>Gestiona cursos, categorías, usuarios e inscripciones de Cursia.</p>
        </template>
        <template v-else>
          <h2>Aprende a tu ritmo, desde donde estés.</h2>
          <p>
            Cursos prácticos de Office, SQL, Análisis de Datos y Marketing para estudiantes, profesionales y familias.
          </p>
          <div class="login-page__pills">
            <span>Office</span>
            <span>SQL</span>
            <span>Análisis de Datos</span>
            <span>Marketing</span>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const { admin } = defineProps({ admin: { type: Boolean, default: false } });

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

const isEnrollIntent = computed(() => !admin && route.query.intent === 'enroll');

const form = reactive({ email: '', password: '' });
const loading = ref(false);
const error = ref(null);

const showForgot = ref(false);
const forgotEmail = ref('');
const forgotSent = ref(false);

async function onSubmit() {
  loading.value = true;
  error.value = null;
  try {
    await auth.login({ ...form });
    if (admin && !auth.isAdmin) {
      auth.clearSession();
      error.value = 'Esta cuenta no tiene permisos de administrador.';
      return;
    }
    const redirect = route.query.redirect ?? (auth.isAdmin ? '/admin/cursos' : '/catalogo');
    router.push(redirect);
  } catch (err) {
    error.value = err.response?.data?.message ?? 'Credenciales inválidas';
  } finally {
    loading.value = false;
  }
}

async function onSendForgot() {
  if (!forgotEmail.value) return;
  await auth.forgotPassword(forgotEmail.value);
  forgotSent.value = true;
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  font-family: var(--cursos-font-body);
  background: var(--cursos-bg);
}

.login-page__form-col {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 64px 88px;
  max-width: 520px;
}

.login-page__brand {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 40px;
}

.login-page__mark {
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

.login-page__word {
  font-family: var(--cursos-font-heading);
  font-weight: 700;
  font-size: 19px;
  color: var(--cursos-text);
}

.login-page__title {
  font-family: var(--cursos-font-heading);
  font-size: 30px;
  font-weight: 700;
  color: var(--cursos-text);
  margin: 0 0 8px;
}

.login-page__subtitle {
  font-size: 15px;
  color: var(--cursos-text-muted);
  margin: 0 0 32px;
}

.login-page__intent {
  background: var(--cursos-accent-bg);
  color: var(--cursos-accent-hover);
  border-radius: 10px;
  padding: 12px 14px;
  font-size: 13.5px;
  margin: -18px 0 24px;
  line-height: 1.5;
}

.login-page__intent a {
  color: inherit;
  font-weight: 600;
}

.login-page__forgot-row {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 14px;
  margin-top: -8px;
}

.login-page__forgot-row a {
  font-size: 13px;
  color: var(--cursos-accent);
  text-decoration: none;
}

.login-page__switch {
  font-size: 14px;
  color: var(--cursos-text-muted);
  text-align: center;
  margin: 16px 0 24px;
}

.login-page__switch a {
  color: var(--cursos-accent);
  font-weight: 600;
  text-decoration: none;
}

.login-page__demo {
  background: var(--cursos-bg-cream);
  border-radius: 10px;
  padding: 14px 16px;
  font-size: 12.5px;
  color: var(--cursos-text-muted);
  line-height: 1.7;
}

.login-page__demo strong {
  color: var(--cursos-text);
}

.login-page__forgot-panel {
  background: var(--cursos-bg-cream);
  border: 1px solid var(--cursos-border-nav);
  border-radius: 14px;
  padding: 20px;
  font-size: 14px;
  color: var(--cursos-text);
}

.login-page__forgot-title {
  font-family: var(--cursos-font-heading);
  font-weight: 600;
  font-size: 15px;
  margin: 0 0 12px;
}

.login-page__forgot-actions {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-top: 4px;
}

.login-page__hero-col {
  background: var(--cursos-avatar-bg);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 64px;
}

.login-page__hero-inner {
  max-width: 380px;
  text-align: left;
}

.login-page__hero-inner h2 {
  font-family: var(--cursos-font-heading);
  font-size: 26px;
  font-weight: 700;
  color: #22394a;
  margin: 0 0 12px;
}

.login-page__hero-inner p {
  font-size: 14.5px;
  color: #3a5266;
  margin: 0 0 24px;
}

.login-page__pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.login-page__pills span {
  background: #fff;
  color: var(--cursos-text);
  font-size: 12.5px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 999px;
}

@media (max-width: 860px) {
  .login-page {
    grid-template-columns: 1fr;
  }

  .login-page__form-col {
    max-width: none;
    padding: 48px 24px;
  }

  .login-page__hero-col {
    display: none;
  }
}
</style>
