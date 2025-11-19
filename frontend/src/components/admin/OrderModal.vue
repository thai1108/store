<script setup lang="ts">
import { Order } from '@/types/order';

interface Props {
  show: boolean;
  order: Order | null;
}

interface Emits {
  (e: 'close'): void;
  (e: 'updateStatus', orderId: string, status: Order['status']): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
};

const handleStatusChange = (orderId: string, event: Event) => {
  const target = event.target as HTMLSelectElement;
  emit('updateStatus', orderId, target.value as Order['status']);
};
</script>

<template>
  <div v-if="show && order" class="modal-overlay" @click="emit('close')">
    <div class="modal-content" @click.stop>
      <h3>{{ $t('admin.orderManagement.orderDetails') }}</h3>
      
      <div class="order-details">
        <div class="detail-section">
          <h4>{{ $t('admin.orderManagement.orderId') }}</h4>
          <code>{{ order.id }}</code>
        </div>

        <div class="detail-section">
          <h4>{{ $t('admin.orderManagement.status') }}</h4>
          <select 
            :value="order.status" 
            @change="handleStatusChange(order.id, $event)"
            class="status-select"
          >
            <option value="pending">{{ $t('admin.orderManagement.pending') }}</option>
            <option value="confirmed">{{ $t('admin.orderManagement.confirmed') }}</option>
            <option value="completed">{{ $t('admin.orderManagement.completed') }}</option>
            <option value="cancelled">{{ $t('admin.orderManagement.cancelled') }}</option>
          </select>
        </div>

        <div class="detail-section">
          <h4>{{ $t('admin.orderManagement.customerInfo') }}</h4>
          <p><strong>{{ $t('admin.orderManagement.name') }}:</strong> {{ order.customerInfo.name }}</p>
          <p><strong>{{ $t('admin.orderManagement.phone') }}:</strong> {{ order.customerInfo.phone }}</p>
          <p v-if="order.customerInfo.email"><strong>{{ $t('admin.orderManagement.email') }}:</strong> {{ order.customerInfo.email }}</p>
          <p v-if="order.customerInfo.address"><strong>{{ $t('admin.orderManagement.address') }}:</strong> {{ order.customerInfo.address }}</p>
        </div>

        <div class="detail-section">
          <h4>{{ $t('admin.orderManagement.items') }}</h4>
          <table class="items-table">
            <thead>
              <tr>
                <th>{{ $t('admin.productManagement.productName') }}</th>
                <th>{{ $t('admin.orderManagement.variant') }}</th>
                <th>{{ $t('admin.orderManagement.quantity') }}</th>
                <th>{{ $t('admin.orderManagement.price') }}</th>
                <th>{{ $t('admin.orderManagement.total') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in order.items" :key="`${item.productId}-${index}`">
                <td>{{ item.productName }}</td>
                <td>
                  <span v-if="item.variantSize" class="variant-badge">
                    {{ item.variantSize }}
                  </span>
                  <span v-else class="variant-default">-</span>
                </td>
                <td>{{ item.quantity }}</td>
                <td>{{ formatPrice(item.price) }}</td>
                <td>{{ formatPrice(item.price * item.quantity) }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colspan="4"><strong>{{ $t('admin.orderManagement.total') }}</strong></td>
                <td><strong>{{ formatPrice(order.totalAmount) }}</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div v-if="order.notes" class="detail-section">
          <h4>{{ $t('admin.orderManagement.notes') }}</h4>
          <p>{{ order.notes }}</p>
        </div>
      </div>

      <div class="modal-actions">
        <button class="btn btn-secondary" @click="emit('close')">
          {{ $t('common.cancel') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 8px;
  padding: 30px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #2d3748;
}

.order-details {
  margin-bottom: 20px;
}

.detail-section {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e2e8f0;
}

.detail-section:last-child {
  border-bottom: none;
}

.detail-section h4 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #2d3748;
}

.detail-section p {
  margin: 5px 0;
  color: #4a5568;
}

.detail-section code {
  background: #edf2f7;
  padding: 4px 8px;
  border-radius: 4px;
  font-family: monospace;
}

.status-select {
  width: 100%;
  padding: 8px;
  border: 1px solid #cbd5e0;
  border-radius: 4px;
  font-size: 1rem;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.items-table th,
.items-table td {
  padding: 8px;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.items-table th {
  background: #f7fafc;
  font-weight: 600;
  color: #2d3748;
}

.items-table tfoot td {
  font-weight: 600;
  border-top: 2px solid #cbd5e0;
}

.variant-badge {
  display: inline-block;
  padding: 2px 8px;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
}

.variant-default {
  color: #a0aec0;
  font-style: italic;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  background: #718096;
  color: white;
}

.btn:hover {
  background: #4a5568;
}
</style>
