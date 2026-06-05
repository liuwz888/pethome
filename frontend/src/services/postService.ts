import axios from 'axios';
import { getToken } from './authService';

const API_BASE_URL = 'http://localhost:8080/api';

const instance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 添加请求拦截器
instance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 添加响应拦截器
instance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const postService = {
  // 获取所有帖子
  getAllPosts: () => instance.get('/posts'),

  // 获取单个帖子
  getPostById: (id: number) => instance.get(`/posts/${id}`),

  // 发布新帖子
  publishPost: (content: string) => {
    return instance.post('/posts', { content });
  },

  // 点赞帖子
  likePost: (id: number) => {
    return instance.post(`/posts/${id}/like`, { postId: id });
  },

  // 评论帖子
  commentPost: (id: number, content: string) => {
    return instance.post(`/posts/${id}/comment`, { content });
  },

  // 删除帖子
  deletePost: (id: number) => instance.delete(`/posts/${id}`),
};
