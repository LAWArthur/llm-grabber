require('dotenv').config()

import { app, shell, BrowserWindow, globalShortcut, ipcMain, screen, Tray, Menu } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { registerMockApi } from './mockApi'
import { ocrCapture } from './workflows/ocr'
import icon from '../../resources/icon.png?asset'

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null

function createWindow(): void {
  // Create the browser window.
  const win = new BrowserWindow({
    width: parseInt(process.env.CAPTURE_SIZE!),
    height: parseInt(process.env.CAPTURE_SIZE!),
    show: false,
    titleBarStyle: 'hidden',
    resizable: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  // Window stays hidden initially, shown only after capture

  win.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }

  win.setSkipTaskbar(true)
  win.setAlwaysOnTop(true)

  // Store reference
  mainWindow = win
}

function popWindow() {
  if (mainWindow === null) return
  // 1. Position and show window IMMEDIATELY
  const cursorPoint = screen.getCursorScreenPoint()
  const offset = 20
  mainWindow.setPosition(cursorPoint.x - 100, cursorPoint.y - 200 - offset)
  mainWindow.show()
  mainWindow.focus()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Register global shortcut for screen capture
  const ret = globalShortcut.register('CommandOrControl+Alt+X', async () => {
    popWindow()
    await ocrCapture(mainWindow!)
  })

  if (!ret) {
    console.error('Global shortcut registration failed')
  }

  createWindow()

  // Register mock API for dev/testing
  if (is.dev) {
    registerMockApi(() => mainWindow)
    mainWindow!.webContents.openDevTools()
  }

  // Handle window minimize request from renderer
  ipcMain.on('minimize-window', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.hide()
    }
  })

  tray = new Tray(icon)
  const contextMenu = Menu.buildFromTemplate([
    { role: 'quit' }
  ])
  tray.setContextMenu(contextMenu)
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('will-quit', () => {
  // Unregister all shortcuts before quitting
  globalShortcut.unregisterAll()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
