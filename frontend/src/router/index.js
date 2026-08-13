import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import CatalogView from '../views/CatalogView.vue';
import CourseDetailView from '../views/CourseDetailView.vue';
import CourseContentView from '../views/CourseContentView.vue';
import ProfileView from '../views/ProfileView.vue';
import AdminCoursesView from '../views/admin/AdminCoursesView.vue';
import AdminEnrollmentsView from '../views/admin/AdminEnrollmentsView.vue';
import AdminUsersView from '../views/admin/AdminUsersView.vue';
import AdminCategoriesView from '../views/admin/AdminCategoriesView.vue';
import AdminCourseContentView from '../views/admin/AdminCourseContentView.vue';

const routes = [
  { path: '/', name: 'login', component: LoginView, meta: { guestOnly: true } },
  { path: '/registro', name: 'registro', component: RegisterView, meta: { guestOnly: true } },
  // Catálogo y detalle de curso son públicos: se puede navegar sin sesión.
  // La inscripción sí exige login (se pide al hacer clic en "Inscribirme").
  { path: '/catalogo', name: 'catalogo', component: CatalogView },
  { path: '/cursos/:id', name: 'curso-detalle', component: CourseDetailView },
  {
    path: '/cursos/:id/contenido',
    name: 'curso-contenido',
    component: CourseContentView,
    meta: { requiresAuth: true },
  },
  { path: '/perfil', name: 'perfil', component: ProfileView, meta: { requiresAuth: true } },
  { path: '/mis-cursos', redirect: '/perfil' },
  {
    path: '/admin/cursos',
    name: 'admin-cursos',
    component: AdminCoursesView,
    meta: { requiresAuth: true, roles: ['ADMIN'] },
  },
  {
    path: '/admin/inscripciones',
    name: 'admin-inscripciones',
    component: AdminEnrollmentsView,
    meta: { requiresAuth: true, roles: ['ADMIN'] },
  },
  {
    path: '/admin/usuarios',
    name: 'admin-usuarios',
    component: AdminUsersView,
    meta: { requiresAuth: true, roles: ['ADMIN'] },
  },
  {
    path: '/admin/categorias',
    name: 'admin-categorias',
    component: AdminCategoriesView,
    meta: { requiresAuth: true, roles: ['ADMIN'] },
  },
  {
    path: '/admin/cursos/:id/contenido',
    name: 'admin-curso-contenido',
    component: AdminCourseContentView,
    meta: { requiresAuth: true, roles: ['ADMIN'] },
  },
  { path: '/admin', redirect: '/admin/cursos' },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const auth = useAuthStore();

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }

  if (to.meta.roles && !to.meta.roles.includes(auth.user?.role)) {
    return { name: auth.isAdmin ? 'admin-cursos' : 'catalogo' };
  }

  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { name: auth.isAdmin ? 'admin-cursos' : 'catalogo' };
  }

  return true;
});

export default router;
