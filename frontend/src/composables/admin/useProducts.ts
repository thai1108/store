import { ref } from 'vue';
import { adminService } from '@/services/admin-service';
import { Product, CreateProductRequest } from '@/types/product';

export const useProducts = () => {
  const products = ref<Product[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchProducts = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await adminService.getAllProducts();
      if (response.success && response.data) {
        products.value = response.data;
      } else {
        error.value = response.message || 'Failed to fetch products';
      }
    } catch (err) {
      error.value = 'An error occurred while fetching products';
    } finally {
      loading.value = false;
    }
  };

  const createProduct = async (data: CreateProductRequest) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await adminService.createProduct(data);
      if (response.success) {
        await fetchProducts();
        return { success: true };
      } else {
        error.value = response.message || 'Failed to create product';
        return { success: false, message: error.value };
      }
    } catch (err) {
      error.value = 'An error occurred while creating product';
      return { success: false, message: error.value };
    } finally {
      loading.value = false;
    }
  };

  const updateProduct = async (id: string, data: Partial<CreateProductRequest>) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await adminService.updateProduct(id, data);
      if (response.success) {
        await fetchProducts();
        return { success: true };
      } else {
        error.value = response.message || 'Failed to update product';
        return { success: false, message: error.value };
      }
    } catch (err) {
      error.value = 'An error occurred while updating product';
      return { success: false, message: error.value };
    } finally {
      loading.value = false;
    }
  };

  const deleteProduct = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await adminService.deleteProduct(id);
      if (response.success) {
        await fetchProducts();
        return { success: true };
      } else {
        error.value = response.message || 'Failed to delete product';
        return { success: false, message: error.value };
      }
    } catch (err) {
      error.value = 'An error occurred while deleting product';
      return { success: false, message: error.value };
    } finally {
      loading.value = false;
    }
  };

  return {
    products,
    loading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  };
};
