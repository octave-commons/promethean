import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export const actorsApi = {
  getAll: () => api.get('/actors'),
  getById: (id: string) => api.get(`/actors/${id}`),
  create: (data: any) => api.post('/actors', data),
  update: (id: string, data: any) => api.put(`/actors/${id}`, data),
  delete: (id: string) => api.delete(`/actors/${id}`),
  tick: (id: string) => api.post(`/actors/${id}/tick`),
};

export const contextsApi = {
  getAll: () => api.get('/contexts'),
  getById: (id: string) => api.get(`/contexts/${id}`),
  create: (data: any) => api.post('/contexts', data),
  compile: (id: string) => api.post(`/contexts/${id}/compile`),
};

export const toolsApi = {
  getAll: () => api.get('/tools'),
  getById: (id: string) => api.get(`/tools/${id}`),
  execute: (id: string, data: any) => api.post(`/tools/${id}/execute`, data),
};

export const systemApi = {
  getStatus: () => api.get('/system/status'),
  getStats: () => api.get('/system/stats'),
};

export default api;
