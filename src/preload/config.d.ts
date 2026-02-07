import type { AppConfig, ConfigKey } from '../shared/config'

import type { ConfigApi } from './config'

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

declare global {
  interface Window {
    configApi: ConfigApi
  }
}
