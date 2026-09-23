const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktopApp', Object.freeze({
  getVersion: () => ipcRenderer.invoke('app:version'),
  latestRelease: () => ipcRenderer.invoke('updates:latest'),
  openUpdate: url => ipcRenderer.invoke('updates:open', url)
}));
