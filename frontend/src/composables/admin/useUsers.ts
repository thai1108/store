import { computed } from 'vue';
import { adminService } from '@/services/admin-service';
import { User } from '@/types/auth';
import { useInfiniteScroll } from '@/composables/useInfiniteScroll';

export const useUsers = () => {
  const {
    items: users,
    loading,
    loadingMore,
    hasMore,
    error,
    loadMore,
    refresh,
  } = useInfiniteScroll<User>({
    fetchFn: async (cursor) => {
      const response = await adminService.getAllUsers(cursor);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch users');
      }
      return {
        data: response.data,
        pagination: {
          nextCursor: response.pagination.nextCursor,
          hasMore: response.pagination.hasMore,
        },
      };
    },
  });

  const userStats = computed(() => ({
    total: users.value.length,
    customers: users.value.filter((u) => u.role === 'customer').length,
    admins: users.value.filter((u) => u.role === 'admin').length,
  }));

  return {
    users,
    loading,
    loadingMore,
    hasMore,
    error,
    userStats,
    loadMore,
    fetchUsers: refresh,
  };
};
