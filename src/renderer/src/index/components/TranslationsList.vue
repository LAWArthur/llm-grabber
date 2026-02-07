<script setup lang="ts">
defineProps<{
  translations: Array<{ partOfSpeech: string; translation: string }>
}>()
</script>

<template>
  <div class="translations-section">
    <h2>Translation</h2>
    <div v-for="trans in translations" :key="trans.partOfSpeech" class="item">
      <span class="pos">{{ trans.partOfSpeech }}</span>
      <span class="meaning">{{ trans.translation }}</span>
    </div>
  </div>
</template>

<style scoped>
.translations-section {
  margin-bottom: 8px;
}

h2 {
  font-size: 9px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #888;
}

.item {
  display: flex;
  gap: 6px;
  margin-bottom: 3px;
  font-size: 10px;
  line-height: 1.2;
}

.pos {
  font-weight: 600;
  min-width: 40px;
  color: #aaa;
}

.meaning {
  flex: 1;
}
</style>
