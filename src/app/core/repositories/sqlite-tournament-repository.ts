import { Injectable } from '@angular/core';
import { TournamentRepository, TournamentSnapshot } from './tournament-repository';

const STORAGE_KEY = 'turnierplaner-state';

interface TournamentStateResult {
  content?: string;
  error?: string;
}

@Injectable()
export class SqliteTournamentRepository extends TournamentRepository {
  async load(): Promise<TournamentSnapshot | null> {
    const result: TournamentStateResult =
      window.electron?.isAvailable && window.electron.loadTournamentState
        ? await window.electron.loadTournamentState()
        : { content: localStorage.getItem(STORAGE_KEY) ?? undefined };

    if (result.error) {
      throw new Error(result.error);
    }
    if (!result.content) {
      return null;
    }

    try {
      return JSON.parse(result.content) as TournamentSnapshot;
    } catch (error: unknown) {
      console.error('Der gespeicherte Turnierstand ist ungültig.', error);
      throw new Error('Der gespeicherte Turnierstand ist beschädigt.', { cause: error });
    }
  }

  async save(snapshot: TournamentSnapshot): Promise<void> {
    const content = JSON.stringify(snapshot);
    if (window.electron?.isAvailable && window.electron.saveTournamentState) {
      const result = await window.electron.saveTournamentState(content);
      if (result.error) {
        throw new Error(result.error);
      }
      return;
    }
    localStorage.setItem(STORAGE_KEY, content);
  }
}
