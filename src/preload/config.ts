import { contextBridge, ipcRenderer } from 'electron'
import type { AppConfig, ConfigKey } from '../shared/config'

interface ShortcutResult {
  success: boolean
  details?: {
    ocrRegistered: boolean
    selectionRegistered: boolean
  }
}

export interface ConfigApi {
  get<K extends ConfigKey>(key: K): Promise<AppConfig[K]>
  set<K extends ConfigKey>(key: K, value: AppConfig[K]): Promise<void>
  getAll(): Promise<AppConfig>
  updateShortcuts(): Promise<ShortcutResult>
  pauseShortcuts(): Promise<{ success: boolean }>
}

const configApi: ConfigApi = {
  get(key) {
    return ipcRenderer.invoke('get-config', key)
  },
  set(key, value) {
    return ipcRenderer.invoke('set-config', key, value)
  },
  getAll() {
    return ipcRenderer.invoke('get-all-config')
  },
  updateShortcuts() {
    return ipcRenderer.invoke('update-shortcuts')
  },
  pauseShortcuts() {
    return ipcRenderer.invoke('pause-shortcuts')
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('configApi', configApi)
  } catch (error) {
    console.error(error)
  }
}
