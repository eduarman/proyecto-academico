<template>
  <div class="cursos-home">
    <CursosTopNav />

    <div class="cursos-hero">
      <div class="cursos-hero__inner">
        <h1 class="cursos-hero__title">Aprende Office, SQL, Análisis de Datos y Marketing</h1>
        <p class="cursos-hero__subtitle">Cursos prácticos para estudiantes, profesionales y familias, a tu ritmo.</p>
        <form class="cursos-search" @submit.prevent>
          <input
            v-model="search"
            type="text"
            placeholder="Busca un curso, ej. Excel"
            class="cursos-search__input"
          />
          <button type="submit" class="cursos-search__btn">Buscar</button>
        </form>
      </div>
    </div>

    <div v-if="myActiveEnrollments.length" class="cursos-section">
      <h2 class="cursos-section__title">Continúa donde lo dejaste</h2>
      <div class="cursos-continue">
        <RouterLink
          v-for="entry in myActiveEnrollments"
          :key="entry.id"
          to="/perfil"
          class="cursos-continue__card"
        >
          <div class="cursos-thumb cursos-thumb--sm">{{ categoryIcon(courseOf(entry.courseId)?.category) }}</div>
          <div class="cursos-continue__body">
            <p class="cursos-continue__title">{{ courseOf(entry.courseId)?.title ?? entry.courseId }}</p>
            <span class="cursos-status" :class="`cursos-status--${entry.status.toLowerCase()}`">
              {{ entry.status }}
            </span>
          </div>
        </RouterLink>
      </div>
    </div>

    <div class="cursos-section">
      <h2 class="cursos-section__title">Explora por categoría</h2>
      <div class="cursos-categories">
        <div v-for="cat in categoryStats" :key="cat.value" class="cursos-category-card">
          <div class="cursos-category-card__icon">{{ cat.icon }}</div>
          <p class="cursos-category-card__name">{{ cat.label }}</p>
          <span class="cursos-category-card__count">{{ cat.count }} curso{{ cat.count === 1 ? '' : 's' }}</span>
        </div>
      </div>
    </div>

    <div class="cursos-section cursos-section--last">
      <h2 class="cursos-section__title">Cursos destacados</h2>

      <div v-if="courses.loading" class="cursos-muted">Cargando…</div>
      <div v-else-if="!filteredCourses.length" class="cursos-muted">No encontramos cursos con ese criterio.</div>

      <div v-else class="cursos-grid">
        <div v-for="course in filteredCourses" :key="course.id" class="cursos-card">
          <RouterLink :to="`/cursos/${course.id}`" class="cursos-card__link">
            <div class="cursos-thumb">{{ categoryIcon(course.category) }}</div>
          </RouterLink>
          <div class="cursos-card__body">
            <span class="cursos-tag">{{ categoryLabel(course.category) }}</span>
            <RouterLink :to="`/cursos/${course.id}`" class="cursos-card__title-link">
              <p class="cursos-card__title">{{ course.title }}</p>
            </RouterLink>
            <p class="cursos-card__meta">
              {{ formatDate(course.startDate) }} — {{ formatDate(course.endDate) }} · {{ course.maxSeats }} cupos
            </p>
            <button
              v-if="!auth.isAuthenticated || auth.user?.role === 'ESTUDIANTE'"
              class="cursos-btn"
              :disabled="isEnrolled(course.id)"
              @click="onEnrollClick(course)"
            >
              {{ isEnrolled(course.id) ? 'Ya inscrito' : 'Inscribirme' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <EnrollDialog ref="enrollDialog" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import CursosTopNav from '../components/CursosTopNav.vue';
import EnrollDialog from '../components/EnrollDialog.vue';
import { useAuthStore } from '../stores/auth';
import { useCategoriesStore } from '../stores/categories';
import { useCoursesStore } from '../stores/courses';
import { useEnrollmentsStore } from '../stores/enrollments';

// Iconos curados para las categorías originales; una categoría nueva creada por el admin
// usa el ícono genérico de categoryIcon().
const CATEGORY_ICONS = {
  OFFICE: '📊',
  SQL: '🗄️',
  ANALISIS_DATOS: '📈',
  MARKETING: '📣',
};

const auth = useAuthStore();
const categories = useCategoriesStore();
const courses = useCoursesStore();
const enrollments = useEnrollmentsStore();
const router = useRouter();

const search = ref('');
const enrollDialog = ref(null);

function onEnrollClick(course) {
  if (!auth.isAuthenticated) {
    router.push({ path: '/', query: { redirect: `/cursos/${course.id}`, intent: 'enroll' } });
    return;
  }
  enrollDialog.value?.open(course);
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

function courseOf(courseId) {
  return courses.items.find((course) => course.id === courseId);
}

function isEnrolled(courseId) {
  return enrollments.mine.some((entry) => entry.courseId === courseId && entry.status !== 'CANCELADA');
}

const filteredCourses = computed(() => {
  const term = search.value.trim().toLowerCase();
  if (!term) return courses.items;
  return courses.items.filter((course) => course.title.toLowerCase().includes(term));
});

const categoryStats = computed(() =>
  categories.items.map((cat) => ({
    value: cat.code,
    label: cat.label,
    icon: categoryIcon(cat.code),
    count: courses.items.filter((course) => course.category === cat.code).length,
  })),
);

const myActiveEnrollments = computed(() =>
  enrollments.mine.filter((entry) => entry.status === 'PENDIENTE' || entry.status === 'ACTIVA'),
);

onMounted(async () => {
  await Promise.all([courses.fetchCourses(), categories.fetchAll()]);
  if (auth.user?.role === 'ESTUDIANTE') {
    await enrollments.fetchMine();
  }
});
</script>

<style scoped>
.cursos-home {
  font-family: var(--cursos-font-body);
  background: var(--cursos-bg);
  min-height: 100vh;
}

.cursos-hero {
  background: var(--cursos-bg-cream);
  padding: 56px 40px;
}

.cursos-hero__inner {
  max-width: 640px;
  margin: 0 auto;
  text-align: center;
}

.cursos-hero__title {
  font-family: var(--cursos-font-heading);
  font-size: 32px;
  font-weight: 700;
  color: var(--cursos-text);
  margin: 0 0 12px;
}

.cursos-hero__subtitle {
  font-size: 15px;
  color: var(--cursos-text-muted);
  margin: 0 0 24px;
}

.cursos-search {
  display: flex;
  max-width: 460px;
  margin: 0 auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(43, 42, 40, 0.06);
  overflow: hidden;
}

.cursos-search__input {
  flex: 1;
  border: none;
  outline: none;
  padding: 14px 16px;
  font-size: 14px;
  font-family: inherit;
}

.cursos-search__btn {
  background: var(--cursos-accent);
  color: #fff;
  border: none;
  padding: 14px 22px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
}

.cursos-search__btn:hover {
  background: var(--cursos-accent-hover);
}

.cursos-section {
  max-width: 1120px;
  margin: 0 auto;
  padding: 48px 40px 0;
}

.cursos-section--last {
  padding-bottom: 72px;
}

.cursos-section__title {
  font-family: var(--cursos-font-heading);
  font-size: 20px;
  font-weight: 700;
  color: var(--cursos-text);
  margin: 0 0 16px;
}

.cursos-muted {
  color: var(--cursos-text-muted);
}

.cursos-thumb {
  width: 100%;
  height: 130px;
  background: var(--cursos-avatar-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
}

.cursos-thumb--sm {
  width: 76px;
  height: 76px;
  flex: none;
  border-radius: 10px;
  font-size: 28px;
}

.cursos-continue {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.cursos-continue__card {
  display: flex;
  gap: 14px;
  background: var(--cursos-bg);
  border: 1px solid var(--cursos-border);
  border-radius: 14px;
  padding: 14px;
  width: 340px;
  text-decoration: none;
}

.cursos-continue__body {
  min-width: 0;
}

.cursos-continue__title {
  font-size: 14px;
  font-weight: 600;
  color: var(--cursos-text);
  margin: 0 0 8px;
  line-height: 1.3;
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

.cursos-categories {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.cursos-category-card {
  background: var(--cursos-bg);
  border: 1px solid var(--cursos-border);
  border-radius: 14px;
  padding: 20px;
  text-align: center;
}

.cursos-category-card__icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: var(--cursos-avatar-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
  font-size: 20px;
}

.cursos-category-card__name {
  font-size: 14.5px;
  font-weight: 600;
  color: var(--cursos-text);
  margin: 0 0 4px;
}

.cursos-category-card__count {
  font-size: 12.5px;
  color: var(--cursos-text-muted);
}

.cursos-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
}

.cursos-card {
  background: var(--cursos-bg);
  border: 1px solid var(--cursos-border);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(43, 42, 40, 0.04);
  display: flex;
  flex-direction: column;
}

.cursos-card__body {
  padding: 14px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.cursos-card__link {
  display: block;
}

.cursos-tag {
  align-self: flex-start;
  font-size: 11px;
  font-weight: 700;
  color: var(--cursos-accent);
  background: var(--cursos-accent-bg);
  padding: 3px 9px;
  border-radius: 999px;
}

.cursos-card__title-link {
  text-decoration: none;
}

.cursos-card__title {
  font-size: 14.5px;
  font-weight: 600;
  color: var(--cursos-text);
  margin: 10px 0 4px;
  line-height: 1.3;
}

.cursos-card__meta {
  font-size: 12.5px;
  color: var(--cursos-text-muted);
  margin: 0 0 12px;
}

.cursos-btn {
  margin-top: auto;
  background: var(--cursos-accent);
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 10px;
  font-weight: 600;
  font-size: 13.5px;
  cursor: pointer;
}

.cursos-btn:hover:not(:disabled) {
  background: var(--cursos-accent-hover);
}

.cursos-btn:disabled {
  background: var(--cursos-progress-track);
  color: var(--cursos-text-muted);
  cursor: default;
}

@media (max-width: 900px) {
  .cursos-categories,
  .cursos-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 560px) {
  .cursos-categories,
  .cursos-grid {
    grid-template-columns: 1fr;
  }

  .cursos-hero,
  .cursos-section {
    padding-left: 20px;
    padding-right: 20px;
  }
}
</style>
