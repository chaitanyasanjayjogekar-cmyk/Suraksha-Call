import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../utils/constants';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
});

// ── Attach token automatically ────────────────────────────────────────────────
api.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {}
  return config;
});

// ── Auto-refresh on 401 ───────────────────────────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refresh = await SecureStore.getItemAsync('refresh_token');
        if (refresh) {
          const res = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
            refresh_token: refresh,
          });
          const { access_token, refresh_token } = res.data;
          await SecureStore.setItemAsync('access_token', access_token);
          await SecureStore.setItemAsync('refresh_token', refresh_token);
          original.headers.Authorization = `Bearer ${access_token}`;
          return api(original);
        }
      } catch {
        await SecureStore.deleteItemAsync('access_token');
        await SecureStore.deleteItemAsync('refresh_token');
      }
    }
    const msg = error.response?.data?.detail || error.message || 'Network error';
    return Promise.reject(new Error(msg));
  }
);

// ── API calls ────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data: { name: string; email?: string; phone?: string; password: string }) =>
    api.post('/api/auth/register', data),
  login: (identifier: string, password: string) =>
    api.post('/api/auth/login', { identifier, password }),
  refresh: (refresh_token: string) =>
    api.post('/api/auth/refresh', { refresh_token }),
  me: () => api.get('/api/auth/me'),
  logout: (refresh_token: string) =>
    api.post('/api/auth/logout', { refresh_token }),
  getContacts: () => api.get('/api/auth/contacts'),
  addContact: (data: { name: string; phone: string; relation: string }) =>
    api.post('/api/auth/contacts', data),
  deleteContact: (id: number) => api.delete(`/api/auth/contacts/${id}`),
};

export const analysisAPI = {
  health: () => api.get('/api/health'),
  uploadAudio: (formData: FormData) =>
    api.post('/api/upload-audio', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  analyzeText: (transcript: string) =>
    api.post('/api/analyze-audio', { transcript }),
  demo: (type: 'normal' | 'scam') =>
    api.post(`/api/demo/${type}`),
  recentAnalyses: () => api.get('/api/recent-analyses'),
};

