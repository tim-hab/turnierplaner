import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import { copyFile, readFile, rename, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const developmentUrl = process.env['ELECTRON_DEV_SERVER_URL'];

const OPEN_JSON_CHANNEL = 'storage:open-json';
const SAVE_JSON_CHANNEL = 'storage:save-json';
const LOAD_TOURNAMENT_STATE_CHANNEL = 'storage:load-tournament-state';
const SAVE_TOURNAMENT_STATE_CHANNEL = 'storage:save-tournament-state';

interface OpenJsonResult {
  canceled: boolean;
  content?: string;
  error?: string;
}

interface SaveJsonResult {
  canceled: boolean;
  error?: string;
}

interface TournamentStateResult {
  content?: string;
  error?: string;
}

const tournamentStatePath = () => join(app.getPath('userData'), 'turnierplaner-state.json');
const tournamentBackupPath = () => `${tournamentStatePath()}.bak`;
const tournamentTemporaryPath = () => `${tournamentStatePath()}.tmp`;

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

  ipcMain.handle(
    LOAD_TOURNAMENT_STATE_CHANNEL,
    async (): Promise<TournamentStateResult> => {
      try {
        const content = await readFile(tournamentStatePath(), 'utf8');
        JSON.parse(content);
        return { content };
      } catch (error: unknown) {
        try {
          const content = await readFile(tournamentBackupPath(), 'utf8');
          JSON.parse(content);
          console.warn('Der primäre Turnierstand war nicht lesbar; Backup wurde verwendet.', error);
          return { content };
        } catch (backupError: unknown) {
          console.error('Failed to read tournament state or backup.', backupError);
          return {
            error: 'Der gespeicherte Turnierstand konnte nicht gelesen werden.',
          };
        }
      }
    },
  );

  ipcMain.handle(
    SAVE_TOURNAMENT_STATE_CHANNEL,
    async (_event, content: string): Promise<SaveJsonResult> => {
      if (typeof content !== 'string') {
        return { canceled: false, error: 'Ungültige Turnierdaten.' };
      }

      try {
        const statePath = tournamentStatePath();
        await writeFile(tournamentTemporaryPath(), content, 'utf8');
        try {
          await copyFile(statePath, tournamentBackupPath());
        } catch {
          // There is no backup on the first save.
        }
        await rename(tournamentTemporaryPath(), statePath);
        return { canceled: false };
      } catch (error: unknown) {
        console.error('Failed to write tournament state.', error);
        return {
          canceled: false,
          error: 'Der Turnierstand konnte nicht gespeichert werden.',
        };
      }
    },
  );
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
