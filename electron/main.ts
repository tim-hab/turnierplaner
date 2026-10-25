import { app, BrowserWindow } from 'electron';
import { join } from 'node:path';

const developmentUrl = process.env['ELECTRON_DEV_SERVER_URL'];

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

  await window.loadFile(
    join(__dirname, '..', 'dist', 'turnierplaner', 'browser', 'index.html'),
  );
};

app
  .whenReady()
  .then(async () => {
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
