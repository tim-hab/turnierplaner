interface JsonOpenResult {
  canceled: boolean;
  content?: string;
  error?: string;
}

interface JsonSaveResult {
  canceled: boolean;
  error?: string;
}

interface TournamentStateResult {
  content?: string;
  error?: string;
}

interface TournamentSummary {
  id: number;
  updatedAt: string;
  round: number;
  running: boolean;
}

interface TournamentListResult {
  tournaments?: TournamentSummary[];
  error?: string;
}

interface ElectronApi {
  isAvailable: boolean;
  openJsonFile: () => Promise<JsonOpenResult>;
  saveJsonFile: (content: string) => Promise<JsonSaveResult>;
  loadTournamentState?: () => Promise<TournamentStateResult>;
  listTournaments?: () => Promise<TournamentListResult>;
  loadTournament?: (id: number) => Promise<TournamentStateResult>;
  saveTournamentState?: (content: string, tournamentId?: number) => Promise<JsonSaveResult>;
  saveNewTournament?: (content: string) => Promise<JsonSaveResult>;
  onMenuAction?: (listener: (action: string) => void) => () => void;
  onRequestClose?: (listener: () => void) => () => void;
  setDirty?: (dirty: boolean) => void;
  respondToClose?: (response: 'save' | 'discard' | 'cancel') => void;
}

declare global {
  interface Window {
    electron?: ElectronApi;
  }
}

export {};
