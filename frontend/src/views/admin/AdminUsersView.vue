<template>
  <AdminSidebar>
    <div class="admin-header">
      <div>
        <h1 class="admin-header__title">Usuarios y roles</h1>
        <p class="admin-header__subtitle">Solo el rol Administrador puede gestionar usuarios.</p>
      </div>
      <button type="button" class="admin-btn-primary" @click="openCreate">+ Crear usuario</button>
    </div>

    <p v-if="feedback" class="admin-alert" :class="feedback.type">{{ feedback.message }}</p>

    <div class="admin-card">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Rol</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users.items" :key="user.id">
            <td class="is-strong">{{ user.firstName }} {{ user.lastName }}</td>
            <td>{{ user.email }}</td>
            <td>
              <select
                class="admin-role-select"
                :value="user.role"
                :disabled="user.id === auth.user?.id"
                @change="onRoleChange(user, $event.target.value)"
              >
                <option value="ADMIN">Administrador</option>
                <option value="ESTUDIANTE">Estudiante</option>
              </select>
            </td>
            <td>
              <button
                type="button"
                class="admin-badge admin-badge--clickable"
                :class="user.status === 'ACTIVO' ? 'admin-badge--ok' : 'admin-badge--danger'"
                :disabled="user.id === auth.user?.id"
                @click="onToggleStatus(user)"
              >
                {{ user.status }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="!users.items.length" class="admin-table__empty">No hay usuarios registrados.</p>
    </div>

    <div v-if="dialogOpen" class="admin-dialog-backdrop" @click.self="dialogOpen = false">
      <div class="admin-dialog">
        <p class="admin-dialog__title">Crear usuario</p>
        <p v-if="dialogError" class="admin-alert error">{{ dialogError }}</p>

        <div class="admin-field">
          <label>Nombre</label>
          <input v-model="form.firstName" type="text" minlength="2" />
        </div>
        <div class="admin-field">
          <label>Apellido</label>
          <input v-model="form.lastName" type="text" minlength="2" />
        </div>
        <div class="admin-field">
          <label>Correo</label>
          <input v-model="form.email" type="email" />
        </div>
        <div class="admin-field">
          <label>Contraseña temporal</label>
          <input v-model="form.password" type="password" minlength="8" />
          <p class="admin-field__hint">Mínimo 8 caracteres, una mayúscula y un número.</p>
        </div>
        <div class="admin-field">
          <label>Rol</label>
          <select v-model="form.role">
            <option value="ESTUDIANTE">Estudiante</option>
            <option value="ADMIN">Administrador</option>
          </select>
        </div>

        <div class="admin-dialog__actions">
          <button type="button" class="is-primary" :disabled="saving" @click="onCreate">
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
import AdminSidebar from '../../components/AdminSidebar.vue';
import { useAuthStore } from '../../stores/auth';
import { useUsersStore } from '../../stores/users';

const auth = useAuthStore();
const users = useUsersStore();

const dialogOpen = ref(false);
const dialogError = ref(null);
const saving = ref(false);
const feedback = ref(null);
const form = reactive({ firstName: '', lastName: '', email: '', password: '', role: 'ESTUDIANTE' });

function openCreate() {
  Object.assign(form, { firstName: '', lastName: '', email: '', password: '', role: 'ESTUDIANTE' });
  dialogError.value = null;
  dialogOpen.value = true;
}

async function onCreate() {
  saving.value = true;
  dialogError.value = null;
  try {
    await users.createUser({ ...form });
    dialogOpen.value = false;
  } catch (err) {
    dialogError.value = err.response?.data?.message ?? 'No se pudo crear el usuario';
  } finally {
    saving.value = false;
  }
}

async function onRoleChange(user, role) {
  feedback.value = null;
  try {
    await users.updateUser(user.id, { role });
  } catch (err) {
    feedback.value = { type: 'error', message: err.response?.data?.message ?? 'No se pudo cambiar el rol' };
  }
}

async function onToggleStatus(user) {
  feedback.value = null;
  const status = user.status === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
  try {
    await users.updateUser(user.id, { status });
  } catch (err) {
    feedback.value = { type: 'error', message: err.response?.data?.message ?? 'No se pudo cambiar el estado' };
  }
}

onMounted(() => users.fetchAll());
</script>

<style scoped>
.admin-role-select {
  border: 1px solid var(--cursos-border);
  border-radius: 8px;
  padding: 5px 8px;
  font-size: 12.5px;
  font-weight: 600;
  background: #fff;
  font-family: inherit;
}

.admin-badge--clickable {
  cursor: pointer;
}

.admin-badge--clickable:disabled {
  cursor: default;
  opacity: 0.6;
}
.edu{
  color:#fff;
}
.admin-field__hint {
  font-size: 11.5px;
  color: var(--cursos-text-muted);
  margin: -8px 0 12px;
}
</style>
