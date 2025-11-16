import { ref, computed } from 'vue';
import { adminService } from '@/services/admin-service';
import { User } from '@/types/auth';

export const useUsers = () => {
  const users = ref<User[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const userStats = computed(() => ({
    total: users.value.length,
    customers: users.value.filter((u) => u.role === 'customer').length,
    admins: users.value.filter((u) => u.role === 'admin').length,
  }));

  const fetchUsers = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await adminService.getAllUsers();
      if (response.success && response.data) {
        users.value = response.data;
      } else {
        error.value = response.message || 'Failed to fetch users';
      }
    } catch (err) {
      error.value = 'An error occurred while fetching users';
    } finally {
      loading.value = false;
    }
  };

  return {
    users,
    loading,
    error,
    userStats,
    fetchUsers,
  };
};
