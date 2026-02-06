import { ipcMain, BrowserWindow } from 'electron'
import { is } from '@electron-toolkit/utils'
import type { TranslationUpdate } from '../shared/types'

/**
 * Mock API for testing frontend without running OCR/LLM services.
 * This registers IPC handlers that can be called from the renderer process.
 */
export function registerMockApi(getMainWindow: () => BrowserWindow | null): void {
  if (!is.dev) return

  ipcMain.handle('mock-translation', async (_event, action, ...args) => {
    const mainWindow = getMainWindow()
    if (!mainWindow || mainWindow.isDestroyed()) return

    switch (action) {
      case 'loading':
        mainWindow.webContents.send('translation-update', { status: 'loading' } as TranslationUpdate)
        mainWindow.show()
        mainWindow.focus()
        break

      case 'word-found':
        const [word, language] = args as [string, string]
        mainWindow.webContents.send('translation-update', {
          status: 'word-found',
          data: { word, language }
        } as TranslationUpdate)
        mainWindow.show()
        mainWindow.focus()
        break

      case 'complete':
        const [data] = args as Array<{
          word: string
          language: string
          pronunciation: string
          translations: Array<{ partOfSpeech: string; translation: string }>
          examples: Array<{ example: string; translation: string }>
        }>
        mainWindow.webContents.send('translation-update', {
          status: 'complete',
          data: {
            word: data.word,
            language: data.language,
            translation: {
              pronunciation: data.pronunciation,
              translations: data.translations,
              examples: data.examples
            }
          }
        } as TranslationUpdate)
        mainWindow.show()
        mainWindow.focus()
        break

      case 'error':
        const [error] = args as [string]
        mainWindow.webContents.send('translation-update', {
          status: 'error',
          error
        } as TranslationUpdate)
        mainWindow.show()
        mainWindow.focus()
        break

      case 'demo':
        mainWindow.show()
        mainWindow.focus()
        mainWindow.webContents.send('translation-update', { status: 'loading' } as TranslationUpdate)
        setTimeout(() => {
          const win = getMainWindow()
          if (win && !win.isDestroyed()) {
            win.webContents.send('translation-update', {
              status: 'word-found',
              data: { word: '吾輩', language: 'japanese' }
            } as TranslationUpdate)
          }
        }, 1500)
        setTimeout(() => {
          const win = getMainWindow()
          if (win && !win.isDestroyed()) {
            win.webContents.send('translation-update', {
              status: 'complete',
              data: {
                word: '吾輩',
                language: 'japanese',
                translation: {
                  language: "japanese",
                  pronunciation: 'わがはい (wagahai)',
                  translations: [
                    {
                      partOfSpeech: '代名詞',
                      translation: '我（一种自称，带有傲慢或幽默的语气）'
                    }
                  ],
                  examples: [
                    {
                      example: '吾輩は猫である。',
                      translation: '我是猫。'
                    },
                    {
                      example: '吾輩は猫である。',
                      translation: '我是猫。'
                    },
                    {
                      example: '吾輩は猫である。',
                      translation: '我是猫。'
                    }
                  ]
                }
              }
            } as TranslationUpdate)
          }
        }, 3000)
        break
    }
  })

  console.log('Mock API registered. Use from DevTools console:')
  console.log('  await window.mockApi("loading")')
  console.log('  await window.mockApi("word-found", "hello", "english")')
  console.log('  await window.mockApi("complete", {...})')
  console.log('  await window.mockApi("error", "Something went wrong")')
  console.log('  await window.mockApi("demo")')
}
