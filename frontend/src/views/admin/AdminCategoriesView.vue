<template>
  <AdminSidebar>
    <div class="admin-header">
      <div>
        <h1 class="admin-header__title">Categorías de curso</h1>
        <p class="admin-header__subtitle">
          {{ categories.items.length }} categoría(s). Aparecen automáticamente en el formulario de crear curso.
        </p>
      </div>
    </div>

    <div class="admin-card admin-category-form">
      <p v-if="formError" class="admin-alert error">{{ formError }}</p>
      <form class="admin-category-form__row" @submit.prevent="onCreate">
        <input
          v-model="label"
          type="text"
          minlength="2"
          placeholder="Nombre de la nueva categoría, ej. Diseño UX/UI"
          required
        />
        <button type="submit" class="admin-btn-primary" :disabled="creating">
          {{ creating ? 'Agregando…' : '+ Agregar categoría' }}
        </button>
      </form>
    </div>

    <p v-if="rowFeedback" class="admin-alert" :class="rowFeedback.type">{{ rowFeedback.message }}</p>

    <div class="admin-card">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Código</th>
            <th>Cursos</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="cat in categories.items" :key="cat.code">
            <td class="is-strong">
              <template v-if="editingCode === cat.code">
                <input v-model="editLabel" type="text" minlength="2" class="admin-category-inline-input" />
              </template>
              <template v-else>{{ cat.label }}</template>
            </td>
            <td>{{ cat.code }}</td>
            <td>{{ courseCount(cat.code) }}</td>
            <td>
              <div class="admin-actions-row" v-if="editingCode === cat.code">
                <button type="button" class="admin-link-btn" :disabled="savingEdit" @click="onSaveEdit(cat.code)">
                  {{ savingEdit ? 'Guardando…' : 'Guardar' }}
                </button>
                <button type="button" class="admin-link-btn" @click="editingCode = null">Cancelar</button>
              </div>
              <div class="admin-actions-row" v-else>
                <button type="button" class="admin-link-btn" @click="startEdit(cat)">Editar</button>
                <button
                  type="button"
                  class="admin-link-btn admin-link-btn--danger"
                  :disabled="courseCount(cat.code) > 0"
                  :title="courseCount(cat.code) > 0 ? 'No se puede eliminar: hay cursos usando esta categoría' : ''"
                  @click="onDelete(cat)"
                >
                  Eliminar
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="!categories.items.length" class="admin-table__empty">Todavía no hay categorías.</p>
    </div>
  </AdminSidebar>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import AdminSidebar from '../../components/AdminSidebar.vue';
import { useCategoriesStore } from '../../stores/categories';
import { useCoursesStore } from '../../stores/courses';

const categories = useCategoriesStore();
const courses = useCoursesStore();

const label = ref('');
const creating = ref(false);
const formError = ref(null);

const editingCode = ref(null);
const editLabel = ref('');
const savingEdit = ref(false);
const rowFeedback = ref(null);

function courseCount(code) {
  return courses.items.filter((course) => course.category === code).length;
}

async function onCreate() {
  if (!label.value.trim()) return;
  creating.value = true;
  formError.value = null;
  try {
    await categories.createCategory(label.value.trim());
    label.value = '';
  } catch (err) {
    formError.value = err.response?.data?.message ?? 'No se pudo crear la categoría';
  } finally {
    creating.value = false;
  }
}

function startEdit(cat) {
  editingCode.value = cat.code;
  editLabel.value = cat.label;
  rowFeedback.value = null;
}

async function onSaveEdit(code) {
  if (!editLabel.value.trim()) return;
  savingEdit.value = true;
  rowFeedback.value = null;
  try {
    await categories.updateCategory(code, editLabel.value.trim());
    editingCode.value = null;
  } catch (err) {
    rowFeedback.value = { type: 'error', message: err.response?.data?.message ?? 'No se pudo renombrar la categoría' };
  } finally {
    savingEdit.value = false;
  }
}

async function onDelete(cat) {
  rowFeedback.value = null;
  try {
    await categories.removeCategory(cat.code);
  } catch (err) {
    rowFeedback.value = { type: 'error', message: err.response?.data?.message ?? 'No se pudo eliminar la categoría' };
  }
}

onMounted(async () => {
  await Promise.all([categories.fetchAll(), courses.fetchCourses()]);
});
</script>

<style scoped>
.admin-category-form {
  padding: 20px;
  margin-bottom: 20px;
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

.admin-category-inline-input {
  box-sizing: border-box;
  padding: 6px 8px;
  border-radius: 6px;
  border: 1px solid #d7cfc5;
  font-size: 13px;
  font-family: inherit;
  width: 100%;
  max-width: 260px;
}

.admin-actions-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.admin-link-btn--danger:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
