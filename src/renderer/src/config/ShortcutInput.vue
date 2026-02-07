<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  modelValue: string
  label: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const recording = ref(false)

async function startRecording() {
  recording.value = true
  // Pause backend shortcuts to avoid triggering during recording
  await window.configApi.pauseShortcuts()

  const handleKeyDown = (e: KeyboardEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log(e.key, e.ctrlKey, e.altKey, e.shiftKey)
    // Build accelerator string
    const modifiers: string[] = []
    if (e.ctrlKey || e.metaKey) modifiers.push('CommandOrControl')
    if (e.altKey) modifiers.push('Alt')
    if (e.shiftKey) modifiers.push('Shift')

    const key = e.key.toUpperCase()
    if (!key || key === 'CONTROL' || key === 'ALT' || key === 'SHIFT' || key === 'META') {
      return
    }

    const accelerator = [...modifiers, key].join('+')
    emit('update:modelValue', accelerator)
    recording.value = false
    window.configApi.updateShortcuts()
    document.removeEventListener('keydown', handleKeyDown)
  }

  document.addEventListener('keydown', handleKeyDown)
}

async function cancelRecording() {
  recording.value = false
  // Resume shortcuts (will be re-registered when user saves)
  await window.configApi.updateShortcuts()
}
</script>

<template>
  <div class="shortcut-input">
    <label>{{ label }}</label>
    <div class="input-group">
      <div class="shortcut-display" :class="{ recording }">
        <span v-if="!recording">{{ modelValue || 'Not set' }}</span>
        <span v-else class="recording-text">Press keys...</span>
      </div>
      <button
        v-if="!recording"
        @click="startRecording"
        class="record-btn"
        type="button"
      >
        Edit
      </button>
      <button
        v-else
        @click="cancelRecording"
        class="cancel-btn"
        type="button"
      >
        Cancel
      </button>
    </div>
  </div>
</template>

<style scoped>
.shortcut-input {
  margin-bottom: 16px;
}

label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #bbb;
}

.input-group {
  display: flex;
  gap: 8px;
  align-items: center;
}

.shortcut-display {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #444;
  border-radius: 4px;
  background: #1a1a1a;
  color: #fff;
  font-size: 13px;
  font-family: monospace;
}

.shortcut-display.recording {
  border-color: #007bff;
  background: #003366;
  animation: pulse 1.5s infinite;
}

.recording-text {
  color: #007bff;
  font-style: italic;
}

.record-btn,
.cancel-btn {
  padding: 10px 16px;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
}

.record-btn {
  background: #444;
  color: #fff;
}

.record-btn:hover {
  background: #555;
}

.cancel-btn {
  background: #f44336;
  color: #fff;
}

.cancel-btn:hover {
  background: #d32f2f;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
</style>
