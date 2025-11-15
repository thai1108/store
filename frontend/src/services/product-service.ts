import api from './api';
import { Product, ProductFilter } from '@/types/product';
import { ApiResponse } from '@/types/common';

export const productService = {
  async getAll(filter?: ProductFilter): Promise<ApiResponse<Product[]>> {
    const params = new URLSearchParams();
    
    if (filter?.category) params.append('category', filter.category);
    if (filter?.inStock !== undefined) params.append('inStock', filter.inStock.toString());
    if (filter?.minPrice !== undefined) params.append('minPrice', filter.minPrice.toString());
    if (filter?.maxPrice !== undefined) params.append('maxPrice', filter.maxPrice.toString());

    const response = await api.get(`/products?${params.toString()}`);
    return response.data;
  },

  async getById(id: string): Promise<ApiResponse<Product>> {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  async create(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Product>> {
    const response = await api.post('/products', data);
    return response.data;
  },

  async update(id: string, data: Partial<Product>): Promise<ApiResponse<Product>> {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<ApiResponse<boolean>> {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
};