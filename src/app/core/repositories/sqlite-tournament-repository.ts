import { Injectable } from '@angular/core';
import {
  TournamentRepository,
  TournamentSnapshot,
  TournamentSummary,
} from './tournament-repository';

const STORAGE_KEY = 'turnierplaner-state';

interface TournamentStateResult {
  content?: string;
  error?: string;
}

@Injectable()
export class SqliteTournamentRepository extends TournamentRepository {
  private activeTournamentId: number | undefined;

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
      const snapshot = JSON.parse(result.content) as TournamentSnapshot;
      this.activeTournamentId = undefined;
      return snapshot;
    } catch (error: unknown) {
      console.error('Der gespeicherte Turnierstand ist ungültig.', error);
      throw new Error('Der gespeicherte Turnierstand ist beschädigt.', { cause: error });
    }
  }

  async list(): Promise<TournamentSummary[]> {
    if (!(window.electron?.isAvailable && window.electron.listTournaments)) {
      const snapshot = await this.load();
      return snapshot
        ? [{ id: 1, updatedAt: '', round: snapshot.round, running: snapshot.running }]
        : [];
    }

    const result = await window.electron.listTournaments();
    if (result.error) {
      throw new Error(result.error);
    }
    return result.tournaments ?? [];
  }

  async loadById(id: number): Promise<TournamentSnapshot | null> {
    if (window.electron?.isAvailable && window.electron.loadTournament) {
      const result = await window.electron.loadTournament(id);
      if (result.error) {
        throw new Error(result.error);
      }
      if (!result.content) {
        return null;
      }
      try {
        const snapshot = JSON.parse(result.content) as TournamentSnapshot;
        this.activeTournamentId = id;
        return snapshot;
      } catch (error: unknown) {
        throw new Error('Das ausgewählte Turnier ist beschädigt.', { cause: error });
      }
    }

    if (id !== 1) {
      return null;
    }
    this.activeTournamentId = id;
    return this.load();
  }

  async save(snapshot: TournamentSnapshot): Promise<void> {
    const content = JSON.stringify(snapshot);
    if (window.electron?.isAvailable && window.electron.saveTournamentState) {
      const result = await window.electron.saveTournamentState(content, this.activeTournamentId);
      if (result.error) {
        throw new Error(result.error);
      }
      return;
    }
    localStorage.setItem(STORAGE_KEY, content);
  }

  async saveAsNew(snapshot: TournamentSnapshot): Promise<void> {
    const content = JSON.stringify(snapshot);
    if (window.electron?.isAvailable && window.electron.saveNewTournament) {
      const result = await window.electron.saveNewTournament(content);
      if (result.error) {
        throw new Error(result.error);
      }
      this.activeTournamentId = undefined;
      return;
    }
    localStorage.setItem(STORAGE_KEY, content);
  }
}
