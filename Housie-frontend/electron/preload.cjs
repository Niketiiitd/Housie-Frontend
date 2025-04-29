// electron/preload.cjs
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  loadLicenseFile: () => ipcRenderer.invoke('load-license-file'),
  loadTicketsFile: () => ipcRenderer.invoke('load-tickets-file'),
  getLicense: () => ipcRenderer.invoke('get-license'),
  getTickets: () => ipcRenderer.invoke('get-tickets'),
});