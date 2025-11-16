import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth.store";
import HomeView from "@/views/HomeView.vue";
import ProductListView from "@/views/ProductListView.vue";
import ProductDetailView from "@/views/ProductDetailView.vue";
import CartView from "@/views/CartView.vue";
import CheckoutView from "@/views/CheckoutView.vue";
import LoginView from "@/views/LoginView.vue";
import RegisterView from "@/views/RegisterView.vue";
import OrderHistoryView from "@/views/OrderHistoryView.vue";
import ProfileView from "@/views/ProfileView.vue";
import AdminLayout from "@/views/admin/AdminLayout.vue";
import AdminProductsView from "@/views/admin/AdminProductsView.vue";
import AdminOrdersView from "@/views/admin/AdminOrdersView.vue";
import AdminUsersView from "@/views/admin/AdminUsersView.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/products",
      name: "products",
      component: ProductListView,
    },
    {
      path: "/products/:id",
      name: "product-detail",
      component: ProductDetailView,
      props: true,
    },
    {
      path: "/cart",
      name: "cart",
      component: CartView,
    },
    {
      path: "/checkout",
      name: "checkout",
      component: CheckoutView,
    },
    {
      path: "/login",
      name: "login",
      component: LoginView,
    },
    {
      path: "/register",
      name: "register",
      component: RegisterView,
    },
    {
      path: "/orders",
      name: "order-history",
      component: OrderHistoryView,
      meta: { requiresAuth: true },
    },
    {
      path: "/profile",
      name: "profile",
      component: ProfileView,
      meta: { requiresAuth: true },
    },
    {
      path: "/admin",
      component: AdminLayout,
      meta: { requiresAuth: true, requiresAdmin: true },
      redirect: "/admin/products",
      children: [
        {
          path: "products",
          name: "admin-products",
          component: AdminProductsView,
        },
        {
          path: "orders",
          name: "admin-orders",
          component: AdminOrdersView,
        },
        {
          path: "users",
          name: "admin-users",
          component: AdminUsersView,
        },
      ],
    },
  ],
});

// Navigation guards
router.beforeEach((to) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: "login" };
  }

  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    return { name: "home" };
  }
});

export default router;
