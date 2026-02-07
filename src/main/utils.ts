import { BrowserWindow, screen } from "electron"

export function popWindow(mainWindow: BrowserWindow) {
  if (mainWindow === null) return

  // 1. Position and show window IMMEDIATELY
  const cursorPoint = screen.getCursorScreenPoint()
  const offset = 20

  // Calculate desired position (centered above cursor)
  let x = cursorPoint.x - 100
  let y = cursorPoint.y - 200 - offset

  // Get screen bounds
  const display = screen.getPrimaryDisplay()
  const { width: screenWidth, height: screenHeight } = display.bounds

  // Clamp position to screen bounds
  x = Math.max(0, Math.min(x, screenWidth - 200))
  y = Math.max(0, Math.min(y, screenHeight - 200))

  mainWindow.setPosition(x, y)
  mainWindow.show()
  mainWindow.focus()
}