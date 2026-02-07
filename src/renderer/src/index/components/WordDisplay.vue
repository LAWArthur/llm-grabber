<script setup lang="ts">
defineProps<{
  word: string
  language?: string
  pronunciation?: string
}>()
</script>

<template>
  <div class="word-display">
    <div v-if="language" class="language-badge">{{ language }}</div>
    <h1 class="word">{{ word }}</h1>
    <div v-if="pronunciation" class="pronunciation">{{ pronunciation }}</div>
  </div>
</template>

<style scoped>
.word-display {
  text-align: center;
  margin-bottom: 8px;
}

.language-badge {
  display: inline-block;
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 6px;
  border-radius: 6px;
  font-size: 8px;
  margin-bottom: 4px;
}

.word {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  line-height: 1.2;
}

.pronunciation {
  font-style: italic;
  opacity: 0.8;
  margin-top: 4px;
  font-size: 9px;
  line-height: 1.2;
}
</style>
