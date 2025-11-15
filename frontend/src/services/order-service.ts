import api from './api';
import { Order } from '@/types/order';
import { ApiResponse } from '@/types/common';

export const orderService = {
  async create(data: {
    items: { productId: string; quantity: number }[];
    customerInfo: {
      name: string;
      phone: string;
      email?: string;
      address?: string;
    };
    notes?: string;
  }): Promise<ApiResponse<Order>> {
    const response = await api.post('/orders', data);
    return response.data;
  },

  async getById(id: string): Promise<ApiResponse<Order>> {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  async updateStatus(id: string, status: Order['status']): Promise<ApiResponse<Order>> {
    const response = await api.put(`/orders/${id}/status`, { status });
    return response.data;
  },

  async getUserOrders(): Promise<ApiResponse<Order[]>> {
    const response = await api.get('/users/me/orders');
    return response.data;
  },
};