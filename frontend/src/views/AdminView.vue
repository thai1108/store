<script setup>
// This is a placeholder for the admin view
</script>

<template>
  <div class="placeholder-view">
    <div class="container">
      <h1>{{ $t('admin.title') }}</h1>
      <p>{{ $t('admin.underConstruction') }}</p>
      <router-link to="/" class="btn btn-primary">{{ $t('admin.backToHome') }}</router-link>
    </div>
  </div>
</template>

<style scoped>
.placeholder-view {
  padding: 80px 20px;
  text-align: center;
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-view h1 {
  font-size: 2rem;
  color: #2d3748;
  margin-bottom: 20px;
}

.placeholder-view p {
  color: #718096;
  margin-bottom: 30px;
  font-size: 1.1rem;
}
</style>
