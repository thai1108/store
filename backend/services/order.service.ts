import { Order, CreateOrderRequest } from '@/types/order';
import { Environment, ApiResponse } from '@/types/common';
import { orderRepository } from '@/repositories/order.repository';
import { createSuccessResponse, createErrorResponse, validateEmail, validatePhone } from '@/utils/helpers';

export const orderService = {
  async create(env: Environment, data: CreateOrderRequest): Promise<ApiResponse<Order>> {
    try {
      // Validate customer info
      if (!data.customerInfo.name || data.customerInfo.name.trim().length < 2) {
        return createErrorResponse('Customer name must be at least 2 characters');
      }

      if (!validatePhone(data.customerInfo.phone)) {
        return createErrorResponse('Invalid phone number format');
      }

      if (data.customerInfo.email && !validateEmail(data.customerInfo.email)) {
        return createErrorResponse('Invalid email format');
      }

      // Validate order items
      if (!data.items || data.items.length === 0) {
        return createErrorResponse('Order must contain at least one item');
      }

      for (const item of data.items) {
        if (!item.productId || item.quantity <= 0) {
          return createErrorResponse('All items must have valid product ID and quantity > 0');
        }
      }

      const order = await orderRepository.create(env, data);
      return createSuccessResponse(order, 'Order created successfully');
    } catch (error) {
      console.error('Error creating order:', error);
      if (error instanceof Error) {
        return createErrorResponse('Failed to create order', error.message);
      }
      return createErrorResponse('Failed to create order');
    }
  },

  async getById(env: Environment, id: string): Promise<ApiResponse<Order>> {
    try {
      if (!id) {
        return createErrorResponse('Order ID is required');
      }

      const order = await orderRepository.getById(env, id);
      if (!order) {
        return createErrorResponse('Order not found');
      }

      return createSuccessResponse(order);
    } catch (error) {
      console.error('Error fetching order:', error);
      return createErrorResponse('Failed to fetch order');
    }
  },

  async getUserOrders(env: Environment, userId: string): Promise<ApiResponse<Order[]>> {
    try {
      if (!userId) {
        return createErrorResponse('User ID is required');
      }

      const orders = await orderRepository.getByUserId(env, userId);
      return createSuccessResponse(orders);
    } catch (error) {
      console.error('Error fetching user orders:', error);
      return createErrorResponse('Failed to fetch user orders');
    }
  },

  async updateStatus(env: Environment, id: string, status: Order['status']): Promise<ApiResponse<Order>> {
    try {
      if (!id) {
        return createErrorResponse('Order ID is required');
      }

      if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
        return createErrorResponse('Invalid order status');
      }

      const order = await orderRepository.updateStatus(env, id, status);
      if (!order) {
        return createErrorResponse('Order not found');
      }

      return createSuccessResponse(order, 'Order status updated successfully');
    } catch (error) {
      console.error('Error updating order status:', error);
      return createErrorResponse('Failed to update order status');
    }
  },
};