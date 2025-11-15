<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth.store";

const router = useRouter();
const authStore = useAuthStore();

const form = ref({
  email: "",
  password: "",
});

const loading = ref(false);
const error = ref("");

const handleSubmit = async () => {
  if (!form.value.email || !form.value.password) {
    error.value = "Please fill in all fields";
    return;
  }

  loading.value = true;
  error.value = "";

  try {
    const result = await authStore.login(form.value.email, form.value.password);

    if (result.success) {
      router.push("/");
    } else {
      error.value = result.message || "Login failed";
    }
  } catch (err) {
    error.value = "An error occurred. Please try again.";
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="login-view">
    <div class="container">
      <div class="login-card">
        <h1>Login</h1>
        <p class="subtitle">Welcome back! Please sign in to your account.</p>

        <div v-if="error" class="alert alert-error">
          {{ error }}
        </div>

        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="email">Email:</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              class="form-control"
              placeholder="Enter your email"
              required
            />
          </div>

          <div class="form-group">
            <label for="password">Password:</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              class="form-control"
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" class="btn btn-primary" :disabled="loading">
            <span v-if="loading" class="loading-spinner"></span>
            <span v-else>Login</span>
          </button>
        </form>

        <div class="login-footer">
          <p>
            Don't have an account?
            <router-link to="/register">Register here</router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.login-card {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.login-card h1 {
  text-align: center;
  color: #2d3748;
  margin-bottom: 8px;
  font-size: 2rem;
}

.subtitle {
  text-align: center;
  color: #718096;
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 20px;
}

.login-footer {
  text-align: center;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
}

.login-footer a {
  color: #3182ce;
  text-decoration: none;
  font-weight: 500;
}

.login-footer a:hover {
  text-decoration: underline;
}
</style>
