import { defineStore } from 'pinia';
import http from '../services/http';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    accessToken: null,
    ready: false,
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.accessToken && state.user),
    isAdmin: (state) => state.user?.role === 'ADMIN',
  },
  actions: {
    async login(credentials) {
      const { data } = await http.post('/auth/login', credentials);
      this.accessToken = data.accessToken;
      this.user = data.user;
    },

    async register(payload) {
      await http.post('/auth/register', payload);
    },

    async updateProfile(payload) {
      const { data } = await http.patch('/users/me', payload);
      this.user = { ...this.user, ...data };
      return data;
    },

    async changePassword(payload) {
      const { data } = await http.patch('/auth/password', payload);
      return data;
    },

    async forgotPassword(email) {
      const { data } = await http.post('/auth/forgot-password', { email });
      return data;
    },

    async logout() {
      try {
        await http.post('/auth/logout');
      } finally {
        this.clearSession();
      }
    },

    clearSession() {
      this.accessToken = null;
      this.user = null;
    },

    // Intenta recuperar la sesión al cargar la app usando la cookie httpOnly de refresh.
    async tryRefresh() {
      try {
        const { data } = await http.post('/auth/refresh');
        this.accessToken = data.accessToken;
        this.user = data.user;
        return true;
      } catch {
        this.clearSession();
        return false;
      }
    },

    async init() {
      if (!this.ready) {
        await this.tryRefresh();
        this.ready = true;
      }
    },
  },
});
