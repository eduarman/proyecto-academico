import axios from 'axios';
import { useAuthStore } from '../stores/auth';

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api',
  withCredentials: true,
});

http.interceptors.request.use((config) => {
  const auth = useAuthStore();
  if (auth.accessToken) {
    config.headers.Authorization = `Bearer ${auth.accessToken}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const auth = useAuthStore();
    const original = error.config;

    if (error.response?.status === 401 && !original._retry && original.url !== '/auth/refresh') {
      original._retry = true;
      const refreshed = await auth.tryRefresh();
      if (refreshed) {
        original.headers.Authorization = `Bearer ${auth.accessToken}`;
        return http(original);
      }
      auth.clearSession();
    }

    return Promise.reject(error);
  },
);

export default http;
