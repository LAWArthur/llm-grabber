export interface AppConfig {
  baiduApiKey: string
  baiduSecretKey: string
  llmEndpoint: string
  llmModel: string
  llmApiKey: string
  captureSize: number
  ocrShortcut: string
  selectionShortcut: string
}

export type ConfigKey = keyof AppConfig
