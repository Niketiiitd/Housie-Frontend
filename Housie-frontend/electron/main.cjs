// electron/main.cjs
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs   = require('fs');
const path = require('path');

let mainWindow;
const dataDir    = app.getPath('userData');
const licenseDst = path.join(dataDir, 'license.json');
const ticketsDst = path.join(dataDir, 'tickets.json');

// Ensure dataDir exists
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

function createWindow() {
  mainWindow = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true
    }
  });
  const startUrl = process.env.DEV
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../dist/index.html')}`;
  mainWindow.loadURL(startUrl);
}

app.whenReady().then(createWindow);

// IPC: Load License JSON
ipcMain.handle('load-license-file', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    title: 'Select License JSON',
    filters: [{ name: 'JSON', extensions: ['json'] }],
    properties: ['openFile']
  });
  if (canceled || !filePaths[0]) return { ok: false };
  fs.copyFileSync(filePaths[0], licenseDst);
  return { ok: true };
});

// IPC: Load Tickets JSON
ipcMain.handle('load-tickets-file', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    title: 'Select Tickets JSON',
    filters: [{ name: 'JSON', extensions: ['json'] }],
    properties: ['openFile']
  });
  if (canceled || !filePaths[0]) return { ok: false };
  fs.copyFileSync(filePaths[0], ticketsDst);
  return { ok: true };
});

// IPC: Read License (so renderer can know expiry, etc.)
ipcMain.handle('get-license', () => {
  if (!fs.existsSync(licenseDst)) return null;
  return JSON.parse(fs.readFileSync(licenseDst, 'utf8'));
});

// IPC: Read Tickets
ipcMain.handle('get-tickets', () => {
  if (!fs.existsSync(ticketsDst)) return null;
  return JSON.parse(fs.readFileSync(ticketsDst, 'utf8'));
});
