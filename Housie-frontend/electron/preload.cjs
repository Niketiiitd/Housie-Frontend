// electron/preload.js
// ↑ saved as plain JS, not a module

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // Load JSON files
  loadSongs:           () => ipcRenderer.invoke('load-songs'),
  loadQuizFile:        () => ipcRenderer.invoke('load-quiz-file'),

  // Pick ad images
  selectSideAdImage:   () => ipcRenderer.invoke('select-side-ad-image'),
  selectBottomAdImage: () => ipcRenderer.invoke('select-bottom-ad-image'),

  // Ticket actions
  generateTickets:     (options) => ipcRenderer.invoke('generate-tickets', options),
  downloadTickets:     () => ipcRenderer.invoke('download-tickets'),

  // For testing
  ping:                () => ipcRenderer.invoke('ping'),
});
