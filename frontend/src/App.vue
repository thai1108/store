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
  <div id="app">
    <NavBar />
    <main>
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
}

main {
  padding-top: 64px; /* Space for fixed navbar */
}
</style>
