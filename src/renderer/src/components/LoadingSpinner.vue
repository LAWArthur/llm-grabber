<script setup lang="ts">
defineProps<{
  message?: string
}>()
</script>

<template>
  <div class="loading">
    <div class="spinner">...</div>
    <div v-if="message" class="message">{{ message }}</div>
  </div>
</template>

<style scoped>
.loading {
  text-align: center;
  padding: 10px;
}

.spinner {
  font-size: 14px;
  font-weight: bold;
  animation: pulse 1.5s ease-in-out infinite;
}

.message {
  margin-top: 6px;
  color: #888;
  font-size: 9px;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: 1;
  }
}
</style>
