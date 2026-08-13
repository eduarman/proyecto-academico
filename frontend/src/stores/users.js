import { defineStore } from 'pinia';
import http from '../services/http';

export const useUsersStore = defineStore('users', {
  state: () => ({
    items: [],
    loading: false,
    error: null,
  }),
  actions: {
    async fetchAll() {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await http.get('/users');
        this.items = data;
      } catch (err) {
        this.error = err.response?.data?.message ?? 'No se pudieron cargar los usuarios';
      } finally {
        this.loading = false;
      }
    },

    async updateUser(id, payload) {
      const { data } = await http.patch(`/users/${id}`, payload);
      const index = this.items.findIndex((user) => user.id === id);
      if (index !== -1) this.items[index] = data;
      return data;
    },

    async createUser({ firstName, lastName, email, password, role }) {
      await http.post('/auth/register', { firstName, lastName, email, password });
      await this.fetchAll();
      const created = this.items.find((user) => user.email === email);
      if (created && role && role !== created.role) {
        await this.updateUser(created.id, { role });
      }
      return created;
    },
  },
});
