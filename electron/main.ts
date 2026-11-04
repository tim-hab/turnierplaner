import { app, BrowserWindow, dialog, ipcMain, Menu, shell, WebContents } from 'electron';
import { readFile, writeFile } from 'node:fs/promises';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { TournamentDatabase } from './database';

const developmentUrl = process.env['ELECTRON_DEV_SERVER_URL'];

const OPEN_JSON_CHANNEL = 'storage:open-json';
const SAVE_JSON_CHANNEL = 'storage:save-json';
const LOAD_TOURNAMENT_STATE_CHANNEL = 'storage:load-tournament-state';
const LIST_TOURNAMENTS_CHANNEL = 'storage:list-tournaments';
const LOAD_TOURNAMENT_CHANNEL = 'storage:load-tournament';
const SAVE_TOURNAMENT_STATE_CHANNEL = 'storage:save-tournament-state';
const SAVE_NEW_TOURNAMENT_CHANNEL = 'storage:save-new-tournament';
const MENU_ACTION_CHANNEL = 'menu:action';
const SET_DIRTY_CHANNEL = 'app:set-dirty';
const CLOSE_RESPONSE_CHANNEL = 'app:close-response';
const REQUEST_CLOSE_CHANNEL = 'app:request-close';
const UPDATE_CHECK_URL = 'https://github.com/tim-hab/turnierplaner/releases/latest';
const WINDOW_STATE_PATH = () => join(app.getPath('userData'), 'window-state.json');
let tournamentDatabase: TournamentDatabase | undefined;
let databaseInitializationError: unknown;
let mainWindow: BrowserWindow | undefined;
let hasUnsavedChanges = false;
let isQuitting = false;

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

interface TournamentListResult {
  tournaments?: ReturnType<TournamentDatabase['list']>;
  error?: string;
}

interface WindowState {
  x?: number;
  y?: number;
  width: number;
  height: number;
}

const tournamentDatabasePath = () => join(app.getPath('userData'), 'turnierplaner.sqlite');
const legacyTournamentStatePath = () => join(app.getPath('userData'), 'turnierplaner-state.json');

const getTournamentDatabase = (): TournamentDatabase => {
  if (tournamentDatabase) {
    return tournamentDatabase;
  }
  if (databaseInitializationError) {
    throw databaseInitializationError;
  }
  throw new Error('The tournament database is not initialized.');
};

const loadWindowState = (): WindowState => {
  try {
    const state = JSON.parse(readFileSync(WINDOW_STATE_PATH(), 'utf8')) as WindowState;
    if (state.width >= 800 && state.height >= 600) {
      return state;
    }
  } catch {
    // Missing or invalid window state uses the default bounds.
  }
  return { width: 1280, height: 800 };
};

const saveWindowState = (window: BrowserWindow): void => {
  const { x, y, width, height } = window.getBounds();
  try {
    writeFileSync(WINDOW_STATE_PATH(), JSON.stringify({ x, y, width, height }));
  } catch (error: unknown) {
    console.error('Das Fensterlayout konnte nicht gespeichert werden.', error);
  }
};

const isAllowedExternalUrl = (url: string): boolean => {
  try {
    return ['https:', 'http:'].includes(new URL(url).protocol);
  } catch {
    return false;
  }
};

const openExternalUrl = (url: string): void => {
  if (!isAllowedExternalUrl(url)) {
    console.warn('Externer Link wurde blockiert.', url);
    return;
  }
  void shell.openExternal(url);
};

const sendMenuAction = (action: string): void => {
  mainWindow?.webContents.send(MENU_ACTION_CHANNEL, action);
};

const createApplicationMenu = (): void => {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'Datei',
      submenu: [
        { label: 'Neu', accelerator: 'CmdOrCtrl+N', click: () => sendMenuAction('new') },
        { label: 'Turnier laden...', click: () => sendMenuAction('load') },
        {
          label: 'Importieren...',
          accelerator: 'CmdOrCtrl+O',
          click: () => sendMenuAction('import'),
        },
        {
          label: 'Exportieren...',
          accelerator: 'CmdOrCtrl+S',
          click: () => sendMenuAction('export'),
        },
        { type: 'separator' },
        { role: 'quit', label: 'Beenden', accelerator: 'Alt+F4' },
      ],
    },
    {
      label: 'Hilfe',
      submenu: [
        {
          label: 'Nach Updates suchen...',
          click: () => openExternalUrl(UPDATE_CHECK_URL),
        },
        {
          label: 'Über Turnierplaner',
          click: () =>
            void dialog.showMessageBox(mainWindow ?? BrowserWindow.getFocusedWindow()!, {
              type: 'info',
              title: 'Über Turnierplaner',
              message: 'Turnierplaner',
              detail: `Version ${app.getVersion()}`,
            }),
        },
      ],
    },
  ];
  if (developmentUrl) {
    template.push({
      label: 'Entwicklung',
      submenu: [{ role: 'toggleDevTools', label: 'Entwicklerwerkzeuge' }],
    });
  }
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
};

const handleWindowNavigation = (contents: WebContents): void => {
  contents.setWindowOpenHandler(({ url }) => {
    openExternalUrl(url);
    return { action: 'deny' };
  });
  contents.on('will-navigate', (event, url) => {
    if (url !== contents.getURL()) {
      event.preventDefault();
      openExternalUrl(url);
    }
  });
};

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
      return { content: getTournamentDatabase().load() ?? undefined };
    } catch (error: unknown) {
      console.error('Failed to read tournament state from SQLite.', error);
      return { error: 'Die Turnierdatenbank konnte nicht gelesen werden.' };
    }
  });

  ipcMain.handle(LIST_TOURNAMENTS_CHANNEL, async (): Promise<TournamentListResult> => {
    try {
      return { tournaments: getTournamentDatabase().list() };
    } catch (error: unknown) {
      console.error('Failed to list tournaments from SQLite.', error);
      return { error: 'Die Turnierdatenbank konnte nicht gelesen werden.' };
    }
  });

  ipcMain.handle(
    LOAD_TOURNAMENT_CHANNEL,
    async (_event, id: number): Promise<TournamentStateResult> => {
      if (!Number.isInteger(id)) {
        return { error: 'Ungültige Turnierauswahl.' };
      }
      try {
        return { content: getTournamentDatabase().loadById(id) ?? undefined };
      } catch (error: unknown) {
        console.error('Failed to read selected tournament from SQLite.', error);
        return { error: 'Das ausgewählte Turnier konnte nicht geladen werden.' };
      }
    },
  );

  ipcMain.handle(
    SAVE_TOURNAMENT_STATE_CHANNEL,
    async (_event, content: string, tournamentId?: number): Promise<SaveJsonResult> => {
      if (typeof content !== 'string') {
        return { canceled: false, error: 'Ungültige Turnierdaten.' };
      }

      try {
        getTournamentDatabase().save(content, tournamentId);
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
  ipcMain.handle(
    SAVE_NEW_TOURNAMENT_CHANNEL,
    async (_event, content: string): Promise<SaveJsonResult> => {
      if (typeof content !== 'string') {
        return { canceled: false, error: 'Ungültige Turnierdaten.' };
      }
      try {
        getTournamentDatabase().saveAsNew(content);
        return { canceled: false };
      } catch (error: unknown) {
        console.error('Failed to create tournament in SQLite.', error);
        return {
          canceled: false,
          error: 'Das neue Turnier konnte nicht gespeichert werden.',
        };
      }
    },
  );
  ipcMain.on(SET_DIRTY_CHANNEL, (_event, dirty: boolean) => {
    hasUnsavedChanges = dirty === true;
  });
  ipcMain.on(CLOSE_RESPONSE_CHANNEL, (_event, response: 'save' | 'discard' | 'cancel') => {
    if (response === 'cancel') {
      return;
    }
    isQuitting = true;
    app.quit();
  });
};

const createWindow = async (): Promise<void> => {
  const windowState = loadWindowState();
  const window = new BrowserWindow({
    ...windowState,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  mainWindow = window;
  handleWindowNavigation(window.webContents);
  if (!developmentUrl) {
    window.webContents.on('devtools-opened', () => window.webContents.closeDevTools());
  }
  window.on('close', (event) => {
    saveWindowState(window);
    if (isQuitting || !hasUnsavedChanges) {
      return;
    }
    event.preventDefault();
    const choice = dialog.showMessageBoxSync(window, {
      type: 'warning',
      title: 'Ungespeicherte Änderungen',
      message: 'Es gibt ungespeicherte Änderungen.',
      detail: 'Möchtest du die Änderungen vor dem Beenden speichern?',
      buttons: ['Speichern', 'Nicht speichern', 'Abbrechen'],
      defaultId: 0,
      cancelId: 2,
    });
    if (choice === 2) {
      return;
    }
    if (choice === 1) {
      isQuitting = true;
      app.quit();
      return;
    }
    window.webContents.send(REQUEST_CLOSE_CHANNEL);
  });

  if (developmentUrl) {
    await window.loadURL(developmentUrl);
    window.webContents.openDevTools({ mode: 'detach' });
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
    createApplicationMenu();
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
