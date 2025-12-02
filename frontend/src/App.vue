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
  <div id="app" class="app-shell">
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
  min-height: 100vh;
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu,
    Cantarell, "Open Sans", sans-serif;
  background: radial-gradient(circle at 10% 20%, rgba(24, 144, 255, 0.08), transparent 25%),
    radial-gradient(circle at 80% 0%, rgba(82, 196, 26, 0.08), transparent 20%),
    #f8fafc;
  position: relative;
  overflow-x: hidden;
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
  background: rgba(24, 144, 255, 0.35);
}

.orb-secondary {
  width: 260px;
  height: 260px;
  right: -120px;
  top: 300px;
  background: rgba(250, 140, 22, 0.25);
}

.orb-tertiary {
  width: 200px;
  height: 200px;
  bottom: 80px;
  left: 20%;
  background: rgba(82, 196, 26, 0.28);
}

.app-main {
  position: relative;
  z-index: 1;
  padding-top: 72px; /* Space for fixed navbar */
}
</style>
