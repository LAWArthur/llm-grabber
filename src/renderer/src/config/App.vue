<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { AppConfig } from '../../../shared/config'
import ShortcutInput from './ShortcutInput.vue'

const config = ref<AppConfig>({} as AppConfig)

const saving = ref(false)
const saveMessage = ref('')

async function loadConfig() {
  try {
    config.value = await window.configApi.getAll()
  } catch (error) {
    console.error('Failed to load config:', error)
  }
}

async function saveConfig() {
  saving.value = true
  saveMessage.value = ''
  try {
    await Promise.all(
      Object.entries(config.value).map(([key, value]) => window.configApi.set(key as keyof AppConfig, value))
    )

    // Update shortcuts after saving config
    const result = await window.configApi.updateShortcuts()

    if (result.success) {
      saveMessage.value = 'Settings saved successfully!'
    } else {
      saveMessage.value = 'Settings saved but some shortcuts failed to register'
      console.error('Shortcut registration failed:', result.details)
    }
    setTimeout(() => (saveMessage.value = ''), 3000)
  } catch (error) {
    saveMessage.value = 'Failed to save settings'
    console.error(error)
  } finally {
    saving.value = false
  }
}

function openBaiduConsole() {
  window.open('https://cloud.baidu.com/product/ocr.html', '_blank')
}

onMounted(() => {
  loadConfig()
})
</script>

<template>
  <div class="container">
    <h1>Settings</h1>

    <div class="section">
      <h2>Baidu OCR API</h2>
      <div class="form-group">
        <label for="baiduKey">API Key *</label>
        <input
          id="baiduKey"
          v-model="config.baiduApiKey"
          type="password"
          placeholder="Enter Baidu API Key"
          :disabled="saving"
        />
      </div>

      <div class="form-group">
        <label for="baiduSecret">Secret Key *</label>
        <input
          id="baiduSecret"
          v-model="config.baiduSecretKey"
          type="password"
          placeholder="Enter Baidu Secret Key"
          :disabled="saving"
        />
      </div>

      <div class="form-group">
        <button @click="openBaiduConsole" class="link-btn" type="button">
          🔗 Get API Keys from Baidu Console
        </button>
      </div>
    </div>

    <div class="section">
      <h2>LLM API</h2>
      <div class="form-group">
        <label for="llmEndpoint">LLM API Base URL *</label>
        <input
          id="llmEndpoint"
          v-model="config.llmEndpoint"
          type="text"
          placeholder="OpenAI Compatible URL, typically ends like /api/v3/"
          :disabled="saving"
        />
      </div>

      <div class="form-group">
        <label for="llmModel">LLM Model Name *</label>
        <input
          id="llmModel"
          v-model="config.llmModel"
          type="text"
          placeholder="Enter Model Name"
          :disabled="saving"
        />
      </div>

      <div class="form-group">
        <label for="zhipuKey">API Key *</label>
        <input
          id="zhipuKey"
          v-model="config.llmApiKey"
          type="password"
          placeholder="Enter API Key"
          :disabled="saving"
        />
      </div>
    </div>

    <div class="section">
      <h2>Capture Settings</h2>
      <div class="form-group">
        <label for="captureSize">Capture Size (px): {{ config.captureSize }}</label>
        <input
          id="captureSize"
          v-model.number="config.captureSize"
          type="range"
          min="100"
          max="500"
          step="50"
          :disabled="saving"
        />
      </div>
    </div>

    <div class="section">
      <h2>Keyboard Shortcuts</h2>

      <ShortcutInput
        label="OCR Capture"
        v-model="config.ocrShortcut"
      />

      <ShortcutInput
        label="Text Selection"
        v-model="config.selectionShortcut"
      />

      <small class="hint">
        Click Edit, then press your desired key combination
      </small>
    </div>

    <div class="actions">
      <button @click="saveConfig" :disabled="saving" class="save-btn">
        {{ saving ? 'Saving...' : 'Save Settings' }}
      </button>
      <span v-if="saveMessage" :class="['message', saveMessage.includes('Failed') ? 'error' : 'success']">
        {{ saveMessage }}
      </span>
    </div>
  </div>
</template>

<style scoped>
html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-size: 10px;
}

#app {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  height: 100vh;
}

.container {
  max-width: 500px;
  margin: 0 auto;
  padding: 24px;
  max-height: 100vh;
  overflow-y: auto;
  box-sizing: border-box;
}

/* Custom scrollbar for Electron/Chromium */
.container::-webkit-scrollbar {
  width: 4px;
}

.container::-webkit-scrollbar-track {
  background: transparent;
}

.container::-webkit-scrollbar-thumb {
  background: #444;
  border-radius: 2px;
}

.container::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.container::-webkit-scrollbar-button {
  display: none;
}

h1 {
  font-size: 28px;
  margin: 0 0 24px 0;
  color: #fff;
}

.section {
  margin-bottom: 24px;
  padding: 16px;
  background: #2a2a2a;
  border-radius: 8px;
}

h2 {
  font-size: 16px;
  margin: 0 0 16px 0;
  color: #ccc;
  font-weight: 600;
}

.form-group {
  margin-bottom: 16px;
}

.form-group:last-child {
  margin-bottom: 0;
}

label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #bbb;
}

input[type="password"],
input[type="text"] {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #444;
  border-radius: 4px;
  background: #1a1a1a;
  color: #fff;
  font-size: 14px;
  box-sizing: border-box;
}

input[type="password"]:focus,
input[type="text"]:focus {
  outline: none;
  border-color: #007bff;
}

input[type="range"] {
  width: 100%;
  cursor: pointer;
}

input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.actions {
  margin-top: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.save-btn {
  padding: 10px 24px;
  background: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.save-btn:hover:not(:disabled) {
  background: #0056b3;
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.message {
  font-size: 14px;
  font-weight: 500;
}

.message.success {
  color: #4caf50;
}

.message.error {
  color: #f44336;
}

.link-btn {
  width: 100%;
  padding: 10px 16px;
  background: #2a5298;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  text-align: left;
}

.link-btn:hover {
  background: #3a6ab8;
}

.hint {
  display: block;
  margin-top: 12px;
  font-size: 12px;
  color: #888;
  font-style: italic;
}
</style>

<style>
html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  background: #1a1a1a;
}
</style>
