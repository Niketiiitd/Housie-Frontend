import { getCurrentWindow } from '@electron/remote';

export default function focusElectronWindow() {
  const currentWindow = getCurrentWindow();
  if (currentWindow) {
    currentWindow.webContents.focus();
  }
}