import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { Product, ProductFilter } from '@/types/product';
import { productService } from '@/services/product-service';

export const useProductStore = defineStore('product', () => {
  const products = ref<Product[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const filteredProducts = computed(() => {
    return products.value;
  });

  const fetchProducts = async (filter?: ProductFilter) => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await productService.getAll(filter);
      if (response.success) {
        products.value = response.data || [];
      } else {
        error.value = response.message || 'Failed to fetch products';
      }
    } catch (err) {
      error.value = 'Network error occurred';
    } finally {
      loading.value = false;
    }
  };

  const getProductById = async (id: string): Promise<Product | null> => {
    try {
      const response = await productService.getById(id);
      if (response.success) {
        return response.data || null;
      }
      return null;
    } catch (err) {
      return null;
    }
  };

  const addProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> => {
    try {
      const response = await productService.create(product);
      if (response.success && response.data) {
        products.value.unshift(response.data);
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  return {
    products,
    loading,
    error,
    filteredProducts,
    fetchProducts,
    getProductById,
    addProduct,
  };
});