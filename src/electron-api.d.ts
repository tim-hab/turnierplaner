interface JsonOpenResult {
  canceled: boolean;
  content?: string;
  error?: string;
}

interface JsonSaveResult {
  canceled: boolean;
  error?: string;
}

interface ElectronApi {
  isAvailable: boolean;
  openJsonFile: () => Promise<JsonOpenResult>;
  saveJsonFile: (content: string) => Promise<JsonSaveResult>;
}

declare global {
  interface Window {
    electron?: ElectronApi;
  }
}

export {};
