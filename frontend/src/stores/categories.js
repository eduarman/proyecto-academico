import { defineStore } from 'pinia';
import http from '../services/http';

export const useCategoriesStore = defineStore('categories', {
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
        const { data } = await http.get('/categories');
        this.items = data;
      } catch (err) {
        this.error = err.response?.data?.message ?? 'No se pudieron cargar las categorías';
      } finally {
        this.loading = false;
      }
    },

    async createCategory(label) {
      const { data } = await http.post('/categories', { label });
      this.items.push(data);
      return data;
    },

    async updateCategory(code, label) {
      const { data } = await http.patch(`/categories/${code}`, { label });
      const index = this.items.findIndex((cat) => cat.code === code);
      if (index !== -1) this.items[index] = data;
      return data;
    },

    async removeCategory(code) {
      await http.delete(`/categories/${code}`);
      this.items = this.items.filter((cat) => cat.code !== code);
    },
  },
});
