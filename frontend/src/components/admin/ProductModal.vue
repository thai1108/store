<script setup lang="ts">
import { ref, watch } from 'vue';
import { Product, CreateProductRequest } from '@/types/product';
import { adminService } from '@/services/admin-service';

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
  variants: [],
  images: [],
});

const selectedFiles = ref<File[]>([]);
const previewUrls = ref<string[]>([]);
const isUploading = ref(false);
const uploadError = ref('');

// Variant form
const newVariant = ref({
  size: '',
  stock: 0,
  priceAdjustment: 0,
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
      variants: product.variants ? [...product.variants] : [],
      images: product.images ? [...product.images] : [],
    };
  } else {
    form.value = {
      name: '',
      description: '',
      price: 0,
      category: 'snack',
      imageUrl: '',
      inStock: true,
      variants: [],
      images: [],
    };
  }
  selectedFiles.value = [];
  previewUrls.value = [];
  uploadError.value = '';
}, { immediate: true });

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    const files = Array.from(target.files);
    selectedFiles.value = [...selectedFiles.value, ...files];
    
    // Create preview URLs
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          previewUrls.value.push(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    });
  }
};

const removeImage = (index: number) => {
  selectedFiles.value.splice(index, 1);
  previewUrls.value.splice(index, 1);
};

const removeExistingImage = (index: number) => {
  if (form.value.images) {
    form.value.images.splice(index, 1);
  }
};

const addVariant = () => {
  if (!newVariant.value.size) return;
  
  if (!form.value.variants) {
    form.value.variants = [];
  }
  
  form.value.variants.push({
    size: newVariant.value.size,
    stock: newVariant.value.stock,
    priceAdjustment: newVariant.value.priceAdjustment || 0,
  });
  
  // Reset form
  newVariant.value = {
    size: '',
    stock: 0,
    priceAdjustment: 0,
  };
};

const removeVariant = (index: number) => {
  if (form.value.variants) {
    form.value.variants.splice(index, 1);
  }
};

const handleSubmit = async () => {
  if (!form.value.name || !form.value.price) {
    return;
  }
  
  uploadError.value = '';
  
  // Upload images if any
  if (selectedFiles.value.length > 0) {
    isUploading.value = true;
    try {
      const result = await adminService.uploadImages(selectedFiles.value);
      if (result.success && result.urls) {
        // Add uploaded URLs to images
        if (!form.value.images) {
          form.value.images = [];
        }
        
        const startOrder = form.value.images.length;
        result.urls.forEach((url, index) => {
          form.value.images!.push({
            imageUrl: url,
            displayOrder: startOrder + index,
          });
        });
        
        // Set first image as main imageUrl if not set
        if (!form.value.imageUrl && result.urls.length > 0) {
          form.value.imageUrl = result.urls[0];
        }
      } else {
        uploadError.value = result.message || 'Failed to upload images';
        isUploading.value = false;
        return;
      }
    } catch (error) {
      uploadError.value = 'Failed to upload images';
      isUploading.value = false;
      return;
    }
    isUploading.value = false;
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
          <label>{{ $t('admin.productManagement.price') }} (VND)</label>
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
          <label>{{ $t('admin.productManagement.description') }}</label>
          <textarea v-model="form.description" rows="3"></textarea>
        </div>

        <!-- Product Images -->
        <div class="form-section">
          <h4>Product Images</h4>
          
          <!-- Existing Images -->
          <div v-if="form.images && form.images.length > 0" class="image-list">
            <div v-for="(img, index) in form.images" :key="`existing-${index}`" class="image-item">
              <img :src="img.imageUrl" :alt="`Image ${index + 1}`" />
              <button type="button" class="btn-remove" @click="removeExistingImage(index)">×</button>
            </div>
          </div>
          
          <!-- New Images Preview -->
          <div v-if="previewUrls.length > 0" class="image-list">
            <div v-for="(url, index) in previewUrls" :key="`preview-${index}`" class="image-item">
              <img :src="url" :alt="`Preview ${index + 1}`" />
              <button type="button" class="btn-remove" @click="removeImage(index)">×</button>
            </div>
          </div>
          
          <!-- Upload Input -->
          <div class="form-group">
            <label class="file-upload-label">
              <input type="file" multiple accept="image/*" @change="handleFileSelect" style="display: none;" />
              <span class="btn btn-secondary">Choose Images</span>
            </label>
          </div>
          
          <p v-if="uploadError" class="error-message">{{ uploadError }}</p>
        </div>

        <!-- Product Variants -->
        <div class="form-section">
          <h4>Product Variants (Sizes)</h4>
          
          <!-- Existing Variants -->
          <div v-if="form.variants && form.variants.length > 0" class="variants-list">
            <div v-for="(variant, index) in form.variants" :key="`variant-${index}`" class="variant-item">
              <span><strong>Size:</strong> {{ variant.size }}</span>
              <span><strong>Stock:</strong> {{ variant.stock }}</span>
              <span v-if="variant.priceAdjustment"><strong>Price +:</strong> {{ variant.priceAdjustment }} VND</span>
              <button type="button" class="btn-remove-small" @click="removeVariant(index)">Remove</button>
            </div>
          </div>
          
          <!-- Add New Variant -->
          <div class="variant-form">
            <div class="variant-inputs">
              <input v-model="newVariant.size" type="text" placeholder="Size (e.g., M, L, XL)" />
              <input v-model.number="newVariant.stock" type="number" placeholder="Stock" min="0" />
              <input v-model.number="newVariant.priceAdjustment" type="number" placeholder="Price Adjustment" step="1000" />
              <button type="button" class="btn btn-small" @click="addVariant">Add Variant</button>
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" @click="emit('close')" :disabled="isUploading">
            {{ $t('common.cancel') }}
          </button>
          <button type="submit" class="btn btn-primary" :disabled="isUploading">
            {{ isUploading ? 'Uploading...' : $t('common.save') }}
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

.modal-content h4 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #4a5568;
  font-size: 1.1rem;
}

.form-section {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
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

.image-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 15px;
  margin-bottom: 15px;
}

.image-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #e2e8f0;
}

.image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.btn-remove {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.9);
  color: white;
  border: none;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.btn-remove:hover {
  background: rgb(220, 38, 38);
}

.file-upload-label {
  cursor: pointer;
}

.variants-list {
  margin-bottom: 15px;
}

.variant-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 12px;
  background: #f7fafc;
  border-radius: 6px;
  margin-bottom: 10px;
}

.variant-item span {
  flex: 1;
  font-size: 0.95rem;
}

.btn-remove-small {
  padding: 6px 12px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-remove-small:hover {
  background: #dc2626;
}

.variant-form {
  margin-top: 15px;
}

.variant-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr auto;
  gap: 10px;
  align-items: center;
}

.variant-inputs input {
  padding: 8px;
  border: 1px solid #cbd5e0;
  border-radius: 4px;
  font-size: 0.95rem;
}

.btn-small {
  padding: 8px 16px;
  white-space: nowrap;
}

.error-message {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 8px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #4299e1;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #3182ce;
}

.btn-secondary {
  background: #718096;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #4a5568;
}
</style>
