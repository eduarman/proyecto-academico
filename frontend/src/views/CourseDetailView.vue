<template>
  <div class="detail-page">
    <CursosTopNav />

    <div class="detail-content" v-if="course">
      <RouterLink to="/catalogo" class="detail-back">← Volver al catálogo</RouterLink>

      <div class="detail-grid">
        <div>
          <span class="cursos-tag">{{ categoryLabel(course.category) }}</span>
          <h1 class="detail-title">{{ course.title }}</h1>
          <div class="detail-meta">
            <span>{{ formatDate(course.startDate) }} — {{ formatDate(course.endDate) }}</span>
            <span>·</span>
            <span>{{ course.maxSeats }} cupos</span>
          </div>
          <div class="detail-hero">{{ categoryIcon(course.category) }}</div>

          <h2 class="detail-section-title">Sobre el curso</h2>
          <p class="detail-body-text">
            Curso de la categoría {{ categoryLabel(course.category) }}, dictado en la plataforma Cursia. El
            contenido detallado (módulos y lecciones) estará disponible en una próxima etapa de la plataforma.
          </p>
        </div>

        <div>
          <div class="detail-card">
            <button
              v-if="!auth.isAuthenticated || auth.user?.role === 'ESTUDIANTE'"
              class="cursos-submit"
              :disabled="isEnrolled"
              @click="onEnrollClick"
            >
              {{ isEnrolled ? 'Ya inscrito' : 'Inscribirme ahora' }}
            </button>
            <ul class="detail-facts">
              <li>🪑 {{ course.maxSeats }} cupos totales</li>
              <li>📅 {{ formatDate(course.startDate) }} — {{ formatDate(course.endDate) }}</li>
              <li>🏷️ {{ categoryLabel(course.category) }}</li>
              <li>🟢 Estado: {{ course.status }}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="detail-loading">Cargando…</div>

    <EnrollDialog ref="enrollDialog" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import CursosTopNav from '../components/CursosTopNav.vue';
import EnrollDialog from '../components/EnrollDialog.vue';
import { useAuthStore } from '../stores/auth';
import { useCategoriesStore } from '../stores/categories';
import { useCoursesStore } from '../stores/courses';
import { useEnrollmentsStore } from '../stores/enrollments';

const CATEGORY_ICONS = { OFFICE: '📊', SQL: '🗄️', ANALISIS_DATOS: '📈', MARKETING: '📣' };

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const categories = useCategoriesStore();
const courses = useCoursesStore();
const enrollments = useEnrollmentsStore();

const course = ref(null);
const enrollDialog = ref(null);

function onEnrollClick() {
  if (!auth.isAuthenticated) {
    router.push({ path: '/', query: { redirect: route.fullPath, intent: 'enroll' } });
    return;
  }
  enrollDialog.value?.open(course.value);
}

function categoryLabel(value) {
  return categories.items.find((cat) => cat.code === value)?.label ?? value;
}
function categoryIcon(value) {
  return CATEGORY_ICONS[value] ?? '📚';
}
function formatDate(value) {
  return new Date(value).toLocaleDateString('es');
}

const isEnrolled = computed(() =>
  enrollments.mine.some((entry) => entry.courseId === route.params.id && entry.status !== 'CANCELADA'),
);

onMounted(async () => {
  const [fetchedCourse] = await Promise.all([courses.fetchOne(route.params.id), categories.fetchAll()]);
  course.value = fetchedCourse;
  if (auth.user?.role === 'ESTUDIANTE') {
    await enrollments.fetchMine();
  }
});
</script>

<style scoped>
.detail-page {
  font-family: var(--cursos-font-body);
  background: var(--cursos-bg);
  min-height: 100vh;
}

.detail-content {
  max-width: 1120px;
  margin: 0 auto;
  padding: 32px 40px 80px;
}

.detail-back {
  font-size: 13px;
  text-decoration: none;
  color: var(--cursos-accent);
}

.detail-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 40px;
  margin-top: 20px;
}

.cursos-tag {
  align-self: flex-start;
  font-size: 11px;
  font-weight: 700;
  color: var(--cursos-accent);
  background: var(--cursos-accent-bg);
  padding: 4px 10px;
  border-radius: 999px;
}

.detail-title {
  font-family: var(--cursos-font-heading);
  font-size: 28px;
  font-weight: 700;
  color: var(--cursos-text);
  margin: 14px 0 10px;
}

.detail-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13.5px;
  color: var(--cursos-text-muted);
  margin-bottom: 22px;
}

.detail-hero {
  width: 100%;
  height: 240px;
  border-radius: 16px;
  background: var(--cursos-avatar-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 64px;
}

.detail-section-title {
  font-family: var(--cursos-font-heading);
  font-size: 18px;
  font-weight: 700;
  color: var(--cursos-text);
  margin: 32px 0 10px;
}

.detail-body-text {
  font-size: 14.5px;
  color: #4c4a47;
  line-height: 1.7;
  margin: 0;
}

.detail-card {
  border: 1px solid var(--cursos-border);
  border-radius: 16px;
  padding: 22px;
  position: sticky;
  top: 24px;
  box-shadow: 0 6px 24px rgba(43, 42, 40, 0.06);
}

.detail-facts {
  list-style: none;
  padding: 0;
  margin: 16px 0 0;
  font-size: 13.5px;
  color: #4c4a47;
}

.detail-facts li {
  padding: 8px 0;
  border-top: 1px solid var(--cursos-border);
}

.detail-loading {
  padding: 40px;
  text-align: center;
  color: var(--cursos-text-muted);
}
</style>
