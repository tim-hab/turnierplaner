import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  isAvailable: true,
  openJsonFile: () => ipcRenderer.invoke('storage:open-json'),
  saveJsonFile: (content: string) => ipcRenderer.invoke('storage:save-json', content),
});
