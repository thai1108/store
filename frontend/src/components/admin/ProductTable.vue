<script setup lang="ts">
import { Product } from '@/types/product';

interface Props {
  products: Product[];
  loading: boolean;
}

interface Emits {
  (e: 'edit', product: Product): void;
  (e: 'delete', product: Product): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
};

const getTotalPrice = (basePrice: number, priceAdjustment?: number) => {
  return basePrice + (priceAdjustment || 0);
};
</script>

<template>
  <div class="table-container">
    <div v-if="loading" class="loading">{{ $t('common.loading') }}</div>
    
    <table v-else class="admin-table">
      <thead>
        <tr>
          <th>{{ $t('admin.productManagement.productName') }}</th>
          <th>{{ $t('admin.productManagement.category') }}</th>
          <th>{{ $t('admin.productManagement.price') }}</th>
          <th>{{ $t('admin.productManagement.variants') }}</th>
          <th>{{ $t('products.inStock') }}</th>
          <th>{{ $t('admin.productManagement.actions') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="product in products" :key="product.id">
          <td>
            <div class="product-cell">
              <img :src="product.imageUrl" :alt="product.name" class="product-thumb" />
              <span>{{ product.name }}</span>
            </div>
          </td>
          <td>{{ $t(`admin.productManagement.${product.category}`) }}</td>
          <td>{{ formatPrice(product.price) }}</td>
          <td>
            <div v-if="product.variants && product.variants.length > 0" class="variants-cell">
              <div v-for="variant in product.variants" :key="variant.id" class="variant-item">
                <span class="variant-size">{{ variant.size }}</span>
                <span class="variant-stock" :class="{ 'low-stock': variant.stock < 10, 'out-of-stock': variant.stock === 0 }">
                  Stock: {{ variant.stock }}
                </span>
                <span class="variant-price">
                  {{ formatPrice(getTotalPrice(product.price, variant.priceAdjustment)) }}
                  <span v-if="variant.priceAdjustment" class="price-diff">
                    (+{{ formatPrice(variant.priceAdjustment) }})
                  </span>
                </span>
              </div>
            </div>
            <span v-else class="no-variants">-</span>
          </td>
          <td>
            <span :class="product.inStock ? 'status-completed' : 'status-cancelled'" class="status-badge">
              {{ product.inStock ? $t('products.inStock') : $t('products.outOfStock') }}
            </span>
          </td>
          <td>
            <div class="action-buttons">
              <button class="btn btn-sm btn-secondary" @click="emit('edit', product)">
                {{ $t('common.edit') }}
              </button>
              <button class="btn btn-sm btn-danger" @click="emit('delete', product)">
                {{ $t('common.delete') }}
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.loading {
  text-align: center;
  padding: 40px;
  color: #718096;
}

.table-container {
  overflow-x: auto;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
}

.admin-table th {
  background: #edf2f7;
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #2d3748;
  border-bottom: 2px solid #cbd5e0;
}

.admin-table td {
  padding: 12px;
  border-bottom: 1px solid #e2e8f0;
  color: #4a5568;
}

.admin-table tbody tr:hover {
  background: #f7fafc;
}

.product-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.product-thumb {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
}

.variants-cell {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 250px;
}

.variant-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  background: #f7fafc;
  border-radius: 6px;
  font-size: 0.875rem;
  flex-wrap: wrap;
}

.variant-size {
  font-weight: 600;
  color: #2d3748;
  padding: 2px 8px;
  background: #e3f2fd;
  border-radius: 4px;
}

.variant-stock {
  color: #38a169;
  font-weight: 500;
}

.variant-stock.low-stock {
  color: #ed8936;
}

.variant-stock.out-of-stock {
  color: #e53e3e;
  font-weight: 600;
}

.variant-price {
  color: #4299e1;
  font-size: 0.875rem;
  font-weight: 600;
}

.price-diff {
  color: #38a169;
  font-size: 0.75rem;
  margin-left: 4px;
}

.no-variants {
  color: #a0aec0;
  font-style: italic;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
}

.status-completed {
  background: #e8f5e9;
  color: #4caf50;
}

.status-cancelled {
  background: #ffebee;
  color: #f44336;
}

.btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 0.875rem;
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

.btn-danger {
  background: #f56565;
  color: white;
}

.btn-danger:hover {
  background: #e53e3e;
}

@media (max-width: 768px) {
  .admin-table {
    font-size: 0.875rem;
  }

  .admin-table th,
  .admin-table td {
    padding: 8px;
  }

  .action-buttons {
    flex-direction: column;
  }
}
</style>
