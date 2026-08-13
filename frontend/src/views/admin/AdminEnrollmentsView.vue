<template>
  <AdminSidebar>
    <div class="admin-header">
      <div>
        <h1 class="admin-header__title">Gestión de inscripciones</h1>
        <p class="admin-header__subtitle">{{ filtered.length }} inscripción(es){{ courseFilterLabel }}</p>
      </div>
      <select v-model="courseFilter" class="admin-course-filter">
        <option value="">Todos los cursos</option>
        <option v-for="course in courses.items" :key="course.id" :value="course.id">{{ course.title }}</option>
      </select>
    </div>

    <div class="admin-card">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Estudiante</th>
            <th>Curso</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="entry in filtered" :key="entry.id">
            <td class="is-strong">{{ studentLabel(entry.userId) }}</td>
            <td>{{ courseTitle(entry.courseId) }}</td>
            <td>{{ formatDate(entry.createdAt) }}</td>
            <td><span class="admin-badge" :class="statusBadgeClass(entry.status)">{{ entry.status }}</span></td>
            <td>
              <div class="admin-actions-row">
                <button
                  v-for="action in actionsFor(entry.status)"
                  :key="action.status"
                  type="button"
                  class="admin-link-btn"
                  :class="{ 'admin-link-btn--danger': action.danger }"
                  @click="onChangeStatus(entry.id, action.status)"
                >
                  {{ action.label }}
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="!filtered.length" class="admin-table__empty">No hay inscripciones para este filtro.</p>
    </div>
  </AdminSidebar>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import AdminSidebar from '../../components/AdminSidebar.vue';
import { useCoursesStore } from '../../stores/courses';
import { useEnrollmentsStore } from '../../stores/enrollments';
import { useUsersStore } from '../../stores/users';

const STATUS_BADGE = {
  PENDIENTE: 'admin-badge--warn',
  ACTIVA: 'admin-badge--ok',
  COMPLETADA: 'admin-badge--muted',
  CANCELADA: 'admin-badge--danger',
};

const ACTIONS_BY_STATUS = {
  PENDIENTE: [
    { status: 'ACTIVA', label: 'Aprobar' },
    { status: 'CANCELADA', label: 'Rechazar', danger: true },
  ],
  ACTIVA: [
    { status: 'COMPLETADA', label: 'Completar' },
    { status: 'CANCELADA', label: 'Dar de baja', danger: true },
  ],
};

const route = useRoute();
const courses = useCoursesStore();
const enrollments = useEnrollmentsStore();
const users = useUsersStore();

const courseFilter = ref(route.query.courseId ?? '');

const filtered = computed(() =>
  courseFilter.value ? enrollments.all.filter((entry) => entry.courseId === courseFilter.value) : enrollments.all,
);

const courseFilterLabel = computed(() => {
  const course = courses.items.find((c) => c.id === courseFilter.value);
  return course ? ` en "${course.title}"` : '';
});

function courseTitle(courseId) {
  return courses.items.find((course) => course.id === courseId)?.title ?? courseId;
}

function studentLabel(userId) {
  const user = users.items.find((u) => u.id === userId);
  return user ? `${user.firstName} ${user.lastName}` : userId;
}

function statusBadgeClass(status) {
  return STATUS_BADGE[status] ?? 'admin-badge--muted';
}

function actionsFor(status) {
  return ACTIONS_BY_STATUS[status] ?? [];
}

function formatDate(value) {
  return new Date(value).toLocaleDateString('es');
}

async function onChangeStatus(id, status) {
  await enrollments.changeStatus(id, status);
}

watch(
  () => route.query.courseId,
  (value) => {
    courseFilter.value = value ?? '';
  },
);

onMounted(async () => {
  await courses.fetchCourses();
  await Promise.all([enrollments.fetchAllAdmin(), users.fetchAll()]);
});
</script>

<style scoped>
.admin-course-filter {
  border: 1px solid var(--cursos-border);
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 13.5px;
  background: #fff;
  font-family: inherit;
}

.admin-actions-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
</style>
