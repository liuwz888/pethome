import axios from 'axios';

const API_BASE = '/api';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  tags: string[];
  isActive?: boolean;
  supplier?: any;
}

export const getAllProducts = async (): Promise<Product[]> => {
  const response = await axios.get(`${API_BASE}/products`);
  return response.data;
};

export const getProductById = async (id: number): Promise<Product> => {
  const response = await axios.get(`${API_BASE}/products/${id}`);
  return response.data;
};

export const searchProductsByTag = async (tag: string): Promise<Product[]> => {
  const response = await axios.get(`${API_BASE}/products/search?tag=${encodeURIComponent(tag)}`);
  return response.data;
};

export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  const response = await axios.get(`${API_BASE}/products/category/${category}`);
  return response.data;
};

export const createProduct = async (data: { name: string; description: string; price: number; tags: string[]; category?: string; imageUrl?: string }): Promise<Product> => {
  const response = await axios.post(`${API_BASE}/products`, data);
  return response.data;
};

export const updateProduct = async (id: number, data: { name: string; description: string; price: number; tags: string[] }): Promise<Product> => {
  const response = await axios.put(`${API_BASE}/products/${id}`, data);
  return response.data;
};

export const deleteProduct = async (id: number): Promise<void> => {
  await axios.delete(`${API_BASE}/products/${id}`);
};
