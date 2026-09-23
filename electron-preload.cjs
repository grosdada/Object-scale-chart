const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktopApp', Object.freeze({
  getVersion: () => ipcRenderer.invoke('app:version'),
  latestRelease: () => ipcRenderer.invoke('updates:latest'),
  openUpdate: url => ipcRenderer.invoke('updates:open', url),
  getLibrary: () => ipcRenderer.invoke('library:get'),
  chooseLibraryFolder: () => ipcRenderer.invoke('library:choose'),
  savePersonalSubject: subject => ipcRenderer.invoke('library:save', subject),
  deletePersonalSubject: id => ipcRenderer.invoke('library:delete', id)
}));
