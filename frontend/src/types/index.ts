export type ProductCategory = 'food' | 'toys' | 'accessories' | 'healthcare' | 'services';

export interface Product {
  id: number;
  name: string;
  price: number;
  category: ProductCategory;
  description?: string;
  imageUrl?: string;
  tags?: string[];
}

export interface CartItem extends Product {
  quantity: number;
}

export interface WishlistItem extends Product {
  addedAt: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  items: CartItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed';
  createdAt: string;
  paymentMethod: 'alipay' | 'wechat' | 'offline';
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'supplier' | 'customer' | 'service_provider';
  status?: 'active' | 'suspended';
  phone?: string;
  address?: string;
  avatar?: string;
  createdAt?: string;
}

// Admin product form
export interface ProductForm {
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  tags: string[];
  imageUrl?: string;
}

// Admin user form
export interface UserForm {
  username: string;
  email: string;
  role: 'admin' | 'supplier' | 'customer' | 'service_provider';
  status: 'active' | 'suspended';
  phone?: string;
  address?: string;
}