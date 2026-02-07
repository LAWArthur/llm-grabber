import { app, shell, BrowserWindow, globalShortcut, ipcMain, Tray, Menu } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { registerMockApi } from './mockApi'
import { ocrCapture } from './workflows/ocr'
import icon from '../../resources/icon.png?asset'
import { selectionCapture } from './workflows/selection'
import { getConfig, setConfig, getAllConfig, isConfigComplete } from './config'

let mainWindow: BrowserWindow | null = null
let configWindow: BrowserWindow | null = null
let tray: Tray | null = null

// Track registered shortcuts for unregistration
let registeredOcrShortcut: string | null = null
let registeredSelectionShortcut: string | null = null

function registerShortcuts() {
  unregisterShortcuts()

  const ocrShortcut = getConfig('ocrShortcut')
  const selectionShortcut = getConfig('selectionShortcut')

  const ocrRegistered = globalShortcut.register(ocrShortcut, async () => {
    await ocrCapture(mainWindow!)
  })

  const selectionRegistered = globalShortcut.register(selectionShortcut, async () => {
    await selectionCapture(mainWindow!)
  })

  if (ocrRegistered) {
    registeredOcrShortcut = ocrShortcut
  }
  if (selectionRegistered) {
    registeredSelectionShortcut = selectionShortcut
  }

  return {
    ocrRegistered,
    selectionRegistered
  }
}

function unregisterShortcuts() {
  if (registeredOcrShortcut) {
    globalShortcut.unregister(registeredOcrShortcut)
    registeredOcrShortcut = null
  }
  if (registeredSelectionShortcut) {
    globalShortcut.unregister(registeredSelectionShortcut)
    registeredSelectionShortcut = null
  }
}

function createWindow(): void {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 200,
    height: 200,
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

function createConfigWindow(): void {
  if (configWindow && !configWindow.isDestroyed()) {
    configWindow.focus()
    return
  }

  const win = new BrowserWindow({
    width: 600,
    height: 500,
    show: false,
    titleBarStyle: 'default',
    resizable: true,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/config.js'),
      sandbox: false
    }
  })

  win.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    // console.log(process.env['ELECTRON_RENDERER_URL'] + '/config.html')
    win.loadURL(process.env['ELECTRON_RENDERER_URL'] + '/config.html')
  } else {
    win.loadFile(join(__dirname, '../renderer/config.html'))
  }

  win.once('ready-to-show', () => {
    win.show()
  })

  configWindow = win
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

  // Register global shortcuts from config
  registerShortcuts()

  createWindow()

  // Check if configuration is complete, if not open config window
  if (!isConfigComplete()) {
    createConfigWindow()
  }

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

  // Config management IPC handlers
  ipcMain.handle('get-config', async (_event, key) => getConfig(key))
  ipcMain.handle('set-config', async (_event, key, value) => {
    setConfig(key, value)
  })
  ipcMain.handle('get-all-config', async () => getAllConfig())

  // Shortcut management IPC handlers
  ipcMain.handle('update-shortcuts', async () => {
    const result = registerShortcuts()
    return {
      success: result.ocrRegistered && result.selectionRegistered,
      details: result
    }
  })

  ipcMain.handle('pause-shortcuts', async () => {
    unregisterShortcuts()
    return { success: true }
  })

  tray = new Tray(icon)
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Settings', click: () => createConfigWindow() },
    { type: 'separator' },
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
console.log(app.getPath('userData'))