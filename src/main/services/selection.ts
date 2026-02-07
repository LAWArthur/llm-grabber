import { clipboard } from 'electron'
import robot from 'robotjs'

interface ClipboardState {
  text: string | null
  hasContent: boolean
}

/**
 * Save current clipboard content
 */
function saveClipboard(): ClipboardState {
  try {
    const text = clipboard.readText()
    return {
      text: text || '',
      hasContent: text.length > 0
    }
  } catch (error) {
    console.error('Failed to read clipboard:', error)
    return {
      text: null,
      hasContent: false
    }
  }
}

/**
 * Restore clipboard content
 */
function restoreClipboard(state: ClipboardState): void {
  try {
    if (state.hasContent && state.text) {
      clipboard.writeText(state.text)
    } else {
      // Clear clipboard if it was empty
      clipboard.writeText('')
    }
  } catch (error) {
    console.error('Failed to restore clipboard:', error)
  }
}

/**
 * Simulate Ctrl+C to copy selected text
 * This sends the copy keyboard command to the active window
 */
function sendCopyCommand(): void {
  // Release all modifier keys first to avoid stuck keys
  const modifiers = ['control', 'alt', 'shift', 'win']
  modifiers.forEach((key) => {
    try {
      robot.keyToggle(key, 'up')
    } catch (e) {
      // Key might not be pressed, ignore
    }
  })

  // Small delay to ensure keys are released
  robot.setKeyboardDelay(10)

  // Press Ctrl+C
  robot.keyToggle('control', 'down')
  robot.keyTap('c')
  robot.keyToggle('control', 'up')
}

/**
 * Get selected text using the clipboard fallback method.
 * This works for almost all applications by simulating Ctrl+C.
 *
 * The process:
 * 1. Save current clipboard content
 * 2. Send Ctrl+C to copy selected text
 * 3. Read new clipboard content
 * 4. Restore original clipboard
 *
 * @returns Promise<string> The selected text, or empty string if failed
 */
export async function getSelectedText(): Promise<string> {
  // Save current clipboard state
  const clipboardState = saveClipboard()
  restoreClipboard({ hasContent: false, text: null })

  try {
    // Send Ctrl+C to copy selection
    sendCopyCommand()

    // Wait for clipboard to update (applications need time to process)
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Read clipboard content
    const selectedText = clipboard.readText().trim()

    // Restore original clipboard
    restoreClipboard(clipboardState)

    return selectedText
  } catch (error) {
    // Always restore clipboard even if error occurs
    restoreClipboard(clipboardState)
    console.error('Failed to get selected text:', error)
    return ''
  }
}

/**
 * Smart selection capture that tries multiple methods.
 *
 * @returns Promise<string> The selected text
 */
export async function captureSelection(): Promise<string> {

  // Fall back to clipboard method
  return await getSelectedText()
}
