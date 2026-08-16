<template>
  <div class="profile-page">
    <CursosTopNav />

    <div class="profile-content">
      <div class="profile-left">
        <div class="profile-card profile-card--center">
          <div class="profile-avatar">{{ initials }}</div>
          <p class="profile-name">{{ auth.user?.firstName }} {{ auth.user?.lastName }}</p>
          <p class="profile-email">{{ auth.user?.email }}</p>
          <span class="cursos-tag">{{ auth.user?.role === 'ADMIN' ? 'Administrador' : 'Estudiante' }}</span>

          <form v-if="editing" class="profile-edit-form" @submit.prevent="onSaveProfile">
            <div class="cursos-field">
              <label for="firstName">Nombre</label>
              <input id="firstName" v-model="editForm.firstName" type="text" required minlength="2" />
            </div>
            <div class="cursos-field">
              <label for="lastName">Apellido</label>
              <input id="lastName" v-model="editForm.lastName" type="text" required minlength="2" />
            </div>
            <div class="profile-edit-actions">
              <button type="submit" class="profile-btn-primary">Guardar</button>
              <button type="button" class="profile-btn-secondary" @click="editing = false">Cancelar</button>
            </div>
          </form>
          <button v-else type="button" class="profile-edit-btn" @click="startEdit">Editar perfil</button>
        </div>

        <div class="profile-card">
          <p class="profile-card__title">Cambiar contraseña</p>
          <form @submit.prevent="onChangePassword">
            <div class="cursos-field">
              <input v-model="passwordForm.currentPassword" type="password" placeholder="Contraseña actual" required />
            </div>
            <div class="cursos-field">
              <input
                v-model="passwordForm.newPassword"
                type="password"
                placeholder="Nueva contraseña"
                required
                minlength="8"
              />
            </div>
            <div class="cursos-field">
              <input
                v-model="passwordConfirm"
                type="password"
                placeholder="Confirmar nueva contraseña"
                required
                minlength="8"
              />
            </div>
            <p v-if="passwordMsg" class="profile-password-msg" :class="passwordMsg.type">{{ passwordMsg.text }}</p>
            <button type="submit" class="admin-btn-primary">Actualizar contraseña</button>
          </form>
        </div>

        <button type="button" class="profile-logout" @click="onLogout">Cerrar sesión</button>
      </div>

      <div class="profile-right">
        <h2 class="cursos-section__title">Mis cursos</h2>

        <div v-if="enrollments.loading" class="cursos-muted">Cargando…</div>
        <div v-else-if="!visibleEnrollments.length" class="cursos-muted">Todavía no tienes inscripciones.</div>

        <div v-else class="profile-enrollment-list">
          <div v-for="entry in visibleEnrollments" :key="entry.id" class="profile-enrollment-card">
            <div class="cursos-thumb cursos-thumb--sm">{{ categoryIcon(courseOf(entry.courseId)?.category) }}</div>
            <div class="profile-enrollment-body">
              <p class="profile-enrollment-title">{{ courseOf(entry.courseId)?.title ?? entry.courseId }}</p>
              <span class="cursos-status" :class="`cursos-status--${entry.status.toLowerCase()}`">
                {{ entry.status }}
              </span>
            </div>
            <div class="profile-enrollment-actions">
              <RouterLink
                v-if="entry.status === 'ACTIVA' || entry.status === 'COMPLETADA'"
                class="admin-link-btn"
                :to="`/cursos/${entry.courseId}/contenido`"
              >
                Ver contenido
              </RouterLink>
              <button
                v-if="entry.status === 'PENDIENTE'"
                class="admin-link-btn admin-link-btn--danger"
                :disabled="cancelling === entry.id"
                @click="onCancel(entry.id)"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import CursosTopNav from '../components/CursosTopNav.vue';
import { useAuthStore } from '../stores/auth';
import { useCoursesStore } from '../stores/courses';
import { useEnrollmentsStore } from '../stores/enrollments';

const CATEGORY_ICON = { OFFICE: '📊', SQL: '🗄️', ANALISIS_DATOS: '📈', MARKETING: '📣' };

// Un estudiante puede reinscribirse tras cancelar, así que puede haber varias
// inscripciones históricas para el mismo curso. Mostramos solo la más relevante
// (ACTIVA/PENDIENTE por encima de estados terminales) para no saturar "Mis cursos".
const STATUS_PRIORITY = { ACTIVA: 3, PENDIENTE: 2, COMPLETADA: 1, CANCELADA: 0 };

function isMoreRelevant(candidate, current) {
  const candidatePriority = STATUS_PRIORITY[candidate.status] ?? 0;
  const currentPriority = STATUS_PRIORITY[current.status] ?? 0;
  if (candidatePriority !== currentPriority) return candidatePriority > currentPriority;
  return new Date(candidate.createdAt) > new Date(current.createdAt);
}

const auth = useAuthStore();
const courses = useCoursesStore();
const enrollments = useEnrollmentsStore();
const router = useRouter();

const editing = ref(false);
const editForm = reactive({ firstName: '', lastName: '' });
const cancelling = ref(null);

const passwordForm = reactive({ currentPassword: '', newPassword: '' });
const passwordConfirm = ref('');
const passwordMsg = ref(null);

const initials = computed(() =>
  `${auth.user?.firstName?.[0] ?? ''}${auth.user?.lastName?.[0] ?? ''}`.toUpperCase(),
);

function categoryIcon(value) {
  return CATEGORY_ICON[value] ?? '📚';
}

const visibleEnrollments = computed(() => {
  const byCourse = new Map();
  for (const entry of enrollments.mine) {
    const current = byCourse.get(entry.courseId);
    if (!current || isMoreRelevant(entry, current)) {
      byCourse.set(entry.courseId, entry);
    }
  }
  return Array.from(byCourse.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
});

function courseOf(courseId) {
  return courses.items.find((course) => course.id === courseId);
}

function startEdit() {
  editForm.firstName = auth.user?.firstName ?? '';
  editForm.lastName = auth.user?.lastName ?? '';
  editing.value = true;
}

async function onSaveProfile() {
  await auth.updateProfile({ ...editForm });
  editing.value = false;
}

async function onChangePassword() {
  passwordMsg.value = null;
  if (passwordForm.newPassword !== passwordConfirm.value) {
    passwordMsg.value = { type: 'error', text: 'Las contraseñas no coinciden.' };
    return;
  }
  try {
    await auth.changePassword({ ...passwordForm });
    passwordMsg.value = { type: 'success', text: 'Contraseña actualizada.' };
    passwordForm.currentPassword = '';
    passwordForm.newPassword = '';
    passwordConfirm.value = '';
  } catch (err) {
    passwordMsg.value = { type: 'error', text: err.response?.data?.message ?? 'No se pudo actualizar la contraseña' };
  }
}

async function onCancel(id) {
  cancelling.value = id;
  try {
    await enrollments.changeStatus(id, 'CANCELADA');
  } finally {
    cancelling.value = null;
  }
}

async function onLogout() {
  const wasAdmin = auth.isAdmin;
  await auth.logout();
  router.push(wasAdmin ? '/admin/login' : '/login');
}

onMounted(async () => {
  await Promise.all([enrollments.fetchMine(), courses.fetchCourses()]);
});
</script>

<style scoped>
.profile-page {
  font-family: var(--cursos-font-body);
  background: var(--cursos-bg);
  min-height: 100vh;
}

.profile-content {
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 40px 80px;
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: 32px;
}

.profile-card {
  border: 1px solid var(--cursos-border);
  border-radius: 16px;
  padding: 22px;
}

.profile-card--center {
  text-align: center;
  padding: 24px;
}

.profile-avatar {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  background: var(--cursos-avatar-bg);
  color: var(--cursos-text);
  font-weight: 700;
  font-size: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 14px;
}

.profile-name {
  font-family: var(--cursos-font-heading);
  font-size: 17px;
  font-weight: 700;
  color: var(--cursos-text);
  margin: 0 0 4px;
}

.profile-email {
  font-size: 13px;
  color: var(--cursos-text-muted);
  margin: 0 0 10px;
}

.cursos-tag {
  display: inline-block;
  font-size: 11.5px;
  font-weight: 700;
  color: var(--cursos-accent);
  background: var(--cursos-accent-bg);
  padding: 4px 12px;
  border-radius: 999px;
}

.profile-edit-btn {
  margin-top: 18px;
  background: var(--cursos-bg-cream);
  color: var(--cursos-text);
  border: none;
  border-radius: 8px;
  padding: 9px 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.profile-edit-form {
  text-align: left;
  margin-top: 20px;
}

.profile-edit-actions {
  display: flex;
  gap: 8px;
}

.profile-edit-actions button {
  flex: 1;
  border: none;
  border-radius: 8px;
  padding: 9px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.profile-btn-primary {
  background: var(--cursos-accent);
  color: #fff;
}

.profile-btn-secondary {
  background: var(--cursos-bg-cream);
  color: var(--cursos-text);
}

.profile-card + .profile-card {
  margin-top: 18px;
}

.profile-card__title {
  font-family: var(--cursos-font-heading);
  font-size: 14.5px;
  font-weight: 700;
  color: var(--cursos-text);
  margin: 0 0 14px;
}

.profile-password-msg {
  font-size: 12px;
  margin: 0 0 10px;
}

.profile-password-msg.success {
  color: #3e7a4e;
}

.profile-password-msg.error {
  color: #c0472c;
}

.profile-logout {
  display: block;
  width: 100%;
  text-align: center;
  margin-top: 18px;
  font-size: 13.5px;
  color: #c0472c;
  background: none;
  border: none;
  font-weight: 600;
  cursor: pointer;
  padding: 8px 0;
}

.cursos-section__title {
  font-family: var(--cursos-font-heading);
  font-size: 18px;
  font-weight: 700;
  color: var(--cursos-text);
  margin: 0 0 16px;
}

.cursos-muted {
  color: var(--cursos-text-muted);
}

.profile-enrollment-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.profile-enrollment-card {
  display: flex;
  align-items: center;
  gap: 14px;
  border: 1px solid var(--cursos-border);
  border-radius: 14px;
  padding: 14px;
}

.profile-enrollment-actions {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}

.cursos-thumb--sm {
  width: 72px;
  height: 72px;
  flex: none;
  border-radius: 10px;
  background: var(--cursos-avatar-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
}

.profile-enrollment-body {
  flex: 1;
  min-width: 0;
}

.profile-enrollment-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--cursos-text);
  margin: 0 0 6px;
}

.cursos-status {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 999px;
  background: var(--cursos-progress-track);
  color: var(--cursos-text-muted);
}

.cursos-status--activa {
  background: var(--cursos-accent-bg);
  color: var(--cursos-accent-hover);
}

.cursos-status--pendiente {
  background: #fbe9d9;
  color: #92551f;
}

@media (max-width: 760px) {
  .profile-content {
    grid-template-columns: 1fr;
  }
}
</style>
