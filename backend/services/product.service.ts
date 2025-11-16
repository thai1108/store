import { Product, CreateProductRequest, UpdateProductRequest, ProductFilter } from '@/types/product';
import { Environment, ApiResponse } from '@/types/common';
import { productRepository } from '@/repositories/product.repository';
import { createSuccessResponse, createErrorResponse } from '@/utils/helpers';
import { CursorPaginationParams, PaginatedResponse } from '@/utils/pagination';

export const productService = {
  async getAll(
    env: Environment, 
    filter?: ProductFilter,
    pagination?: CursorPaginationParams,
  ): Promise<PaginatedResponse<Product>> {
    try {
      const result = await productRepository.getAll(env, filter, pagination);
      
      return {
        success: true,
        data: result.data,
        pagination: {
          nextCursor: result.nextCursor,
          hasMore: result.hasMore,
          limit: pagination?.limit || 20,
        },
      };
    } catch (error) {
      console.error('Error fetching products:', error);
      return {
        success: false,
        data: [],
        pagination: { nextCursor: null, hasMore: false, limit: 20 },
        message: 'Failed to fetch products',
      };
    }
  },

  async getById(env: Environment, id: string): Promise<ApiResponse<Product>> {
    try {
      const product = await productRepository.getById(env, id);
      if (!product) {
        return createErrorResponse('Product not found');
      }
      return createSuccessResponse(product);
    } catch (error) {
      console.error('Error fetching product:', error);
      return createErrorResponse('Failed to fetch product');
    }
  },

  async create(env: Environment, data: CreateProductRequest): Promise<ApiResponse<Product>> {
    try {
      // Validate input
      if (!data.name || data.name.trim().length < 2) {
        return createErrorResponse('Product name must be at least 2 characters');
      }

      if (!data.price || data.price <= 0) {
        return createErrorResponse('Product price must be greater than 0');
      }

      if (!['snack', 'drink', 'milk-tea'].includes(data.category)) {
        return createErrorResponse('Invalid product category');
      }

      const product = await productRepository.create(env, data);
      return createSuccessResponse(product, 'Product created successfully');
    } catch (error) {
      console.error('Error creating product:', error);
      return createErrorResponse('Failed to create product');
    }
  },

  async update(env: Environment, data: UpdateProductRequest): Promise<ApiResponse<Product>> {
    try {
      if (!data.id) {
        return createErrorResponse('Product ID is required');
      }

      // Validate fields if provided
      if (data.name !== undefined && data.name.trim().length < 2) {
        return createErrorResponse('Product name must be at least 2 characters');
      }

      if (data.price !== undefined && data.price <= 0) {
        return createErrorResponse('Product price must be greater than 0');
      }

      if (data.category !== undefined && !['snack', 'drink', 'milk-tea'].includes(data.category)) {
        return createErrorResponse('Invalid product category');
      }

      const product = await productRepository.update(env, data.id, data);
      if (!product) {
        return createErrorResponse('Product not found');
      }

      return createSuccessResponse(product, 'Product updated successfully');
    } catch (error) {
      console.error('Error updating product:', error);
      return createErrorResponse('Failed to update product');
    }
  },

  async delete(env: Environment, id: string): Promise<ApiResponse<boolean>> {
    try {
      if (!id) {
        return createErrorResponse('Product ID is required');
      }

      const deleted = await productRepository.delete(env, id);
      if (!deleted) {
        return createErrorResponse('Product not found');
      }

      return createSuccessResponse(true, 'Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      return createErrorResponse('Failed to delete product');
    }
  },
};