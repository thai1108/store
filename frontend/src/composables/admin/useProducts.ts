import { ref } from 'vue';
import { adminService } from '@/services/admin-service';
import { Product, CreateProductRequest } from '@/types/product';
import { useInfiniteScroll } from '@/composables/useInfiniteScroll';

export const useProducts = () => {
  const loading = ref(false);
  const error = ref<string | null>(null);

  const {
    items: products,
    loading: loadingMore,
    hasMore,
    loadMore,
    refresh,
  } = useInfiniteScroll<Product>({
    fetchFn: async (cursor) => {
      const response = await adminService.getAllProducts(cursor);
      return {
        data: response.data,
        pagination: response.pagination,
      };
    },
    limit: 20,
  });

  const fetchProducts = async () => {
    await refresh();
  };

  const createProduct = async (data: CreateProductRequest) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await adminService.createProduct(data);
      if (response.success) {
        await refresh();
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
        await refresh();
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
        await refresh();
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
    loadingMore,
    hasMore,
    error,
    fetchProducts,
    loadMore,
    createProduct,
    updateProduct,
    deleteProduct,
  };
};
