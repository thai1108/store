import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { CartItem } from '@/types/order';
import { Product } from '@/types/product';

const CART_STORAGE_KEY = 'cart-items';

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([]);
  const isLoadedFromStorage = ref(false);
  const currentUserId = ref<string | null>(null);

  // Load cart from localStorage on initialization
  const loadFromLocalStorage = () => {
    if (isLoadedFromStorage.value) return;
    
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        items.value = JSON.parse(savedCart);
      }
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error);
    }
    isLoadedFromStorage.value = true;
  };

  // Save cart to localStorage whenever it changes
  const saveToLocalStorage = () => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items.value));
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error);
    }
  };

  // Set current user ID (called after login/register)
  const setUserId = (userId: string | null) => {
    currentUserId.value = userId;
  };

  // Watch for changes and save to localStorage
  watch(items, () => {
    if (isLoadedFromStorage.value) {
      saveToLocalStorage();
      
      // Also save to server if user is authenticated
      if (currentUserId.value) {
        saveToServer(currentUserId.value).catch(console.error);
      }
    }
  }, { deep: true });

  // Load from server for authenticated users
  const loadFromServer = async (userId: string) => {
    try {
      const response = await fetch(`/api/cart/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          return data.data.items || [];
        }
      }
    } catch (error) {
      console.error('Failed to load cart from server:', error);
    }
    return [];
  };

  // Save to server for authenticated users
  const saveToServer = async (userId: string) => {
    try {
      const response = await fetch(`/api/cart/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ items: items.value }),
      });
      
      if (!response.ok) {
        console.error('Failed to save cart to server');
      }
    } catch (error) {
      console.error('Failed to save cart to server:', error);
    }
  };

  // Merge local cart with server cart
  const mergeWithServerCart = (serverItems: CartItem[]) => {
    const merged = [...items.value];
    
    for (const serverItem of serverItems) {
      const existingIndex = merged.findIndex(
        (item) => item.productId === serverItem.productId
      );
      
      if (existingIndex >= 0) {
        // Keep the higher quantity
        merged[existingIndex].quantity = Math.max(
          merged[existingIndex].quantity,
          serverItem.quantity
        );
      } else {
        // Add new item from server
        merged.push(serverItem);
      }
    }
    
    items.value = merged;
  };

  // Sync cart with server when user logs in
  const syncWithServer = async (userId: string) => {
    setUserId(userId);
    const serverItems = await loadFromServer(userId);
    
    if (items.value.length > 0) {
      // Merge local cart with server cart
      mergeWithServerCart(serverItems);
      // Save merged cart to server
      await saveToServer(userId);
    } else {
      // Just load from server
      items.value = serverItems;
    }
    
    // Clear localStorage after syncing to server
    localStorage.removeItem(CART_STORAGE_KEY);
  };

  const addToCart = (product: Product, quantity: number = 1) => {
    const existingItem = items.value.find((item: CartItem) => item.productId === product.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      items.value.push({
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity,
        imageUrl: product.imageUrl,
      });
    }
  };

  const removeFromCart = (productId: string) => {
    const index = items.value.findIndex((item: CartItem) => item.productId === productId);
    if (index > -1) {
      items.value.splice(index, 1);
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    const item = items.value.find((item: CartItem) => item.productId === productId);
    if (item) {
      if (quantity <= 0) {
        removeFromCart(productId);
      } else {
        item.quantity = quantity;
      }
    }
  };

  const clearCart = () => {
    items.value = [];
    localStorage.removeItem(CART_STORAGE_KEY);
    currentUserId.value = null;
  };

  const totalAmount = computed(() => {
    return items.value.reduce((sum: number, item: CartItem) => sum + (item.price * item.quantity), 0);
  });

  const totalItems = computed(() => {
    return items.value.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);
  });

  // Initialize: load from localStorage
  loadFromLocalStorage();

  return {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalAmount,
    totalItems,
    syncWithServer,
    saveToServer,
    loadFromLocalStorage,
    setUserId,
  };
});