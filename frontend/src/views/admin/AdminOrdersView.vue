<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useOrders } from '@/composables/admin/useOrders';
import { Order } from '@/types/order';
import OrderTable from '@/components/admin/OrderTable.vue';
import OrderModal from '@/components/admin/OrderModal.vue';

const { t } = useI18n();
const { 
  orders, 
  loading,
  loadingMore,
  hasMore,
  fetchOrders,
  loadMore,
  updateOrderStatus 
} = useOrders();

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
  <div class="admin-orders-view page">
    <div class="section-header">
      <h2>{{ $t('admin.orderManagement.title') }}</h2>
    </div>

    <OrderTable
      :orders="orders"
      :loading="loading"
      @view="handleView"
    />

    <div v-if="hasMore" class="load-more-container">
      <button 
        class="btn btn-secondary" 
        :disabled="loadingMore"
        @click="loadMore"
      >
        {{ loadingMore ? $t('common.loading') : $t('common.loadMore') }}
      </button>
    </div>

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

.section-header h2 {
  font-size: 1.5rem;
  color: #2d3748;
  margin: 0;
}

.load-more-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding: 20px;
}

.load-more-container .btn {
  min-width: 150px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-secondary {
  background: #718096;
  color: white;
}

.btn-secondary:hover {
  background: #4a5568;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .admin-orders-view {
    padding: 20px;
  }
}
</style>
