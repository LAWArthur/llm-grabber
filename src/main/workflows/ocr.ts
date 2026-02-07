import { BrowserWindow } from "electron";
import { TranslationUpdate } from "../../shared/types";
import { captureScreen } from "../services/capture";
import { findNearestCharAtPosition, getTextWithPositionFromImage } from "../services/ocr";
import { extractWord, getTranslation } from "../services/llm";
import { popWindow } from "../utils";
import { getConfig } from "../config";

export async function ocrCapture(mainWindow: BrowserWindow) {
  if (!mainWindow || mainWindow.isDestroyed()) return

  try {
    // 2. Send initial loading state
    mainWindow.webContents.send('translation-update', {
      status: 'loading'
    } as TranslationUpdate)

    // 3. Start async pipeline
    const imageData = await captureScreen()

    popWindow(mainWindow)

    const CAPTURE_SIZE = getConfig('captureSize')
    const ocrResult = await getTextWithPositionFromImage(imageData)
    const charPos = findNearestCharAtPosition(ocrResult, CAPTURE_SIZE / 2, CAPTURE_SIZE / 2)

    if (charPos !== null) {
      // 4. Extract word
      const word = await extractWord(
        ocrResult.words_result[charPos.wordBoxIndex].words,
        charPos.index
      )

      // 5. Send word-found update
      mainWindow.webContents.send('translation-update', {
        status: 'word-found',
        data: word
      } as TranslationUpdate)

      // 6. Get translation
      const translation = await getTranslation(word.language, word.word)

      // 7. Send complete update
      mainWindow.webContents.send('translation-update', {
        status: 'complete',
        data: { ...word, translation }
      } as TranslationUpdate)
    } else {
      mainWindow.webContents.send('translation-update', {
        status: 'error',
        error: 'No word detected at cursor position'
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