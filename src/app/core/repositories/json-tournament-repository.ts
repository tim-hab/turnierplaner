import { Injectable } from '@angular/core';
import {
  TournamentRepository,
  TournamentSnapshot,
  TournamentSummary,
} from './tournament-repository';

const STORAGE_KEY = 'turnierplaner-state';

@Injectable()
export class JsonTournamentRepository extends TournamentRepository {
  async load(): Promise<TournamentSnapshot | null> {
    const result: { content?: string | null; error?: string } =
      window.electron?.isAvailable && window.electron.loadTournamentState
        ? await window.electron.loadTournamentState()
        : { content: localStorage.getItem(STORAGE_KEY) };

    if (result.error) {
      console.error(result.error);
      return null;
    }
    if (!result.content) {
      return null;
    }

    try {
      return JSON.parse(result.content) as TournamentSnapshot;
    } catch (error: unknown) {
      console.error('Der gespeicherte Turnierstand ist ungültig.', error);
      return null;
    }
  }

  async list(): Promise<TournamentSummary[]> {
    const snapshot = await this.load();
    return snapshot
      ? [{ id: 1, updatedAt: '', round: snapshot.round, running: snapshot.running }]
      : [];
  }

  async loadById(id: number): Promise<TournamentSnapshot | null> {
    return id === 1 ? this.load() : null;
  }

  async save(snapshot: TournamentSnapshot): Promise<void> {
    const content = JSON.stringify(snapshot);
    if (window.electron?.isAvailable && window.electron.saveTournamentState) {
      const result = await window.electron.saveTournamentState(content);
      if (result.error) {
        console.error(result.error);
      }
      return;
    }
    localStorage.setItem(STORAGE_KEY, content);
  }

  async saveAsNew(snapshot: TournamentSnapshot): Promise<void> {
    return this.save(snapshot);
  }
}
