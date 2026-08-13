<template>
  <div class="content-page">
    <CursosTopNav />

    <div class="content-page__body">
      <RouterLink to="/perfil" class="detail-back">← Volver a mis cursos</RouterLink>
      <h1 class="content-page__title">{{ course?.title ?? 'Contenido del curso' }}</h1>

      <div v-if="loading" class="cursos-muted">Cargando…</div>

      <div v-else-if="blocked" class="content-blocked">
        <p class="content-blocked__title">Todavía no tienes acceso a este contenido</p>
        <p class="content-blocked__text">
          El contenido se habilita cuando el administrador aprueba tu inscripción (pasa a estado ACTIVA).
        </p>
      </div>

      <template v-else>
        <div v-if="!content.modules.length" class="cursos-muted">
          Este curso todavía no tiene contenido publicado.
        </div>

        <div v-for="module in content.modules" :key="module.id" class="content-module-card">
          <p class="content-module-card__title">{{ module.title }}</p>

          <div v-if="!module.lessons.length" class="cursos-muted">Sin lecciones todavía.</div>
          <ul v-else class="content-lesson-list">
            <li v-for="lesson in module.lessons" :key="lesson.id" class="content-lesson-item">
              <span class="content-lesson-item__icon">{{ lesson.type === 'PDF' ? '📄' : '🎬' }}</span>
              <span class="content-lesson-item__title">{{ lesson.title }}</span>
              <button type="button" class="admin-link-btn" @click="content.openLessonFile(lesson)">Ver</button>
            </li>
          </ul>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import CursosTopNav from '../components/CursosTopNav.vue';
import { useContentStore } from '../stores/content';
import { useCoursesStore } from '../stores/courses';

const route = useRoute();
const courseId = route.params.id;

const content = useContentStore();
const courses = useCoursesStore();

const course = ref(null);
const loading = ref(true);
const blocked = ref(false);

onMounted(async () => {
  course.value = await courses.fetchOne(courseId);
  try {
    await content.fetchByCourse(courseId);
    if (content.error) blocked.value = true;
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.content-page {
  font-family: var(--cursos-font-body);
  background: var(--cursos-bg);
  min-height: 100vh;
}

.content-page__body {
  max-width: 900px;
  margin: 0 auto;
  padding: 32px 40px 80px;
}

.detail-back {
  font-size: 13px;
  text-decoration: none;
  color: var(--cursos-accent);
}

.content-page__title {
  font-family: var(--cursos-font-heading);
  font-size: 24px;
  font-weight: 700;
  color: var(--cursos-text);
  margin: 14px 0 24px;
}

.cursos-muted {
  color: var(--cursos-text-muted);
}

.content-blocked {
  background: var(--cursos-bg-cream);
  border-radius: 14px;
  padding: 24px;
}

.content-blocked__title {
  font-family: var(--cursos-font-heading);
  font-weight: 700;
  font-size: 15px;
  color: var(--cursos-text);
  margin: 0 0 6px;
}

.content-blocked__text {
  font-size: 13.5px;
  color: var(--cursos-text-muted);
  margin: 0;
}

.content-module-card {
  border: 1px solid var(--cursos-border);
  border-radius: 14px;
  padding: 20px;
  margin-bottom: 16px;
}

.content-module-card__title {
  font-family: var(--cursos-font-heading);
  font-weight: 700;
  font-size: 15px;
  color: var(--cursos-text);
  margin: 0 0 12px;
}

.content-lesson-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.content-lesson-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-top: 1px solid var(--cursos-border);
}

.content-lesson-item__icon {
  font-size: 18px;
}

.content-lesson-item__title {
  flex: 1;
  font-size: 14px;
  color: var(--cursos-text);
}
</style>
