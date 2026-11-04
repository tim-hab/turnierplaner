import { contextBridge, ipcRenderer } from 'electron';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import './preload';

describe('Electron preload bridge', () => {
  const exposedApi = vi.mocked(contextBridge.exposeInMainWorld).mock.calls[0]?.[1] as {
    openJsonFile: () => Promise<unknown>;
    saveJsonFile: (content: string) => Promise<unknown>;
    loadTournamentState: () => Promise<unknown>;
    saveTournamentState: (content: string, id?: number) => Promise<unknown>;
    setDirty: (dirty: boolean) => void;
  };

  beforeEach(() => {
    vi.mocked(ipcRenderer.invoke).mockClear();
    vi.mocked(ipcRenderer.send).mockClear();
  });

  it('exposes the bridge with the expected availability flag', () => {
    expect(exposedApi).toHaveProperty('isAvailable', true);
    expect(exposedApi.openJsonFile).toEqual(expect.any(Function));
    expect(exposedApi.saveJsonFile).toEqual(expect.any(Function));
  });

  it('forwards storage calls to their dedicated IPC channels', () => {
    exposedApi.openJsonFile();
    exposedApi.saveJsonFile('{}');
    exposedApi.loadTournamentState();
    exposedApi.saveTournamentState('{}', 4);

    expect(ipcRenderer.invoke).toHaveBeenNthCalledWith(1, 'storage:open-json');
    expect(ipcRenderer.invoke).toHaveBeenNthCalledWith(2, 'storage:save-json', '{}');
    expect(ipcRenderer.invoke).toHaveBeenNthCalledWith(3, 'storage:load-tournament-state');
    expect(ipcRenderer.invoke).toHaveBeenNthCalledWith(
      4,
      'storage:save-tournament-state',
      '{}',
      4,
    );
  });

  it('forwards dirty state without exposing ipcRenderer', () => {
    exposedApi.setDirty(true);

    expect(ipcRenderer.send).toHaveBeenCalledWith('app:set-dirty', true);
    expect(exposedApi).not.toHaveProperty('invoke');
    expect(exposedApi).not.toHaveProperty('send');
  });
});

vi.mock('electron', () => ({
  contextBridge: { exposeInMainWorld: vi.fn() },
  ipcRenderer: {
    invoke: vi.fn(),
    send: vi.fn(),
    on: vi.fn(),
    removeListener: vi.fn(),
  },
}));
