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
    if (window.electron?.isAvailable) {
      return window.electron.openJsonFile();
    }

    if (typeof navigator !== 'undefined' && navigator.userAgent.includes('jsdom')) {
      return Promise.resolve({ canceled: true });
    }

    if (typeof document === 'undefined' || typeof FileReader === 'undefined') {
      return Promise.resolve({ canceled: true });
    }

    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/json,.json';
      input.style.display = 'none';

      const cleanup = () => {
        input.remove();
      };

      input.addEventListener('change', () => {
        const file = input.files?.[0];
        if (!file) {
          cleanup();
          resolve({ canceled: true });
          return;
        }

        const reader = new FileReader();
        reader.onload = () => {
          cleanup();
          resolve({
            canceled: false,
            content: typeof reader.result === 'string' ? reader.result : undefined,
          });
        };
        reader.onerror = () => {
          cleanup();
          resolve({
            canceled: false,
            error: 'Die JSON-Datei konnte nicht gelesen werden.',
          });
        };
        reader.readAsText(file);
      });
      input.addEventListener('cancel', () => {
        cleanup();
        resolve({ canceled: true });
      });

      document.body.appendChild(input);
      input.click();
    });
  }

  saveJsonFile(content: string): Promise<FileWriteResult> {
    if (window.electron?.isAvailable) {
      return window.electron.saveJsonFile(content);
    }

    if (typeof navigator !== 'undefined' && navigator.userAgent.includes('jsdom')) {
      return Promise.resolve({
        canceled: false,
        error: 'Dateiexport wird in dieser Testumgebung nicht unterstützt.',
      });
    }

    if (
      typeof document === 'undefined' ||
      typeof Blob === 'undefined' ||
      typeof URL === 'undefined' ||
      typeof URL.createObjectURL !== 'function'
    ) {
      return Promise.resolve({
        canceled: false,
        error: 'Dateiexport wird von diesem Browser nicht unterstützt.',
      });
    }

    try {
      const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'turnier.json';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      link.remove();
      globalThis.setTimeout(() => URL.revokeObjectURL(url), 0);
      return Promise.resolve({ canceled: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Datei konnte nicht exportiert werden.';
      return Promise.resolve({ canceled: false, error: message });
    }
  }
}
