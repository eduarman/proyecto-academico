import { defineStore } from 'pinia';
import http from '../services/http';

export const useContentStore = defineStore('content', {
  state: () => ({
    modules: [],
    loading: false,
    error: null,
  }),
  actions: {
    async fetchByCourse(courseId) {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await http.get(`/courses/${courseId}/content`);
        this.modules = data;
      } catch (err) {
        this.error = err.response?.data?.message ?? 'No se pudo cargar el contenido del curso';
      } finally {
        this.loading = false;
      }
    },

    async createModule(courseId, title) {
      const { data } = await http.post(`/courses/${courseId}/modules`, { title });
      this.modules.push({ ...data, lessons: [] });
      return data;
    },

    async removeModule(id) {
      await http.delete(`/modules/${id}`);
      this.modules = this.modules.filter((module) => module.id !== id);
    },

    async createLesson(moduleId, { title, type, file }) {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('type', type);
      formData.append('file', file);
      const { data } = await http.post(`/modules/${moduleId}/lessons`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const module = this.modules.find((m) => m.id === moduleId);
      if (module) module.lessons.push(data);
      return data;
    },

    async removeLesson(moduleId, lessonId) {
      await http.delete(`/lessons/${lessonId}`);
      const module = this.modules.find((m) => m.id === moduleId);
      if (module) module.lessons = module.lessons.filter((lesson) => lesson.id !== lessonId);
    },

    async openLessonFile(lesson) {
      const { data } = await http.get(`/lessons/${lesson.id}/file`, { responseType: 'blob' });
      const blobUrl = URL.createObjectURL(new Blob([data], { type: lesson.mimeType }));
      window.open(blobUrl, '_blank');
    },
  },
});
