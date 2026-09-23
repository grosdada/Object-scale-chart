const { app, BrowserWindow, dialog, ipcMain, net, shell } = require('electron');
const path = require('node:path');
const fs = require('node:fs/promises');

const repository = 'https://github.com/grosdada/Object-scale-chart';
const latestApi = 'https://api.github.com/repos/grosdada/Object-scale-chart/releases/latest';
const libraryFilename = 'echelle-subjects.json';

async function readSettings() {
  try { return JSON.parse(await fs.readFile(path.join(app.getPath('userData'), 'settings.json'), 'utf8')); }
  catch { return {}; }
}

async function writeSettings(settings) {
  const file = path.join(app.getPath('userData'), 'settings.json');
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(settings, null, 2), 'utf8');
}

function validSubject(subject) {
  const offsetY = subject?.offsetY ?? 0;
  return subject && typeof subject.id === 'string' && /^[\w-]{1,100}$/.test(subject.id) &&
    typeof subject.name === 'string' && subject.name.trim() && subject.name.length <= 60 &&
    ['human','animal','creature','vehicle','building','object'].includes(subject.category) &&
    ['height','width'].includes(subject.axis) && ['mm','cm','m','km'].includes(subject.unit) &&
    Number.isFinite(subject.size) && subject.size >= 1e-6 && subject.size <= 1e6 &&
    Number.isFinite(subject.aspect) && subject.aspect >= .001 && subject.aspect <= 1000 &&
    Number.isFinite(offsetY) && offsetY >= -.5 && offsetY <= .5 &&
    typeof subject.image === 'string' && subject.image.length < 12e6 && /^data:image\/png;base64,[A-Za-z\d+/=]+$/.test(subject.image);
}

async function libraryPath() {
  const settings = await readSettings();
  return typeof settings.libraryFolder === 'string' && path.isAbsolute(settings.libraryFolder) ? settings.libraryFolder : '';
}

async function readLibrary() {
  const folder = await libraryPath();
  if (!folder) return { folder: '', subjects: [] };
  try {
    const parsed = JSON.parse(await fs.readFile(path.join(folder, libraryFilename), 'utf8'));
    const subjects = Array.isArray(parsed.subjects) ? parsed.subjects.filter(validSubject) : [];
    return { folder, subjects };
  } catch { return { folder, subjects: [] }; }
}

async function writeLibrary(folder, subjects) {
  await fs.mkdir(folder, { recursive: true });
  const target = path.join(folder, libraryFilename), temporary = target + '.tmp';
  await fs.writeFile(temporary, JSON.stringify({ version: 1, subjects }, null, 2), 'utf8');
  await fs.rename(temporary, target).catch(async () => { await fs.rm(target, { force: true }); await fs.rename(temporary, target); });
}

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
ipcMain.handle('library:get', readLibrary);
ipcMain.handle('library:choose', async event => {
  const current = await libraryPath();
  const result = await dialog.showOpenDialog(BrowserWindow.fromWebContents(event.sender), {
    title: 'Choisir le dossier de la bibliothèque My subjects',
    defaultPath: current || app.getPath('documents'),
    properties: ['openDirectory', 'createDirectory']
  });
  if (result.canceled || !result.filePaths[0]) return { canceled: true, ...(await readLibrary()) };
  const settings = await readSettings();
  settings.libraryFolder = result.filePaths[0];
  await writeSettings(settings);
  const library = await readLibrary();
  if (!library.subjects.length) await writeLibrary(library.folder, []);
  return { canceled: false, ...library };
});
ipcMain.handle('library:save', async (_event, subject) => {
  if (!validSubject(subject)) throw new Error('Invalid personal subject');
  const library = await readLibrary();
  if (!library.folder) return { needsFolder: true, ...library };
  const subjects = library.subjects.filter(item => item.id !== subject.id);
  subjects.unshift(subject);
  await writeLibrary(library.folder, subjects);
  return { folder: library.folder, subjects };
});
ipcMain.handle('library:delete', async (_event, id) => {
  if (typeof id !== 'string') throw new Error('Invalid subject id');
  const library = await readLibrary();
  const subjects = library.subjects.filter(item => item.id !== id);
  if (library.folder) await writeLibrary(library.folder, subjects);
  return { folder: library.folder, subjects };
});

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
