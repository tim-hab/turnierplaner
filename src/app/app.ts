import { Component, effect, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from './layout/sidebar/sidebar';
import { TournamentControl } from './layout/tournament-control/tournament-control';
import { ExportJsonService } from './core/services/export-json.service';
import { DialogService } from './core/services/dialog.service';
import { SqliteTournamentRepository } from './core/repositories/sqlite-tournament-repository';
import { TournamentRepository } from './core/repositories/tournament-repository';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Sidebar, TournamentControl],
  providers: [
    { provide: TournamentRepository, useClass: SqliteTournamentRepository },
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly exportService = inject(ExportJsonService);
  private readonly dialogService = inject(DialogService);
  private readonly repository = inject(TournamentRepository);
  private readonly loaded = signal(false);

  constructor() {
    void this.restoreState();

    effect(() => {
      if (this.loaded()) {
        void this.saveState();
      }
    });
  }

  private async saveState(): Promise<void> {
    try {
      await this.repository.save(this.exportService.createSnapshot());
    } catch (error: unknown) {
      console.error('Der Turnierstand konnte nicht gespeichert werden.', error);
      this.dialogService.openMessageDialog(
        'Der Turnierstand konnte nicht gespeichert werden. Bitte nutze den JSON-Export als Backup.',
      );
    }
  }

  private async restoreState(): Promise<void> {
    try {
      const snapshot = await this.repository.load();
      if (snapshot) {
        this.exportService.importJsonString(JSON.stringify(snapshot));
      }
      this.loaded.set(true);
    } catch (error: unknown) {
      console.error('Der Turnierstand konnte nicht wiederhergestellt werden.', error);
      this.dialogService.openMessageDialog(
        'Der Turnierstand konnte nicht wiederhergestellt werden. Bitte nutze den JSON-Import als Backup.',
      );
    }
  }
}
