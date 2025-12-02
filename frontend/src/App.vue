<script setup lang="ts">
import { RouterView } from "vue-router";
import { onMounted } from "vue";
import { useAuthStore } from "@/stores/auth.store";
import { useCartStore } from "@/stores/cart.store";
import NavBar from "@/components/NavBar.vue";
import Footer from "@/components/Footer.vue";

const authStore = useAuthStore();
const cartStore = useCartStore();

onMounted(async () => {
  authStore.initAuth();
  
  // If user is authenticated, load cart from server instead of localStorage
  if (authStore.isAuthenticated && authStore.user) {
    cartStore.setUserId(authStore.user.id);
    const serverItems = await cartStore.loadFromServer();
    // Replace items with server data
    cartStore.items.splice(0, cartStore.items.length, ...serverItems);
  }
  // Otherwise, cart is already loaded from localStorage in store initialization
});
</script>

<template>
  <div id="app" class="app-shell page">
    <div class="background-ornaments">
      <div class="orb orb-primary"></div>
      <div class="orb orb-secondary"></div>
      <div class="orb orb-tertiary"></div>
    </div>

    <NavBar />

    <main class="app-main">
      <RouterView v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </RouterView>
    </main>

    <Footer />
  </div>
</template>

<style>
#app {
  position: relative;
  overflow-x: hidden;
  background: var(--page-bg);
}

.app-shell {
  position: relative;
}

.background-ornaments {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.orb {
  position: absolute;
  filter: blur(60px);
  opacity: 0.5;
  border-radius: 50%;
  transform: translateZ(0);
}

.orb-primary {
  width: 320px;
  height: 320px;
  top: 140px;
  left: -80px;
  background: color-mix(in srgb, var(--brand-primary) 35%, transparent);
}

.orb-secondary {
  width: 260px;
  height: 260px;
  right: -120px;
  top: 300px;
  background: color-mix(in srgb, var(--brand-warm) 25%, transparent);
}

.orb-tertiary {
  width: 200px;
  height: 200px;
  bottom: 80px;
  left: 20%;
  background: color-mix(in srgb, var(--brand-accent) 28%, transparent);
}

.app-main {
  position: relative;
  z-index: 1;
  padding-top: 72px; /* Space for fixed navbar */
}
</style>
