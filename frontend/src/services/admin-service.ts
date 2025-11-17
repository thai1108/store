import api from './api';
import { ApiResponse } from '@/types/common';
import { Order } from '@/types/order';
import { User } from '@/types/auth';
import { Product } from '@/types/product';

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    nextCursor: string | null;
    hasMore: boolean;
    limit: number;
  };
  message?: string;
}

export const adminService = {
  // Product Management
  async getAllProducts(cursor?: string, limit?: number): Promise<PaginatedResponse<Product>> {
    try {
      const params = new URLSearchParams();
      if (cursor) params.append('cursor', cursor);
      if (limit) params.append('limit', limit.toString());

      const response = await api.get<PaginatedResponse<Product>>(`/admin/products?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        data: [],
        pagination: { nextCursor: null, hasMore: false, limit: 20 },
        message: error.response?.data?.message || 'Failed to fetch products',
      };
    }
  },

  async createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Product>> {
    try {
      const response = await api.post<ApiResponse<Product>>('/admin/products', data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create product',
      };
    }
  },

  async updateProduct(id: string, data: Partial<Product>): Promise<ApiResponse<Product>> {
    try {
      const response = await api.put<ApiResponse<Product>>(`/admin/products/${id}`, data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update product',
      };
    }
  },

  async deleteProduct(id: string): Promise<ApiResponse<boolean>> {
    try {
      const response = await api.delete<ApiResponse<boolean>>(`/admin/products/${id}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete product',
      };
    }
  },

  // Order Management
  async getAllOrders(cursor?: string, limit?: number): Promise<PaginatedResponse<Order>> {
    try {
      const params = new URLSearchParams();
      if (cursor) params.append('cursor', cursor);
      if (limit) params.append('limit', limit.toString());

      const response = await api.get<PaginatedResponse<Order>>(`/admin/orders?${params.toString()}`);
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

  async updateOrderStatus(orderId: string, status: Order['status']): Promise<ApiResponse<Order>> {
    try {
      const response = await api.put<ApiResponse<Order>>(`/admin/orders/${orderId}/status`, { status });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update order status',
      };
    }
  },

  // User Management
  async getAllUsers(cursor?: string, limit?: number): Promise<PaginatedResponse<User>> {
    try {
      const params = new URLSearchParams();
      if (cursor) params.append('cursor', cursor);
      if (limit) params.append('limit', limit.toString());

      const response = await api.get<PaginatedResponse<User>>(`/admin/users?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        data: [],
        pagination: { nextCursor: null, hasMore: false, limit: 20 },
        message: error.response?.data?.message || 'Failed to fetch users',
      };
    }
  },
};
