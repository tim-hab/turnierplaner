import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  isAvailable: true,
  openJsonFile: () => ipcRenderer.invoke('storage:open-json'),
  saveJsonFile: (content: string) => ipcRenderer.invoke('storage:save-json', content),
  loadTournamentState: () => ipcRenderer.invoke('storage:load-tournament-state'),
  listTournaments: () => ipcRenderer.invoke('storage:list-tournaments'),
  loadTournament: (id: number) => ipcRenderer.invoke('storage:load-tournament', id),
  saveTournamentState: (content: string, tournamentId?: number) =>
    ipcRenderer.invoke('storage:save-tournament-state', content, tournamentId),
  saveNewTournament: (content: string) =>
    ipcRenderer.invoke('storage:save-new-tournament', content),
  onMenuAction: (listener: (action: string) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, action: string) => listener(action);
    ipcRenderer.on('menu:action', handler);
    return () => ipcRenderer.removeListener('menu:action', handler);
  },
  onRequestClose: (listener: () => void) => {
    const handler = () => listener();
    ipcRenderer.on('app:request-close', handler);
    return () => ipcRenderer.removeListener('app:request-close', handler);
  },
  setDirty: (dirty: boolean) => ipcRenderer.send('app:set-dirty', dirty),
  respondToClose: (response: 'save' | 'discard' | 'cancel') =>
    ipcRenderer.send('app:close-response', response),
});
