import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token storage
export const getToken = () => localStorage.getItem('auth_token');
export const setToken = (token: string) => localStorage.setItem('auth_token', token);
export const clearToken = () => localStorage.removeItem('auth_token');

// Auth API
export const login = async (username: string, password: string) => {
  const response = await api.post('/auth/login', { username, password });
  if (response.data.token) {
    setToken(response.data.token);
  }
  return response.data;
};

export const register = async (data: { username: string; password: string; email: string; role: string }) => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

// Add token to requests
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
