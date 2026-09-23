const { app, BrowserWindow, ipcMain, net, shell } = require('electron');
const path = require('node:path');

const repository = 'https://github.com/grosdada/Object-scale-chart';
const latestApi = 'https://api.github.com/repos/grosdada/Object-scale-chart/releases/latest';

function trustedGithubUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && ['github.com', 'objects.githubusercontent.com'].includes(url.hostname);
  } catch {
    return false;
  }
}

async function latestRelease() {
  const response = await net.fetch(latestApi, { headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'Echelle-Desktop' } });
  if (!response.ok) throw new Error(`GitHub returned ${response.status}`);
  const release = await response.json();
  const executable = Array.isArray(release.assets) ? release.assets.find(asset => /\.exe$/i.test(asset.name)) : null;
  return { version: String(release.tag_name || '').replace(/^v/i, ''), url: executable?.browser_download_url || release.html_url || `${repository}/releases/latest` };
}

function createWindow() {
  const window = new BrowserWindow({
    width: 1480,
    height: 980,
    minWidth: 900,
    minHeight: 680,
    backgroundColor: '#edf0f5',
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'build', 'icon.ico'),
    webPreferences: { preload: path.join(__dirname, 'electron-preload.cjs'), contextIsolation: true, nodeIntegration: false, sandbox: true }
  });
  window.loadFile('index.html');
  window.webContents.setWindowOpenHandler(({ url }) => {
    if (trustedGithubUrl(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  window.webContents.on('will-navigate', event => event.preventDefault());
}

ipcMain.handle('app:version', () => app.getVersion());
ipcMain.handle('updates:latest', latestRelease);
ipcMain.handle('updates:open', async (_event, url) => {
  if (!trustedGithubUrl(url)) throw new Error('Untrusted update URL');
  await shell.openExternal(url);
  return true;
});

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
