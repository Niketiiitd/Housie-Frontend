// electron/main.cjs
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto'); // For signature verification

let mainWindow;
const dataDir = app.getPath('userData');
const licenseDst = path.join(dataDir, 'license.json');
const ticketsDst = path.join(dataDir, 'tickets.json');
const pubKeyPath = path.join(__dirname, 'pub.pem'); // Path to public key

// Ensure dataDir exists
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

// Load public key
let publicKey = null;
if (fs.existsSync(pubKeyPath)) {
  publicKey = fs.readFileSync(pubKeyPath, 'utf8');
  console.log('Public key loaded from:', pubKeyPath);
} else {
  console.error('Public key not found at:', pubKeyPath);
}

// Verify license signature and expiry
function verifyLicense(licenseData) {
  if (!publicKey || !licenseData) return { valid: false, error: 'No license or public key' };

  const { license, signature } = licenseData;
  if (!license || !signature) return { valid: false, error: 'Invalid license format' };

  // Verify signature
  const verifier = crypto.createVerify('SHA256');
  verifier.update(JSON.stringify(license));
  const isValidSignature = verifier.verify(publicKey, signature, 'base64');

  if (!isValidSignature) return { valid: false, error: 'Invalid signature' };

  // Check expiry
  const expiryDate = new Date(license.expires);
  if (isNaN(expiryDate.getTime())) return { valid: false, error: 'Invalid expiry date' };
  if (expiryDate < new Date()) return { valid: false, error: 'License expired' };

  return { valid: true, data: license };
}

function createWindow() {
  // Check if public key is loaded before proceeding
  if (!publicKey) {
    dialog.showErrorBox('Error', 'Public key not found. The application cannot start.');
    app.quit();
    return;
  }

  mainWindow = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
    },
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
    properties: ['openFile'],
  });
  if (canceled || !filePaths[0]) return { ok: false, error: 'No file selected' };

  try {
    const licenseData = JSON.parse(fs.readFileSync(filePaths[0], 'utf8'));
    const verification = verifyLicense(licenseData);
    if (!verification.valid) return { ok: false, error: verification.error };

    // If valid, copy to userData
    fs.copyFileSync(filePaths[0], licenseDst);
    return { ok: true, data: verification.data };
  } catch (err) {
    return { ok: false, error: 'Failed to load license: ' + err.message };
  }
});

// IPC: Load Tickets JSON
ipcMain.handle('load-tickets-file', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    title: 'Select Tickets JSON',
    filters: [{ name: 'JSON', extensions: ['json'] }],
    properties: ['openFile'],
  });
  if (canceled || !filePaths[0]) return { ok: false };
  fs.copyFileSync(filePaths[0], ticketsDst);
  return { ok: true };
});

// IPC: Read License (with verification)
ipcMain.handle('get-license', () => {
  if (!fs.existsSync(licenseDst)) return { valid: false, error: 'No license found' };
  try {
    const licenseData = JSON.parse(fs.readFileSync(licenseDst, 'utf8'));
    return verifyLicense(licenseData);
  } catch (err) {
    return { valid: false, error: 'Failed to read license: ' + err.message };
  }
});

// IPC: Read Tickets
ipcMain.handle('get-tickets', () => {
  if (!fs.existsSync(ticketsDst)) return null;
  return JSON.parse(fs.readFileSync(ticketsDst, 'utf8'));
});