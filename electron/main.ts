import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const developmentUrl = process.env['ELECTRON_DEV_SERVER_URL'];

const OPEN_JSON_CHANNEL = 'storage:open-json';
const SAVE_JSON_CHANNEL = 'storage:save-json';

interface OpenJsonResult {
  canceled: boolean;
  content?: string;
  error?: string;
}

interface SaveJsonResult {
  canceled: boolean;
  error?: string;
}

const registerStorageHandlers = () => {
  ipcMain.handle(OPEN_JSON_CHANNEL, async (): Promise<OpenJsonResult> => {
    const result = await dialog.showOpenDialog({
      title: 'JSON importieren',
      properties: ['openFile'],
      filters: [{ name: 'JSON', extensions: ['json'] }],
    });

    if (result.canceled || result.filePaths.length === 0) {
      return { canceled: true };
    }

    try {
      const content = await readFile(result.filePaths[0], 'utf8');
      return { canceled: false, content };
    } catch (error: unknown) {
      console.error('Failed to read JSON import file.', error);
      return {
        canceled: false,
        error: 'Die ausgewählte Datei konnte nicht gelesen werden.',
      };
    }
  });

  ipcMain.handle(SAVE_JSON_CHANNEL, async (_event, content: string): Promise<SaveJsonResult> => {
    if (typeof content !== 'string') {
      return { canceled: false, error: 'Ungültige Exportdaten.' };
    }

    const result = await dialog.showSaveDialog({
      title: 'JSON exportieren',
      defaultPath: 'turnier.json',
      filters: [{ name: 'JSON', extensions: ['json'] }],
    });

    if (result.canceled || !result.filePath) {
      return { canceled: true };
    }

    try {
      await writeFile(result.filePath, content, 'utf8');
      return { canceled: false };
    } catch (error: unknown) {
      console.error('Failed to write JSON export file.', error);
      return {
        canceled: false,
        error: 'Die Datei konnte nicht gespeichert werden.',
      };
    }
  });
};

const createWindow = async (): Promise<void> => {
  const window = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  if (developmentUrl) {
    await window.loadURL(developmentUrl);
    return;
  }

  await window.loadFile(join(__dirname, '..', 'dist', 'turnierplaner', 'browser', 'index.html'));
};

app
  .whenReady()
  .then(async () => {
    registerStorageHandlers();
    await createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        void createWindow();
      }
    });
  })
  .catch((error: unknown) => {
    console.error('Failed to create the Electron window.', error);
    app.quit();
  });

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
