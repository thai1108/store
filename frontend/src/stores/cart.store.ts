import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { CartItem } from '@/types/order';
import { Product, ProductVariant } from '@/types/product';
import cartService from '@/services/cart-service';

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

  // Watch for changes and save appropriately
  watch(items, () => {
    if (isLoadedFromStorage.value) {
      // If user is authenticated, only save to server
      if (currentUserId.value) {
        saveToServer().catch(console.error);
      } else {
        // If not authenticated, save to localStorage
        saveToLocalStorage();
      }
    }
  }, { deep: true });

  // Load from server for authenticated users
  const loadFromServer = async () => {
    try {
      return await cartService.getCart();
    } catch (error: any) {
      if (error.message === 'UNAUTHORIZED') {
        currentUserId.value = null;
      }
      return [];
    }
  };

  // Save to server for authenticated users
  const saveToServer = async () => {
    try {
      await cartService.saveCart(items.value);
    } catch (error: any) {
      if (error.message === 'UNAUTHORIZED') {
        currentUserId.value = null;
      }
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
    const serverItems = await loadFromServer();
    
    if (items.value.length > 0) {
      // Merge local cart with server cart
      mergeWithServerCart(serverItems);
      // Save merged cart to server
      await saveToServer();
    } else {
      // Just load from server
      items.value = serverItems;
    }
    
    // Clear localStorage after syncing to server
    localStorage.removeItem(CART_STORAGE_KEY);
  };

  const addToCart = (product: Product, variant?: ProductVariant, quantity: number = 1) => {
    // Create a unique key for the cart item (product + variant combination)
    const cartKey = variant ? `${product.id}-${variant.id}` : product.id;
    
    const existingItem = items.value.find((item: CartItem) => {
      const itemKey = item.variantId ? `${item.productId}-${item.variantId}` : item.productId;
      return itemKey === cartKey;
    });
    
    // Calculate price with variant adjustment
    let price = product.price;
    if (variant && variant.priceAdjustment) {
      price += variant.priceAdjustment;
    }
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      items.value.push({
        productId: product.id,
        productName: product.name,
        variantId: variant?.id,
        variantSize: variant?.size,
        price,
        quantity,
        imageUrl: product.imageUrl,
      });
    }
  };

  const removeFromCart = (productId: string, variantId?: string) => {
    const index = items.value.findIndex((item: CartItem) => {
      if (variantId) {
        return item.productId === productId && item.variantId === variantId;
      }
      return item.productId === productId && !item.variantId;
    });
    if (index > -1) {
      items.value.splice(index, 1);
    }
  };

  const updateQuantity = (productId: string, quantity: number, variantId?: string) => {
    const item = items.value.find((item: CartItem) => {
      if (variantId) {
        return item.productId === productId && item.variantId === variantId;
      }
      return item.productId === productId && !item.variantId;
    });
    if (item) {
      if (quantity <= 0) {
        removeFromCart(productId, variantId);
      } else {
        item.quantity = quantity;
      }
    }
  };

  const clearCart = () => {
    items.value = [];
    if (!currentUserId.value) {
      // Only clear localStorage if not authenticated
      localStorage.removeItem(CART_STORAGE_KEY);
    }
  };

  const totalAmount = computed(() => {
    return items.value.reduce((sum: number, item: CartItem) => sum + (item.price * item.quantity), 0);
  });

  const totalItems = computed(() => {
    return items.value.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);
  });

  // Initialize: load from localStorage only (server load happens in App.vue after auth check)
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
    loadFromServer,
    loadFromLocalStorage,
    setUserId,
  };
});