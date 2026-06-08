import axios from 'axios';
import { getToken } from './authService';

const API_BASE_URL = 'http://localhost:8080/api';

const instance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

instance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface Post {
  id: number;
  userId: number;
  username: string;
  avatar: string;
  content: string;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  comments?: Comment[];
}

export interface Comment {
  id: number;
  userId: number;
  username: string;
  avatar: string;
  content: string;
  createdAt: string;
}

export const postService = {
  getAllPosts: async (): Promise<Post[]> => {
    const response = await instance.get<Post[]>('/posts');
    return response.data;
  },

  getPostById: async (id: number): Promise<Post> => {
    const response = await instance.get<Post>(`/posts/${id}`);
    return response.data;
  },

  publishPost: async (content: string): Promise<Post> => {
    const response = await instance.post<Post>('/posts', { content });
    return response.data;
  },

  likePost: async (id: number): Promise<void> => {
    await instance.post(`/posts/${id}/like`, { postId: id });
  },

  commentPost: async (id: number, content: string): Promise<void> => {
    await instance.post(`/posts/${id}/comment`, { content });
  },

  deletePost: async (id: number): Promise<void> => {
    await instance.delete(`/posts/${id}`);
  },
};
