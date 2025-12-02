<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useCartStore } from "@/stores/cart.store";
import { useAuthStore } from "@/stores/auth.store";
import { orderService } from "@/services/order-service";

const { t } = useI18n();
const router = useRouter();
const cartStore = useCartStore();
const authStore = useAuthStore();

const form = ref({
  name: "",
  phone: "",
  email: "",
  address: "",
  notes: "",
});

const loading = ref(false);
const error = ref("");
const success = ref(false);

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

const handleSubmit = async () => {
  if (!form.value.name || !form.value.phone) {
    error.value = t('checkout.validation.required');
    return;
  }

  if (cartStore.items.length === 0) {
    error.value = t('checkout.validation.emptyCart');
    return;
  }

  loading.value = true;
  error.value = "";

  try {
    const orderData = {
      items: cartStore.items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId, // ✅ Gửi variantId
        quantity: item.quantity,
      })),
      customerInfo: {
        name: form.value.name,
        phone: form.value.phone,
        email: form.value.email || undefined,
        address: form.value.address || undefined,
      },
      notes: form.value.notes || undefined,
    };

    const result = await orderService.create(orderData);

    if (result.success) {
      success.value = true;
      cartStore.clearCart();

      setTimeout(() => {
        if (authStore.isAuthenticated) {
          router.push("/orders");
        } else {
          router.push("/");
        }
      }, 2000);
    } else {
      error.value = result.message || t('checkout.failed');
    }
  } catch (err) {
    error.value = t('errors.network');
  } finally {
    loading.value = false;
  }
};

// Pre-fill form with user data if authenticated
if (authStore.isAuthenticated && authStore.user) {
  form.value.name = authStore.user.name;
  form.value.email = authStore.user.email;
  form.value.phone = authStore.user.phone || "";
}
</script>

<template>
  <div class="checkout-view page">
    <div class="page-container">
      <h1>{{ $t('checkout.title') }}</h1>

      <div v-if="success" class="alert alert-success">
        {{ $t('checkout.success') }}
      </div>

      <div v-else class="checkout-content">
        <div class="checkout-form">
          <div class="card">
            <h2>{{ $t('checkout.customerInfo') }}</h2>

            <div v-if="error" class="alert alert-error">
              {{ error }}
            </div>

            <form @submit.prevent="handleSubmit">
              <div class="form-group">
                <label for="name"
                  >{{ $t('checkout.name') }} <span class="required">*</span>:</label
                >
                <input
                  id="name"
                  v-model="form.name"
                  type="text"
                  class="form-control"
                  :placeholder="$t('checkout.namePlaceholder')"
                  required
                />
              </div>

              <div class="form-group">
                <label for="phone"
                  >{{ $t('checkout.phone') }} <span class="required">*</span>:</label
                >
                <input
                  id="phone"
                  v-model="form.phone"
                  type="tel"
                  class="form-control"
                  :placeholder="$t('checkout.phonePlaceholder')"
                  required
                />
              </div>

              <div class="form-group">
                <label for="email">{{ $t('checkout.email') }}:</label>
                <input
                  id="email"
                  v-model="form.email"
                  type="email"
                  class="form-control"
                  :placeholder="$t('checkout.emailPlaceholder')"
                />
              </div>

              <div class="form-group">
                <label for="address">{{ $t('checkout.address') }}:</label>
                <textarea
                  id="address"
                  v-model="form.address"
                  class="form-control"
                  rows="3"
                  :placeholder="$t('checkout.addressPlaceholder')"
                ></textarea>
              </div>

              <div class="form-group">
                <label for="notes">{{ $t('checkout.notes') }}:</label>
                <textarea
                  id="notes"
                  v-model="form.notes"
                  class="form-control"
                  rows="3"
                  :placeholder="$t('checkout.notesPlaceholder')"
                ></textarea>
              </div>

              <button
                type="submit"
                class="btn btn-success"
                :disabled="loading || cartStore.items.length === 0"
              >
                <span v-if="loading" class="loading-spinner"></span>
                <span v-else>{{ $t('checkout.placeOrder') }} ({{ formattedTotal }})</span>
              </button>
            </form>
          </div>
        </div>

        <div class="order-summary">
          <div class="card">
            <h2>{{ $t('checkout.orderSummary') }}</h2>

            <div class="order-items">
              <div
                v-for="(item, index) in cartStore.items"
                :key="`${item.productId}-${item.variantId || 'default'}-${index}`"
                class="order-item"
              >
                <div class="item-info">
                  <h4>
                    {{ item.productName }}
                    <span v-if="item.variantSize" class="variant-badge">
                      {{ item.variantSize }}
                    </span>
                  </h4>
                  <p>{{ formatPrice(item.price) }} × {{ item.quantity }}</p>
                </div>
                <div class="item-total">
                  {{ formatPrice(item.price * item.quantity) }}
                </div>
              </div>
            </div>

            <div class="order-total">
              <div class="total-row">
                <span>{{ $t('checkout.subtotal') }}:</span>
                <span>{{ formattedTotal }}</span>
              </div>
              <div class="total-row final-total">
                <span>{{ $t('checkout.total') }}:</span>
                <span>{{ formattedTotal }}</span>
              </div>
            </div>

            <div class="payment-note">
              <p><strong>{{ $t('checkout.payment') }}:</strong> {{ $t('checkout.paymentMethod') }}</p>
              <p class="text-muted">
                {{ $t('checkout.paymentNote') }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.checkout-view {
  padding: var(--space-lg) 0 var(--space-xl);
}

h1 {
  text-align: center;
  font-size: 2.4rem;
  color: var(--text-strong);
  margin-bottom: var(--space-md);
}

.checkout-content {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: var(--space-md);
}

.card {
  background: var(--surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  padding: var(--space-md);
  border: 1px solid var(--border-subtle);
}

.card h2 {
  font-size: 1.5rem;
  color: var(--text-strong);
  margin-bottom: var(--space-sm);
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-subtle);
}

.required {
  color: #e53e3e;
}

.order-items {
  margin-bottom: var(--space-sm);
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid var(--border-subtle);
  gap: 12px;
}

.order-item:last-child {
  border-bottom: none;
}

.item-info h4 {
  font-size: 1rem;
  color: var(--text-strong);
  margin-bottom: 4px;
}

.variant-badge {
  display: inline-block;
  margin-left: 8px;
  padding: 2px 8px;
  background: rgba(22, 119, 255, 0.1);
  color: var(--brand-primary);
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 500;
}

.item-info p {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.item-total {
  font-weight: 600;
  color: var(--text-strong);
}

.form-group {
  margin-bottom: var(--space-sm);
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: var(--text-strong);
}

.form-control,
textarea.form-control {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  font-size: 1rem;
  background: var(--surface);
  color: var(--text-strong);
}

.alert {
  padding: 14px 16px;
  border-radius: var(--radius-sm);
  margin-bottom: 12px;
}

.alert-success {
  background: rgba(82, 196, 26, 0.12);
  color: var(--brand-accent);
  border: 1px solid color-mix(in srgb, var(--brand-accent) 50%, transparent);
}

.alert-error {
  background: rgba(255, 77, 79, 0.12);
  color: #d4380d;
  border: 1px solid rgba(255, 77, 79, 0.3);
}

.button-group {
  display: flex;
  gap: 12px;
  margin-top: var(--space-sm);
}

.btn-primary {
  background: var(--brand-primary);
  color: var(--surface);
  padding: 12px 16px;
  border-radius: var(--radius-sm);
  border: none;
  cursor: pointer;
  font-weight: 600;
}

.btn-secondary {
  background: transparent;
  color: var(--brand-primary);
  padding: 12px 16px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--brand-primary);
  cursor: pointer;
  font-weight: 600;
}

.summary-card h3 {
  font-size: 1.2rem;
  margin-bottom: 12px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.summary-row.total {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--brand-accent);
}

@media (max-width: 992px) {
  .checkout-content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  h1 {
    font-size: 2rem;
  }

  .card {
    padding: var(--space-sm);
  }
}
</style>
