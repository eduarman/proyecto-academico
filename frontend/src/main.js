import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router';
import App from './App.vue';
import { useAuthStore } from './stores/auth';
import './styles/main.scss';

const app = createApp(App);
app.use(createPinia());

// La sesión debe restaurarse (silent refresh) ANTES de instalar el router: Vue Router
// resuelve la ruta inicial en cuanto se instala (no espera a app.mount), así que si el
// router se instala primero, el guard de roles corre con auth.user todavía vacío.
useAuthStore()
  .init()
  .finally(() => {
    app.use(router);
    app.mount('#app');
  });
