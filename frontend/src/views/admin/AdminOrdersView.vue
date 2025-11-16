<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useOrders } from '@/composables/admin/useOrders';
import { Order } from '@/types/order';
import OrderTable from '@/components/admin/OrderTable.vue';
import OrderModal from '@/components/admin/OrderModal.vue';

const { t } = useI18n();
const { orders, loading, fetchOrders, updateOrderStatus } = useOrders();

const showModal = ref(false);
const selectedOrder = ref<Order | null>(null);

const handleView = (order: Order) => {
  selectedOrder.value = order;
  showModal.value = true;
};

const handleUpdateStatus = async (orderId: string, status: Order['status']) => {
  const result = await updateOrderStatus(orderId, status);
  if (result.success) {
    alert(t('admin.orderManagement.statusUpdated'));
    if (selectedOrder.value?.id === orderId) {
      selectedOrder.value = result.data || null;
    }
  } else {
    alert(result.message || t('errors.general'));
  }
};

onMounted(() => {
  fetchOrders();
});
</script>

<template>
  <div class="admin-orders-view">
    <div class="section-header">
      <h2>{{ $t('admin.orderManagement.title') }}</h2>
    </div>

    <OrderTable
      :orders="orders"
      :loading="loading"
      @view="handleView"
    />

    <OrderModal
      :show="showModal"
      :order="selectedOrder"
      @close="showModal = false"
      @update-status="handleUpdateStatus"
    />
  </div>
</template>

<style scoped>
.admin-orders-view {
  padding: 30px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-header {
  margin-bottom: 20px;
}

.section-header h2 {
  font-size: 1.5rem;
  color: #2d3748;
  margin: 0;
}

@media (max-width: 768px) {
  .admin-orders-view {
    padding: 20px;
  }
}
</style>
