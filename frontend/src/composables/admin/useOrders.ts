import { ref } from 'vue';
import { adminService } from '@/services/admin-service';
import { Order } from '@/types/order';

export const useOrders = () => {
  const orders = ref<Order[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchOrders = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await adminService.getAllOrders();
      if (response.success && response.data) {
        orders.value = response.data;
      } else {
        error.value = response.message || 'Failed to fetch orders';
      }
    } catch (err) {
      error.value = 'An error occurred while fetching orders';
    } finally {
      loading.value = false;
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await adminService.updateOrderStatus(orderId, status);
      if (response.success) {
        await fetchOrders();
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
    error,
    fetchOrders,
    updateOrderStatus,
  };
};
