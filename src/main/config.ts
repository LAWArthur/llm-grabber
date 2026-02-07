import __Store from 'electron-store'
// @ts-ignore
const Store = (__Store.default || __Store) as typeof __Store // This is fxxking crazy...
import type { AppConfig } from '../shared/config'

const defaults: AppConfig = {
  baiduApiKey: '',
  baiduSecretKey: '',
  llmEndpoint: 'https://open.bigmodel.cn/api/paas/v4/',
  llmModel: 'glm-4.5-airx',
  llmApiKey: '',
  captureSize: 200,
  ocrShortcut: 'CommandOrControl+Alt+X',
  selectionShortcut: 'CommandOrControl+Alt+C'
}

// Create store instance
export const store = new Store<AppConfig>({ defaults })

/**
 * Get configuration value
 */
export function getConfig<K extends keyof AppConfig>(key: K): AppConfig[K] {
  return store.get(key)
}

/**
 * Set configuration value
 */
export function setConfig<K extends keyof AppConfig>(key: K, value: AppConfig[K]): void {
  store.set(key, value)
}

/**
 * Get all configuration
 */
export function getAllConfig(): AppConfig {
  return store.store
}

/**
 * Check if required configuration is complete
 */
export function isConfigComplete(): boolean {
  const config = store.store
  return !!(
    config.baiduApiKey &&
    config.baiduSecretKey &&
    config.llmEndpoint &&
    config.llmModel &&
    config.llmApiKey
  )
}
