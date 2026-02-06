<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { TranslationUpdate } from '../../shared/types'
import WordDisplay from './components/WordDisplay.vue'
import TranslationsList from './components/TranslationsList.vue'
import ExamplesList from './components/ExamplesList.vue'
import LoadingSpinner from './components/LoadingSpinner.vue'
import ErrorMessage from './components/ErrorMessage.vue'

const update = ref<TranslationUpdate>({ status: 'loading' })

function minimize() {
  window.api.minimizeWindow()
}

onMounted(() => {
  window.api.onTranslationUpdate((data) => {
    update.value = data
  })
})
</script>

<template>
  <div class="container">
    <button class="minimize-btn" @click="minimize">−</button>
    <ErrorMessage v-if="update.status === 'error'" :error="update.error" />
    <LoadingSpinner v-else-if="update.status === 'loading'" message="Loading..." />
    <div v-else class="content">
      <WordDisplay
        :word="update.data.word"
        :language="update.status === 'complete' && update.data.translation.language !== undefined ? update.data.translation.language : update.data.language"
        :pronunciation="update.status === 'complete' ? update.data.translation.pronunciation : undefined"
      />
      <TranslationsList
        v-if="update.status === 'complete'"
        :translations="update.data.translation.translations"
      />
      <LoadingSpinner v-else message="Loading translations..." />
      <ExamplesList
        v-if="update.status === 'complete'"
        :examples="update.data.translation.examples"
      />
    </div>
  </div>
</template>

<style>
html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-size: 10px;
}

.container {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1a1a1a;
  color: #ffffff;
  margin: 0;
  padding: 0;
  position: relative;
}

.minimize-btn {
  position: absolute;
  top: 4px;
  left: 4px;
  width: 16px;
  height: 16px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  font-size: 12px;
  line-height: 1;
  cursor: pointer;
  border-radius: 3px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.minimize-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.content {
  width: 100%;
  max-width: 180px;
  max-height: 200px;
  padding: 10px;
  overflow-y: auto;
}

/* Custom scrollbar for Electron/Chromium */
.content::-webkit-scrollbar {
  width: 4px;
}

.content::-webkit-scrollbar-track {
  background: transparent;
}

.content::-webkit-scrollbar-thumb {
  background: #444;
  border-radius: 2px;
}

.content::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.content::-webkit-scrollbar-button {
  display: none;
}
</style>
