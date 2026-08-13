<template>
  <header class="cursos-nav">
    <RouterLink to="/catalogo" class="cursos-nav__brand">
      <span class="cursos-nav__mark">C</span>
      <span class="cursos-nav__word">Cursia</span>
    </RouterLink>

    <nav class="cursos-nav__links">
      <RouterLink to="/catalogo" class="cursos-nav__link" :class="{ 'is-active': active === 'Inicio' }">
        Inicio
      </RouterLink>
      <RouterLink v-if="auth.isAuthenticated" to="/perfil" class="cursos-nav__link" :class="{ 'is-active': active === 'Perfil' }">
        Mi perfil
      </RouterLink>
    </nav>

    <RouterLink v-if="auth.isAuthenticated" to="/perfil" class="cursos-nav__user" title="Mi perfil">
      <span class="cursos-nav__username">{{ fullName }}</span>
      <span class="cursos-nav__avatar">{{ initials }}</span>
    </RouterLink>
    <div v-else class="cursos-nav__guest">
      <RouterLink to="/" class="cursos-nav__link">Iniciar sesión</RouterLink>
      <RouterLink to="/registro" class="cursos-nav__cta">Regístrate</RouterLink>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
const route = useRoute();

const active = computed(() => (route.name === 'perfil' ? 'Perfil' : 'Inicio'));
const fullName = computed(() => `${auth.user?.firstName ?? ''} ${auth.user?.lastName ?? ''}`.trim());
const initials = computed(() =>
  fullName.value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase(),
);
</script>

<style scoped>
.cursos-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 40px;
  background: var(--cursos-bg);
  border-bottom: 1px solid var(--cursos-border-nav);
  font-family: var(--cursos-font-body);
}

.cursos-nav__brand {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
}

.cursos-nav__mark {
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

.cursos-nav__word {
  font-family: var(--cursos-font-heading);
  font-weight: 700;
  font-size: 19px;
  color: var(--cursos-text);
}

.cursos-nav__links {
  display: flex;
  align-items: center;
  gap: 28px;
}

.cursos-nav__link {
  text-decoration: none;
  font-size: 15px;
  font-weight: 600;
  color: var(--cursos-text-muted);
  border-bottom: 2px solid transparent;
  padding-bottom: 4px;
}

.cursos-nav__link.is-active {
  color: var(--cursos-text);
  border-bottom-color: var(--cursos-accent);
}

.cursos-nav__user {
  display: flex;
  align-items: center;
  gap: 10px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  text-decoration: none;
}

.cursos-nav__username {
  font-size: 14px;
  color: var(--cursos-text);
  font-weight: 600;
}

.cursos-nav__avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--cursos-avatar-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--cursos-text);
  font-weight: 700;
  font-size: 13px;
}

.cursos-nav__guest {
  display: flex;
  align-items: center;
  gap: 20px;
}

.cursos-nav__cta {
  background: var(--cursos-accent);
  color: #fff;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  padding: 9px 16px;
  border-radius: 8px;
}

.cursos-nav__cta:hover {
  background: var(--cursos-accent-hover);
}
</style>
