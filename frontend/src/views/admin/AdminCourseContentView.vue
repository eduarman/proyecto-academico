<template>
  <AdminSidebar>
    <RouterLink to="/admin/cursos" class="admin-link-btn">← Volver a cursos</RouterLink>
    <div class="admin-header">
      <div>
        <h1 class="admin-header__title">Contenido del curso</h1>
        <p class="admin-header__subtitle">{{ course?.title ?? '' }}</p>
      </div>
    </div>

    <div class="admin-card admin-category-form">
      <p v-if="moduleError" class="admin-alert error">{{ moduleError }}</p>
      <form class="admin-category-form__row" @submit.prevent="onCreateModule">
        <input v-model="newModuleTitle" type="text" minlength="2" placeholder="Nombre del módulo, ej. Módulo 1" required />
        <button type="submit" class="admin-btn-primary" :disabled="creatingModule">
          {{ creatingModule ? 'Creando…' : '+ Nuevo módulo' }}
        </button>
      </form>
    </div>

    <div v-if="content.loading" class="cursos-muted">Cargando…</div>
    <div v-else-if="!content.modules.length" class="cursos-muted">Este curso todavía no tiene módulos.</div>

    <div v-for="module in content.modules" :key="module.id" class="admin-card content-module">
      <div class="content-module__header">
        <p class="content-module__title">{{ module.title }}</p>
        <button type="button" class="admin-link-btn admin-link-btn--danger" @click="onRemoveModule(module)">
          Eliminar módulo
        </button>
      </div>

      <table class="admin-table" v-if="module.lessons.length">
        <thead>
          <tr>
            <th>Lección</th>
            <th>Tipo</th>
            <th>Archivo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="lesson in module.lessons" :key="lesson.id">
            <td class="is-strong">{{ lesson.title }}</td>
            <td><span class="admin-badge admin-badge--muted">{{ lesson.type }}</span></td>
            <td>{{ lesson.originalName }}</td>
            <td>
              <div class="admin-actions-row">
                <button type="button" class="admin-link-btn" @click="content.openLessonFile(lesson)">Ver</button>
                <button
                  type="button"
                  class="admin-link-btn admin-link-btn--danger"
                  @click="onRemoveLesson(module, lesson)"
                >
                  Eliminar
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else class="admin-table__empty">Sin lecciones todavía.</p>

      <form class="content-lesson-form" @submit.prevent="onCreateLesson(module)">
        <input v-model="lessonForms[module.id].title" type="text" placeholder="Título de la lección" required minlength="2" />
        <select v-model="lessonForms[module.id].type">
          <option value="PDF">PDF</option>
          <option value="VIDEO">Video</option>
        </select>
        <input type="file" accept=".pdf,video/*" @change="onFileChange(module.id, $event)" required />
        <button type="submit" class="admin-btn-primary" :disabled="uploadingModuleId === module.id">
          {{ uploadingModuleId === module.id ? 'Subiendo…' : '+ Agregar lección' }}
        </button>
      </form>
      <p v-if="lessonErrors[module.id]" class="admin-alert error">{{ lessonErrors[module.id] }}</p>
    </div>
  </AdminSidebar>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import AdminSidebar from '../../components/AdminSidebar.vue';
import { useContentStore } from '../../stores/content';
import { useCoursesStore } from '../../stores/courses';

const route = useRoute();
const courseId = route.params.id;

const content = useContentStore();
const courses = useCoursesStore();

const course = ref(null);
const newModuleTitle = ref('');
const creatingModule = ref(false);
const moduleError = ref(null);

const lessonForms = reactive({});
const lessonFiles = reactive({});
const uploadingModuleId = ref(null);
const lessonErrors = reactive({});

function ensureLessonForm(moduleId) {
  if (!lessonForms[moduleId]) {
    lessonForms[moduleId] = { title: '', type: 'PDF' };
  }
}

function onFileChange(moduleId, event) {
  lessonFiles[moduleId] = event.target.files[0] ?? null;
}

async function onCreateModule() {
  if (!newModuleTitle.value.trim()) return;
  creatingModule.value = true;
  moduleError.value = null;
  try {
    const created = await content.createModule(courseId, newModuleTitle.value.trim());
    ensureLessonForm(created.id);
    newModuleTitle.value = '';
  } catch (err) {
    moduleError.value = err.response?.data?.message ?? 'No se pudo crear el módulo';
  } finally {
    creatingModule.value = false;
  }
}

async function onRemoveModule(module) {
  await content.removeModule(module.id);
}

async function onCreateLesson(module) {
  const form = lessonForms[module.id];
  const file = lessonFiles[module.id];
  lessonErrors[module.id] = null;
  if (!file) {
    lessonErrors[module.id] = 'Selecciona un archivo';
    return;
  }
  uploadingModuleId.value = module.id;
  try {
    await content.createLesson(module.id, { title: form.title, type: form.type, file });
    lessonForms[module.id] = { title: '', type: 'PDF' };
    lessonFiles[module.id] = null;
  } catch (err) {
    lessonErrors[module.id] = err.response?.data?.message ?? 'No se pudo subir la lección';
  } finally {
    uploadingModuleId.value = null;
  }
}

async function onRemoveLesson(module, lesson) {
  await content.removeLesson(module.id, lesson.id);
}

onMounted(async () => {
  course.value = await courses.fetchOne(courseId);
  await content.fetchByCourse(courseId);
  content.modules.forEach((module) => ensureLessonForm(module.id));
});
</script>

<style scoped>
.content-module {
  padding: 20px;
  margin-bottom: 18px;
}

.content-module__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.content-module__title {
  font-family: var(--cursos-font-heading);
  font-size: 15px;
  font-weight: 700;
  color: var(--cursos-text);
  margin: 0;
}

.content-lesson-form {
  display: flex;
  gap: 10px;
  margin-top: 16px;
  flex-wrap: wrap;
  align-items: center;
}

.content-lesson-form input[type='text'] {
  flex: 1;
  min-width: 180px;
  box-sizing: border-box;
  padding: 9px 12px;
  border-radius: 8px;
  border: 1px solid #d7cfc5;
  font-size: 13px;
  font-family: inherit;
}

.content-lesson-form select {
  padding: 9px 10px;
  border-radius: 8px;
  border: 1px solid #d7cfc5;
  font-size: 13px;
  font-family: inherit;
}

.content-lesson-form input[type='file'] {
  font-size: 12.5px;
}

.admin-category-form {
  padding: 20px;
  margin: 16px 0 20px;
}

.admin-category-form__row {
  display: flex;
  gap: 10px;
}

.admin-category-form__row input {
  flex: 1;
  box-sizing: border-box;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid #d7cfc5;
  font-size: 13.5px;
  font-family: inherit;
}
</style>
