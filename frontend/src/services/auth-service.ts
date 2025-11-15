import api from './api';
import { User, LoginForm, RegisterForm } from '@/types/auth';
import { ApiResponse } from '@/types/common';

export const authService = {
  async register(data: RegisterForm): Promise<{ success: boolean; user?: User; token?: string; message?: string }> {
    const response = await api.post('/users/register', data);
    return response.data;
  },

  async login(data: LoginForm): Promise<{ success: boolean; user?: User; token?: string; message?: string }> {
    const response = await api.post('/users/login', data);
    return response.data;
  },

  async getCurrentUser(): Promise<ApiResponse<User>> {
    const response = await api.get('/users/me');
    return response.data;
  },

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  },

  setAuth(token: string, user: User): void {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user_data', JSON.stringify(user));
  },

  getStoredAuth(): { token: string | null; user: User | null } {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    const user = userData ? JSON.parse(userData) : null;
    
    return { token, user };
  },
};