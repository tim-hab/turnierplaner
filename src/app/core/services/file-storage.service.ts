import { Injectable } from '@angular/core';

export interface FileReadResult {
  canceled: boolean;
  content?: string;
  error?: string;
}

export interface FileWriteResult {
  canceled: boolean;
  error?: string;
}

@Injectable({
  providedIn: 'root',
})
export class FileStorageService {
  openJsonFile(): Promise<FileReadResult> {
    if (!window.electron?.isAvailable) {
      return Promise.resolve({
        canceled: false,
        error: 'Dateiimport ist nur in der Desktop-App verfügbar.',
      });
    }

    return window.electron.openJsonFile();
  }

  saveJsonFile(content: string): Promise<FileWriteResult> {
    if (!window.electron?.isAvailable) {
      return Promise.resolve({
        canceled: false,
        error: 'Dateiexport ist nur in der Desktop-App verfügbar.',
      });
    }

    return window.electron.saveJsonFile(content);
  }
}
