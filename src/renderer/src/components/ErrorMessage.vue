<script setup lang="ts">
defineProps<{
  error: string
}>()
</script>

<template>
  <div class="error">
    <div class="icon">⚠️</div>
    <div class="message">{{ error }}</div>
  </div>
</template>

<style scoped>
.error {
  text-align: center;
  padding: 10px;
}

.icon {
  font-size: 24px;
  margin-bottom: 6px;
}

.message {
  color: #ff6b6b;
  font-size: 9px;
}
</style>
