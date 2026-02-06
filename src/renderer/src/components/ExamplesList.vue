<script setup lang="ts">
defineProps<{
  examples: Array<{ example: string; translation: string }>
}>()
</script>

<template>
  <div class="examples-section">
    <h2>Examples</h2>
    <div v-for="ex in examples" :key="ex.example" class="item">
      <div class="example-text">{{ ex.example }}</div>
      <div class="translation">{{ ex.translation }}</div>
    </div>
  </div>
</template>

<style scoped>
.examples-section {
  margin-bottom: 8px;
}

h2 {
  font-size: 9px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #888;
}

.item {
  margin-bottom: 6px;
}

.example-text {
  font-weight: 500;
  margin-bottom: 2px;
  font-size: 10px;
  line-height: 1.2;
}

.translation {
  font-size: 8px;
  color: #888;
  font-style: italic;
  line-height: 1.2;
}
</style>
