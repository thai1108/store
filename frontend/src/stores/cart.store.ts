import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { CartItem } from '@/types/order';
import { Product } from '@/types/product';

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([]);

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
  };

  const totalAmount = computed(() => {
    return items.value.reduce((sum: number, item: CartItem) => sum + (item.price * item.quantity), 0);
  });

  const totalItems = computed(() => {
    return items.value.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);
  });

  return {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalAmount,
    totalItems,
  };
});