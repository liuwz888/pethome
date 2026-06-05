import axios from 'axios';

const API_BASE = '/api';

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'REFUNDING' | 'REFUNDED';

export interface Order {
  id: number;
  petOwner?: any;
  serviceProvider?: any;
  product?: any;
  type?: string;
  status: OrderStatus;
  address: string;
  serviceType: string;
  scheduledTime: string;
  amount: number;
  createdAt: string;
  updatedAt: string;
}

export const getMyOrders = async (): Promise<Order[]> => {
  const response = await axios.get(`${API_BASE}/orders`);
  return response.data;
};

export const getOrderById = async (id: number): Promise<Order> => {
  const response = await axios.get(`${API_BASE}/orders/${id}`);
  return response.data;
};

export const createOrder = async (data: {
  productId?: number;
  address: string;
  serviceType: string;
  scheduledTime?: string;
  amount: number;
}): Promise<Order> => {
  const response = await axios.post(`${API_BASE}/orders`, data);
  return response.data;
};

export const updateOrderStatus = async (id: number, status: OrderStatus): Promise<Order> => {
  const response = await axios.put(`${API_BASE}/orders/${id}/status?status=${status}`);
  return response.data;
};
