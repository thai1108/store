import api from './api';
import { Order } from '@/types/order';
import { ApiResponse } from '@/types/common';

export interface PaginatedOrderResponse {
  success: boolean;
  data: Order[];
  pagination: {
    nextCursor: string | null;
    hasMore: boolean;
    limit: number;
  };
  message?: string;
}

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

  async getUserOrders(cursor?: string, limit?: number): Promise<PaginatedOrderResponse> {
    try {
      const params = new URLSearchParams();
      if (cursor) params.append('cursor', cursor);
      if (limit) params.append('limit', limit.toString());

      const response = await api.get<PaginatedOrderResponse>(`/users/me/orders?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        data: [],
        pagination: { nextCursor: null, hasMore: false, limit: 20 },
        message: error.response?.data?.message || 'Failed to fetch orders',
      };
    }
  },
};