<template>
  <AdminSidebar>
    <div class="admin-header">
      <div>
        <h1 class="admin-header__title">Gestión de cursos</h1>
        <p class="admin-header__subtitle">{{ courses.items.length }} cursos en la plataforma</p>
      </div>
      <button type="button" class="admin-btn-primary" @click="openCreate">+ Crear curso</button>
    </div>

    <p v-if="feedback" class="admin-alert" :class="feedback.type">{{ feedback.message }}</p>

    <div class="admin-card">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Curso</th>
            <th>Categoría</th>
            <th>Cupos</th>
            <th>Fechas</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="course in courses.items" :key="course.id">
            <td class="is-strong">{{ course.title }}</td>
            <td>{{ categoryLabel(course.category) }}</td>
            <td>{{ course.maxSeats }}</td>
            <td>{{ formatDate(course.startDate) }} — {{ formatDate(course.endDate) }}</td>
            <td>
              <span class="admin-badge" :class="statusBadgeClass(course.status)">{{ course.status }}</span>
            </td>
            <td>
              <div class="admin-actions-row">
                <button
                  v-if="nextStatus(course.status)"
                  type="button"
                  class="admin-link-btn"
                  @click="onChangeStatus(course)"
                >
                  {{ nextStatus(course.status) === 'PUBLICADO' ? 'Publicar' : 'Archivar' }}
                </button>
                <RouterLink class="admin-link-btn" :to="`/admin/inscripciones?courseId=${course.id}`">
                  Inscripciones
                </RouterLink>
                <RouterLink class="admin-link-btn" :to="`/admin/cursos/${course.id}/contenido`">Contenido</RouterLink>
                <button type="button" class="admin-link-btn" @click="openEdit(course)">Editar</button>
                <button type="button" class="admin-link-btn admin-link-btn--danger" @click="onDelete(course)">
                  Eliminar
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="!courses.items.length" class="admin-table__empty">Todavía no hay cursos creados.</p>
    </div>

    <div v-if="dialogOpen" class="admin-dialog-backdrop" @click.self="dialogOpen = false">
      <div class="admin-dialog">
        <p class="admin-dialog__title">{{ editingId ? 'Editar curso' : 'Crear curso' }}</p>
        <p v-if="dialogError" class="admin-alert error">{{ dialogError }}</p>

        <div class="admin-field">
          <label>Título</label>
          <input v-model="form.title" type="text" minlength="3" />
        </div>
        <div class="admin-field">
          <label>Categoría</label>
          <select v-model="form.category">
            <option v-for="cat in categories.items" :key="cat.code" :value="cat.code">{{ cat.label }}</option>
          </select>

          <button v-if="!newCategoryOpen" type="button" class="admin-link-btn" @click="newCategoryOpen = true">
            + Nueva categoría
          </button>
          <div v-else class="admin-new-category">
            <input
              v-model="newCategoryLabel"
              type="text"
              placeholder="Nombre de la categoría"
              @keydown.enter.prevent="onCreateCategory"
            />
            <button type="button" class="admin-link-btn" :disabled="creatingCategory" @click="onCreateCategory">
              Agregar
            </button>
            <button type="button" class="admin-link-btn" @click="newCategoryOpen = false">Cancelar</button>
          </div>
          <p v-if="newCategoryError" class="admin-alert error">{{ newCategoryError }}</p>
        </div>
        <div class="admin-field">
          <label>Cupos máximos</label>
          <input v-model.number="form.maxSeats" type="number" min="1" />
        </div>
        <div class="admin-field">
          <label>Fecha de inicio</label>
          <input v-model="form.startDate" type="date" />
        </div>
        <div class="admin-field">
          <label>Fecha de fin</label>
          <input v-model="form.endDate" type="date" />
        </div>

        <div class="admin-dialog__actions">
          <button type="button" class="is-primary" :disabled="saving" @click="onSave">
            {{ saving ? 'Guardando…' : 'Guardar' }}
          </button>
          <button type="button" class="is-secondary" @click="dialogOpen = false">Cancelar</button>
        </div>
      </div>
    </div>
  </AdminSidebar>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import { RouterLink } from 'vue-router';
import AdminSidebar from '../../components/AdminSidebar.vue';
import { useCoursesStore } from '../../stores/courses';
import { useCategoriesStore } from '../../stores/categories';

const STATUS_TRANSITIONS = { BORRADOR: 'PUBLICADO', PUBLICADO: 'ARCHIVADO', ARCHIVADO: null };
const STATUS_BADGE = { BORRADOR: 'admin-badge--muted', PUBLICADO: 'admin-badge--ok', ARCHIVADO: 'admin-badge--danger' };

const courses = useCoursesStore();
const categories = useCategoriesStore();

const dialogOpen = ref(false);
const editingId = ref(null);
const dialogError = ref(null);
const saving = ref(false);
const feedback = ref(null);
const form = reactive({ title: '', category: '', maxSeats: 10, startDate: '', endDate: '' });

const newCategoryOpen = ref(false);
const newCategoryLabel = ref('');
const creatingCategory = ref(false);
const newCategoryError = ref(null);

function categoryLabel(value) {
  return categories.items.find((cat) => cat.code === value)?.label ?? value;
}

async function onCreateCategory() {
  if (!newCategoryLabel.value.trim()) return;
  creatingCategory.value = true;
  newCategoryError.value = null;
  try {
    const created = await categories.createCategory(newCategoryLabel.value.trim());
    form.category = created.code;
    newCategoryLabel.value = '';
    newCategoryOpen.value = false;
  } catch (err) {
    newCategoryError.value = err.response?.data?.message ?? 'No se pudo crear la categoría';
  } finally {
    creatingCategory.value = false;
  }
}
function nextStatus(status) {
  return STATUS_TRANSITIONS[status];
}
function statusBadgeClass(status) {
  return STATUS_BADGE[status] ?? 'admin-badge--muted';
}
function formatDate(value) {
  return new Date(value).toLocaleDateString('es');
}

function openCreate() {
  editingId.value = null;
  Object.assign(form, {
    title: '',
    category: categories.items[0]?.code ?? '',
    maxSeats: 10,
    startDate: '',
    endDate: '',
  });
  dialogError.value = null;
  newCategoryOpen.value = false;
  dialogOpen.value = true;
}

function openEdit(course) {
  editingId.value = course.id;
  Object.assign(form, {
    title: course.title,
    category: course.category,
    maxSeats: course.maxSeats,
    startDate: course.startDate,
    endDate: course.endDate,
  });
  dialogError.value = null;
  newCategoryOpen.value = false;
  dialogOpen.value = true;
}

async function onSave() {
  saving.value = true;
  dialogError.value = null;
  try {
    if (editingId.value) {
      await courses.updateCourse(editingId.value, { ...form });
    } else {
      await courses.createCourse({ ...form });
    }
    dialogOpen.value = false;
  } catch (err) {
    dialogError.value = err.response?.data?.message ?? 'No se pudo guardar el curso';
  } finally {
    saving.value = false;
  }
}

async function onChangeStatus(course) {
  const status = nextStatus(course.status);
  if (!status) return;
  try {
    await courses.updateCourse(course.id, { status });
  } catch (err) {
    feedback.value = { type: 'error', message: err.response?.data?.message ?? 'No se pudo cambiar el estado' };
  }
}

async function onDelete(course) {
  feedback.value = null;
  try {
    await courses.removeCourse(course.id);
  } catch (err) {
    feedback.value = { type: 'error', message: err.response?.data?.message ?? 'No se pudo eliminar el curso' };
  }
}

onMounted(async () => {
  await Promise.all([courses.fetchCourses(), categories.fetchAll()]);
});
</script>

<style scoped>
.admin-actions-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.admin-new-category {
  display: flex;
  gap: 8px;
  align-items: center;
  margin: -6px 0 12px;
}

.admin-new-category input {
  flex: 1;
  box-sizing: border-box;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid #d7cfc5;
  font-size: 13px;
  font-family: inherit;
}
</style>
