const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')

// Allow autoplay with sound — no user gesture required
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required')

function createWindow() {
  const win = new BrowserWindow({
    fullscreen: true,
    autoHideMenuBar: true,
    backgroundColor: '#000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (!app.isPackaged) {
    win.loadURL('http://localhost:5173')
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

ipcMain.handle('get-videos', () => {
  const videosDir = !app.isPackaged
    ? path.join(process.cwd(), 'public/assets/videos')
    : path.join(__dirname, '../dist/assets/videos')

  try {
    return fs.readdirSync(videosDir)
  } catch {
    return []
  }
})

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  app.quit()
})
