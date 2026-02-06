import { contextBridge, ipcRenderer } from 'electron'
import type { TranslationUpdate } from '../shared/types'

export type Api = {
  onTranslationUpdate: (callback: (update: TranslationUpdate) => void) => void
  // Dev-only mock API
  mockApi: (action: string, ...args: any[]) => Promise<void>
  // Window controls
  minimizeWindow: () => void
}

// Custom APIs for renderer
const api: Api = {
  onTranslationUpdate(callback) {
    ipcRenderer.on('translation-update', (_event, update) => callback(update))
  },

  async mockApi(action, ...args) {
    return ipcRenderer.invoke('mock-translation', action, ...args)
  },

  minimizeWindow() {
    ipcRenderer.send('minimize-window')
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
}
