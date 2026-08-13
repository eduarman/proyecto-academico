import { defineStore } from 'pinia';
import http from '../services/http';
import { useCoursesStore } from './courses';

export const useEnrollmentsStore = defineStore('enrollments', {
  state: () => ({
    mine: [],
    byCourse: [],
    all: [],
    loading: false,
    error: null,
  }),
  actions: {
    async fetchAllAdmin() {
      this.loading = true;
      this.error = null;
      try {
        const courses = useCoursesStore();
        const lists = await Promise.all(
          courses.items.map((course) => http.get(`/courses/${course.id}/enrollments`).then((res) => res.data)),
        );
        this.all = lists.flat();
      } catch (err) {
        this.error = err.response?.data?.message ?? 'No se pudieron cargar las inscripciones';
      } finally {
        this.loading = false;
      }
    },

    async fetchMine() {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await http.get('/enrollments/me');
        this.mine = data;
      } catch (err) {
        this.error = err.response?.data?.message ?? 'No se pudieron cargar tus inscripciones';
      } finally {
        this.loading = false;
      }
    },

    async fetchByCourse(courseId) {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await http.get(`/courses/${courseId}/enrollments`);
        this.byCourse = data;
      } catch (err) {
        this.error = err.response?.data?.message ?? 'No se pudieron cargar las inscripciones del curso';
      } finally {
        this.loading = false;
      }
    },

    async enroll(courseId) {
      const { data } = await http.post(`/courses/${courseId}/enrollments`);
      this.mine.push(data);
      return data;
    },

    async changeStatus(id, status) {
      const { data } = await http.patch(`/enrollments/${id}/estado`, { status });
      const mineIndex = this.mine.findIndex((entry) => entry.id === id);
      if (mineIndex !== -1) this.mine[mineIndex] = data;
      const courseIndex = this.byCourse.findIndex((entry) => entry.id === id);
      if (courseIndex !== -1) this.byCourse[courseIndex] = data;
      const allIndex = this.all.findIndex((entry) => entry.id === id);
      if (allIndex !== -1) this.all[allIndex] = data;
      return data;
    },
  },
});
