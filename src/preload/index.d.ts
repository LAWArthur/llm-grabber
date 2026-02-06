import { ElectronAPI } from '@electron-toolkit/preload'
import { Api } from './index'

declare global {
  interface Window {
    api: Api
  }
}
