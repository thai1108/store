import { ref } from 'vue';
import { adminService } from '@/services/admin-service';
import { Order } from '@/types/order';
import { useInfiniteScroll } from '@/composables/useInfiniteScroll';

export const useOrders = () => {
  const loading = ref(false);
  const error = ref<string | null>(null);

  const {
    items: orders,
    loading: loadingMore,
    hasMore,
    loadMore,
    refresh,
  } = useInfiniteScroll<Order>({
    fetchFn: async (cursor) => {
      const response = await adminService.getAllOrders(cursor);
      return {
        data: response.data,
        pagination: response.pagination,
      };
    },
    limit: 20,
  });

  const fetchOrders = async () => {
    await refresh();
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await adminService.updateOrderStatus(orderId, status);
      if (response.success) {
        await refresh();
        return { success: true, data: response.data };
      } else {
        error.value = response.message || 'Failed to update order status';
        return { success: false, message: error.value };
      }
    } catch (err) {
      error.value = 'An error occurred while updating order status';
      return { success: false, message: error.value };
    } finally {
      loading.value = false;
    }
  };

  return {
    orders,
    loading,
    loadingMore,
    hasMore,
    error,
    fetchOrders,
    loadMore,
    updateOrderStatus,
  };
};
