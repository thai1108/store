<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth.store";

const router = useRouter();
const authStore = useAuthStore();

const form = ref({
  name: "",
  email: "",
  password: "",
  phone: "",
});

const loading = ref(false);
const error = ref("");

const handleSubmit = async () => {
  if (!form.value.name || !form.value.email || !form.value.password) {
    error.value = "Please fill in all required fields";
    return;
  }

  if (form.value.password.length < 6) {
    error.value = "Password must be at least 6 characters long";
    return;
  }

  loading.value = true;
  error.value = "";

  try {
    const result = await authStore.register(form.value);

    if (result.success) {
      router.push("/");
    } else {
      error.value = result.message || "Registration failed";
    }
  } catch (err) {
    error.value = "An error occurred. Please try again.";
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="register-view">
    <div class="container">
      <div class="register-card">
        <h1>Register</h1>
        <p class="subtitle">Create your account to start ordering!</p>

        <div v-if="error" class="alert alert-error">
          {{ error }}
        </div>

        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="name">Full Name <span class="required">*</span>:</label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              class="form-control"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div class="form-group">
            <label for="email">Email <span class="required">*</span>:</label>
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
            <label for="phone">Phone Number:</label>
            <input
              id="phone"
              v-model="form.phone"
              type="tel"
              class="form-control"
              placeholder="Enter your phone number"
            />
          </div>

          <div class="form-group">
            <label for="password"
              >Password <span class="required">*</span>:</label
            >
            <input
              id="password"
              v-model="form.password"
              type="password"
              class="form-control"
              placeholder="Enter your password (min 6 characters)"
              required
            />
          </div>

          <button type="submit" class="btn btn-primary" :disabled="loading">
            <span v-if="loading" class="loading-spinner"></span>
            <span v-else>Create Account</span>
          </button>
        </form>

        <div class="register-footer">
          <p>
            Already have an account?
            <router-link to="/login">Login here</router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.register-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.register-card {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 450px;
}

.register-card h1 {
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

.required {
  color: #e53e3e;
}

.register-footer {
  text-align: center;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
}

.register-footer a {
  color: #3182ce;
  text-decoration: none;
  font-weight: 500;
}

.register-footer a:hover {
  text-decoration: underline;
}
</style>
