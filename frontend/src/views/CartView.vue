<script setup lang="ts">
import { useCartStore } from "@/stores/cart.store";
import { computed } from "vue";

const cartStore = useCartStore();

const formattedTotal = computed(() => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(cartStore.totalAmount);
});

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};
</script>

<template>
  <div class="cart-view">
    <div class="container">
      <h1>Shopping Cart</h1>

      <div v-if="cartStore.items.length === 0" class="empty-cart">
        <div class="empty-cart-content">
          <h2>Your cart is empty</h2>
          <p>Add some delicious items to get started!</p>
          <router-link to="/products" class="shop-button">
            Browse Products
          </router-link>
        </div>
      </div>

      <div v-else class="cart-content">
        <div class="cart-items">
          <div
            v-for="item in cartStore.items"
            :key="item.productId"
            class="cart-item"
          >
            <div class="item-image">
              <img
                v-if="item.imageUrl"
                :src="item.imageUrl"
                :alt="item.productName"
                @error="
                  $event.target.src =
                    'https://via.placeholder.com/80x80?text=No+Image'
                "
              />
              <div v-else class="no-image">📷</div>
            </div>

            <div class="item-details">
              <h3>{{ item.productName }}</h3>
              <p class="item-price">{{ formatPrice(item.price) }}</p>
            </div>

            <div class="quantity-controls">
              <button
                @click="
                  cartStore.updateQuantity(item.productId, item.quantity - 1)
                "
                class="qty-btn"
              >
                -
              </button>
              <span class="quantity">{{ item.quantity }}</span>
              <button
                @click="
                  cartStore.updateQuantity(item.productId, item.quantity + 1)
                "
                class="qty-btn"
              >
                +
              </button>
            </div>

            <div class="item-total">
              {{ formatPrice(item.price * item.quantity) }}
            </div>

            <button
              @click="cartStore.removeFromCart(item.productId)"
              class="remove-btn"
            >
              ✕
            </button>
          </div>
        </div>

        <div class="cart-summary">
          <div class="summary-card">
            <h3>Order Summary</h3>

            <div class="summary-row">
              <span>Subtotal ({{ cartStore.totalItems }} items):</span>
              <span>{{ formattedTotal }}</span>
            </div>

            <div class="summary-row total">
              <span>Total:</span>
              <span>{{ formattedTotal }}</span>
            </div>

            <div class="cart-actions">
              <button @click="cartStore.clearCart" class="clear-btn">
                Clear Cart
              </button>

              <router-link to="/checkout" class="checkout-btn">
                Proceed to Checkout
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cart-view {
  padding: 40px 20px;
  min-height: 100vh;
  background-color: #f7fafc;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  text-align: center;
  font-size: 2.5rem;
  color: #2d3748;
  margin-bottom: 40px;
}

.empty-cart {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.empty-cart-content {
  text-align: center;
  padding: 60px 40px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.empty-cart-content h2 {
  font-size: 1.8rem;
  color: #4a5568;
  margin-bottom: 16px;
}

.empty-cart-content p {
  color: #718096;
  margin-bottom: 30px;
}

.shop-button {
  background-color: #3182ce;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.2s;
}

.shop-button:hover {
  background-color: #2c5aa0;
}

.cart-content {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 40px;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cart-item {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: grid;
  grid-template-columns: 80px 1fr auto auto auto;
  gap: 20px;
  align-items: center;
}

.item-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #edf2f7;
  color: #a0aec0;
  font-size: 1.5rem;
}

.item-details h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 4px;
}

.item-price {
  color: #48bb78;
  font-weight: 500;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.qty-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.qty-btn:hover {
  background-color: #f7fafc;
}

.quantity {
  font-weight: 600;
  min-width: 30px;
  text-align: center;
}

.item-total {
  font-weight: 600;
  font-size: 1.1rem;
  color: #2d3748;
}

.remove-btn {
  width: 32px;
  height: 32px;
  border: none;
  background-color: #e53e3e;
  color: white;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-btn:hover {
  background-color: #c53030;
}

.cart-summary {
  position: sticky;
  top: 100px;
}

.summary-card {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.summary-card h3 {
  font-size: 1.3rem;
  color: #2d3748;
  margin-bottom: 20px;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 10px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  color: #4a5568;
}

.summary-row.total {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2d3748;
  border-top: 1px solid #e2e8f0;
  padding-top: 12px;
  margin-top: 20px;
}

.cart-actions {
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.clear-btn {
  background-color: #e2e8f0;
  color: #4a5568;
  border: none;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
}

.clear-btn:hover {
  background-color: #cbd5e0;
}

.checkout-btn {
  background-color: #48bb78;
  color: white;
  padding: 15px;
  border-radius: 8px;
  text-decoration: none;
  text-align: center;
  font-weight: 600;
  font-size: 1.1rem;
}

.checkout-btn:hover {
  background-color: #38a169;
}

@media (max-width: 768px) {
  .cart-content {
    grid-template-columns: 1fr;
  }

  .cart-item {
    grid-template-columns: 60px 1fr;
    gap: 15px;
    grid-template-areas:
      "image details"
      "qty total"
      "remove remove";
  }

  .item-image {
    grid-area: image;
    width: 60px;
    height: 60px;
  }

  .item-details {
    grid-area: details;
  }

  .quantity-controls {
    grid-area: qty;
  }

  .item-total {
    grid-area: total;
    text-align: right;
  }

  .remove-btn {
    grid-area: remove;
    justify-self: center;
  }
}
</style>
