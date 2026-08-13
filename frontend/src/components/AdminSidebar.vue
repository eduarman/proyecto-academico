<template>
  <div class="admin-shell">
    <aside class="admin-sidebar">
      <div class="admin-sidebar__brand">
        <span class="admin-sidebar__mark">C</span>
        <span class="admin-sidebar__word">Cursia</span>
      </div>
      <nav class="admin-sidebar__nav">
        <RouterLink to="/admin/cursos" class="admin-sidebar__link" :class="{ 'is-active': route.name === 'admin-cursos' }">
          📚 Cursos
        </RouterLink>
        <RouterLink
          to="/admin/inscripciones"
          class="admin-sidebar__link"
          :class="{ 'is-active': route.name === 'admin-inscripciones' }"
        >
          🧾 Inscripciones
        </RouterLink>
        <RouterLink
          to="/admin/usuarios"
          class="admin-sidebar__link"
          :class="{ 'is-active': route.name === 'admin-usuarios' }"
        >
          👥 Usuarios y roles
        </RouterLink>
        <RouterLink
          to="/admin/categorias"
          class="admin-sidebar__link"
          :class="{ 'is-active': route.name === 'admin-categorias' }"
        >
          🏷️ Categorías
        </RouterLink>
        <RouterLink to="/perfil" class="admin-sidebar__link admin-sidebar__link--top-gap">⚙️ Mi perfil</RouterLink>
        <button type="button" class="admin-sidebar__link admin-sidebar__link--danger" @click="onLogout">
          ↩ Cerrar sesión
        </button>
      </nav>
    </aside>
    <main class="admin-main">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

async function onLogout() {
  await auth.logout();
  router.push('/');
}
</script>
