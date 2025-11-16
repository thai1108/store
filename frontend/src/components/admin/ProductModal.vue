<script setup lang="ts">
import { ref, watch } from 'vue';
import { Product, CreateProductRequest } from '@/types/product';

interface Props {
  show: boolean;
  product?: Product | null;
}

interface Emits {
  (e: 'close'): void;
  (e: 'save', data: Partial<CreateProductRequest>): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const form = ref<Partial<CreateProductRequest>>({
  name: '',
  description: '',
  price: 0,
  category: 'snack',
  imageUrl: '',
  inStock: true,
});

watch(() => props.product, (product) => {
  if (product) {
    form.value = {
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      imageUrl: product.imageUrl,
      inStock: product.inStock,
    };
  } else {
    form.value = {
      name: '',
      description: '',
      price: 0,
      category: 'snack',
      imageUrl: '',
      inStock: true,
    };
  }
}, { immediate: true });

const handleSubmit = () => {
  if (!form.value.name || !form.value.price) {
    return;
  }
  emit('save', form.value);
};
</script>

<template>
  <div v-if="show" class="modal-overlay" @click="emit('close')">
    <div class="modal-content" @click.stop>
      <h3>{{ product ? $t('admin.productManagement.editProduct') : $t('admin.productManagement.addProduct') }}</h3>
      
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>{{ $t('admin.productManagement.productName') }}</label>
          <input v-model="form.name" type="text" required />
        </div>

        <div class="form-group">
          <label>{{ $t('admin.productManagement.category') }}</label>
          <select v-model="form.category" required>
            <option value="snack">{{ $t('admin.productManagement.snacks') }}</option>
            <option value="drink">{{ $t('admin.productManagement.drinks') }}</option>
            <option value="milk-tea">{{ $t('admin.productManagement.milkTea') }}</option>
          </select>
        </div>

        <div class="form-group">
          <label>{{ $t('admin.productManagement.price') }}</label>
          <input v-model.number="form.price" type="number" min="0" step="1000" required />
        </div>

        <div class="form-group">
          <label>{{ $t('products.inStock') }}</label>
          <select v-model="form.inStock">
            <option :value="true">{{ $t('products.inStock') }}</option>
            <option :value="false">{{ $t('products.outOfStock') }}</option>
          </select>
        </div>

        <div class="form-group">
          <label>{{ $t('admin.productManagement.imageUrl') }}</label>
          <input v-model="form.imageUrl" type="url" />
        </div>

        <div class="form-group">
          <label>{{ $t('admin.productManagement.description') }}</label>
          <textarea v-model="form.description" rows="3"></textarea>
        </div>

        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" @click="emit('close')">
            {{ $t('common.cancel') }}
          </button>
          <button type="submit" class="btn btn-primary">
            {{ $t('common.save') }}
          </button>
        </div>
      </form>
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
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #2d3748;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #2d3748;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #cbd5e0;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #4299e1;
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
}

.btn-primary {
  background: #4299e1;
  color: white;
}

.btn-primary:hover {
  background: #3182ce;
}

.btn-secondary {
  background: #718096;
  color: white;
}

.btn-secondary:hover {
  background: #4a5568;
}
</style>
