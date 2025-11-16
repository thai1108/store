import api from './api';
import { ApiResponse } from '@/types/common';
import { Order } from '@/types/order';
import { User } from '@/types/auth';

export const adminService = {
  // Order Management
  async getAllOrders(): Promise<ApiResponse<Order[]>> {
    try {
      const response = await api.get<ApiResponse<Order[]>>('/orders');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch orders',
      };
    }
  },

  async updateOrderStatus(orderId: string, status: Order['status']): Promise<ApiResponse<Order>> {
    try {
      const response = await api.put<ApiResponse<Order>>(`/orders/${orderId}/status`, { status });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update order status',
      };
    }
  },

  // User Management
  async getAllUsers(): Promise<ApiResponse<User[]>> {
    try {
      const response = await api.get<ApiResponse<User[]>>('/users');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch users',
      };
    }
  },
};
