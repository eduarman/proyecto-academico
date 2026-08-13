import { defineStore } from 'pinia';
import http from '../services/http';

export const useCoursesStore = defineStore('courses', {
  state: () => ({
    items: [],
    loading: false,
    error: null,
  }),
  actions: {
    async fetchCourses(filters = {}) {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await http.get('/courses', { params: filters });
        this.items = data;
      } catch (err) {
        this.error = err.response?.data?.message ?? 'No se pudieron cargar los cursos';
      } finally {
        this.loading = false;
      }
    },

    async fetchOne(id) {
      const existing = this.items.find((course) => course.id === id);
      if (existing) return existing;
      const { data } = await http.get(`/courses/${id}`);
      return data;
    },

    async createCourse(payload) {
      const { data } = await http.post('/courses', payload);
      this.items.push(data);
      return data;
    },

    async updateCourse(id, payload) {
      const { data } = await http.patch(`/courses/${id}`, payload);
      const index = this.items.findIndex((course) => course.id === id);
      if (index !== -1) {
        this.items[index] = data;
      }
      return data;
    },

    async removeCourse(id) {
      await http.delete(`/courses/${id}`);
      this.items = this.items.filter((course) => course.id !== id);
    },
  },
});
