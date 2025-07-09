import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  login: (credentials: { username: string; password: string }) =>
    api.post('/auth/token', new URLSearchParams(credentials), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }),
  
  register: (userData: { username: string; email: string; password: string }) =>
    api.post('/auth/register', userData),
  
  getMe: () => api.get('/auth/me'),
};

export const linksAPI = {
  getLinks: async (params?: { skip?: number; limit?: number; search?: string }) => {
    const response = await api.get('/links', { params });
    return response.data;
  },
  
  getLink: async (id: number) => {
    const response = await api.get(`/links/id/${id}`);
    return response.data;
  },
  
  createLink: async (linkData: {
    short_code: string;
    target_url: string;
    title: string;
    description?: string;
  }) => {
    const response = await api.post('/links', linkData);
    return response.data;
  },
  
  updateLink: async (id: number, linkData: {
    target_url?: string;
    title?: string;
    description?: string;
    is_active?: boolean;
  }) => {
    const response = await api.put(`/links/${id}`, linkData);
    return response.data;
  },
  
  deleteLink: async (id: number) => {
    const response = await api.delete(`/links/${id}`);
    return response.data;
  },
  
  getLinkStats: async (shortCode: string) => {
    const response = await api.get(`/links/stats/${shortCode}`);
    return response.data;
  },
};

export const healthAPI = {
  check: async () => {
    const response = await api.get('/health');
    return response.data;
  },
  info: async () => {
    const response = await api.get('/info');
    return response.data;
  },
}; 