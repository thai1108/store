import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { User } from '@/types/auth';
import { authService } from '@/services/auth-service';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const isAuthenticated = ref(false);

  const initAuth = () => {
    const storedAuth = authService.getStoredAuth();
    if (storedAuth.token && storedAuth.user) {
      token.value = storedAuth.token;
      user.value = storedAuth.user;
      isAuthenticated.value = true;
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await authService.login({ email, password });
      
      if (response.success && response.user && response.token) {
        user.value = response.user;
        token.value = response.token;
        isAuthenticated.value = true;
        
        authService.setAuth(response.token, response.user);
        
        return { success: true };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      return { success: false, message: 'Network error occurred' };
    }
  };

  const register = async (data: { email: string; password: string; name: string; phone?: string }): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await authService.register(data);
      
      if (response.success && response.user && response.token) {
        user.value = response.user;
        token.value = response.token;
        isAuthenticated.value = true;
        
        authService.setAuth(response.token, response.user);
        
        return { success: true };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      return { success: false, message: 'Network error occurred' };
    }
  };

  const logout = () => {
    user.value = null;
    token.value = null;
    isAuthenticated.value = false;
    authService.logout();
  };

  const isAdmin = computed(() => {
    return user.value?.role === 'admin';
  });

  return {
    user,
    token,
    isAuthenticated,
    isAdmin,
    initAuth,
    login,
    register,
    logout,
  };
});