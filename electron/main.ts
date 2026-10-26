import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import { readFile, writeFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { TournamentDatabase } from './database';

const developmentUrl = process.env['ELECTRON_DEV_SERVER_URL'];

const OPEN_JSON_CHANNEL = 'storage:open-json';
const SAVE_JSON_CHANNEL = 'storage:save-json';
const LOAD_TOURNAMENT_STATE_CHANNEL = 'storage:load-tournament-state';
const SAVE_TOURNAMENT_STATE_CHANNEL = 'storage:save-tournament-state';
let tournamentDatabase: TournamentDatabase | undefined;
let databaseInitializationError: unknown;

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

const tournamentDatabasePath = () => join(app.getPath('userData'), 'turnierplaner.sqlite');
const legacyTournamentStatePath = () => join(app.getPath('userData'), 'turnierplaner-state.json');

const isMissingFileError = (error: unknown): boolean =>
  typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT';

const migrateLegacyTournamentState = (database: TournamentDatabase): void => {
  if (database.load() !== null) {
    return;
  }

  try {
    const content = readFileSync(legacyTournamentStatePath(), 'utf8');
    JSON.parse(content);
    database.save(content);
    console.info('Der bisherige JSON-Turnierstand wurde in SQLite übernommen.');
  } catch (error: unknown) {
    if (!isMissingFileError(error)) {
      console.error('Der bisherige JSON-Turnierstand konnte nicht übernommen werden.', error);
    }
  }
};

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

  ipcMain.handle(LOAD_TOURNAMENT_STATE_CHANNEL, async (): Promise<TournamentStateResult> => {
    try {
      if (databaseInitializationError) {
        throw databaseInitializationError;
      }
      return { content: tournamentDatabase?.load() ?? undefined };
    } catch (error: unknown) {
      console.error('Failed to read tournament state from SQLite.', error);
      return { error: 'Die Turnierdatenbank konnte nicht gelesen werden.' };
    }
  });

  ipcMain.handle(
    SAVE_TOURNAMENT_STATE_CHANNEL,
    async (_event, content: string): Promise<SaveJsonResult> => {
      if (typeof content !== 'string') {
        return { canceled: false, error: 'Ungültige Turnierdaten.' };
      }

      try {
        if (databaseInitializationError) {
          throw databaseInitializationError;
        }
        if (!tournamentDatabase) {
          throw new Error('The tournament database is not initialized.');
        }
        tournamentDatabase.save(content);
        return { canceled: false };
      } catch (error: unknown) {
        console.error('Failed to write tournament state to SQLite.', error);
        return {
          canceled: false,
          error: 'Die Turnierdatenbank konnte nicht gespeichert werden.',
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
    try {
      tournamentDatabase = new TournamentDatabase(tournamentDatabasePath());
      migrateLegacyTournamentState(tournamentDatabase);
    } catch (error: unknown) {
      databaseInitializationError = error;
      console.error('Failed to initialize tournament database.', error);
    }
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

app.on('before-quit', () => {
  tournamentDatabase?.close();
});
