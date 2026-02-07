import { BrowserWindow } from "electron";
import { TranslationUpdate } from "../../shared/types";
import { getTranslation } from "../services/llm";
import { captureSelection } from "../services/selection";
import { popWindow } from "../utils";

export async function selectionCapture(mainWindow: BrowserWindow) {
  if (!mainWindow || mainWindow.isDestroyed()) return

  try {
    // 2. Send initial loading state
    mainWindow.webContents.send('translation-update', {
      status: 'loading'
    } as TranslationUpdate)

    // 3. Start async pipeline
    const word = await captureSelection()

    popWindow(mainWindow)

    if (word !== '') {

      // 5. Send word-found update
      mainWindow.webContents.send('translation-update', {
        status: 'word-found',
        data: { word, language: undefined! }
      } as TranslationUpdate)

      // 6. Get translation
      const translation = await getTranslation('auto-detect', word)

      // 7. Send complete update
      mainWindow.webContents.send('translation-update', {
        status: 'complete',
        data: { word, language: translation.language, translation }
      } as TranslationUpdate)
    } else {
      mainWindow.webContents.send('translation-update', {
        status: 'error',
        error: 'No text selection detected. Probably due to prohibition of copying. '
      } as TranslationUpdate)
    }
  } catch (error) {
    console.error('Capture failed:', error)
    mainWindow.webContents.send('translation-update', {
      status: 'error',
      error: error instanceof Error ? error.message : 'Failed to process capture'
    } as TranslationUpdate)
  }
}