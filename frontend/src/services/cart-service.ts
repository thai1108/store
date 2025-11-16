import api from './api';
import { CartItem } from '@/types/order';

export interface CartData {
  items: CartItem[];
}

export interface CartResponse {
  success: boolean;
  data: CartData;
}

class CartService {
  async getCart(): Promise<CartItem[]> {
    try {
      const response = await api.get<CartResponse>('/cart');
      return response.data.data?.items || [];
    } catch (error: any) {
      if (error.response?.status === 401) {
        // Token is invalid, clear it
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        throw new Error('UNAUTHORIZED');
      }
      console.error('Failed to load cart from server:', error);
      return [];
    }
  }

  async saveCart(items: CartItem[]): Promise<void> {
    try {
      await api.post('/cart', { items });
    } catch (error: any) {
      if (error.response?.status === 401) {
        // Token is invalid, clear it
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        throw new Error('UNAUTHORIZED');
      }
      console.error('Failed to save cart to server:', error);
      throw error;
    }
  }
}

export default new CartService();
