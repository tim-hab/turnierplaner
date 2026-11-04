import { Component, effect, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from './layout/sidebar/sidebar';
import { TournamentControl } from './layout/tournament-control/tournament-control';
import { ExportJsonService } from './core/services/export-json.service';
import { DialogService } from './core/services/dialog.service';
import { TournamentRepository } from './core/repositories/tournament-repository';
import { PlayerService } from './core/services/player.service';
import { TournamentService } from './core/services/tournament.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Sidebar, TournamentControl],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly exportService = inject(ExportJsonService);
  private readonly dialogService = inject(DialogService);
  private readonly repository = inject(TournamentRepository);
  private readonly playerService = inject(PlayerService);
  private readonly tournamentService = inject(TournamentService);
  private readonly loaded = signal(false);

  constructor() {
    window.electron?.onMenuAction?.((action) => this.handleMenuAction(action));
    window.electron?.onRequestClose?.(() => {
      void this.saveState().then((saved) => {
        window.electron?.respondToClose?.(saved ? 'discard' : 'cancel');
      });
    });
    void this.restoreState();

    effect(() => {
      if (this.loaded()) {
        window.electron?.setDirty?.(true);
        void this.saveState();
      }
    });
  }

  private async saveState(): Promise<boolean> {
    try {
      await this.repository.save(this.exportService.createSnapshot());
      window.electron?.setDirty?.(false);
      return true;
    } catch (error: unknown) {
      console.error('Der Turnierstand konnte nicht gespeichert werden.', error);
      this.dialogService.openMessageDialog(
        'Der Turnierstand konnte nicht gespeichert werden. Bitte nutze den JSON-Export als Backup.',
      );
      return false;
    }
  }

  private handleMenuAction(action: string): void {
    switch (action) {
      case 'new':
        this.dialogService
          .openMessageDialog('Sollen die Spielerdaten übernommen werden?', 'Spieler übernehmen')
          .afterClosed()
          .subscribe((keepPlayers: boolean) => {
            if (keepPlayers) {
              this.exportService.importPlayerData(this.exportService.generateJsonString());
            } else {
              this.playerService.reset();
              this.tournamentService.reset();
            }
            void this.exportService.saveAsNewTournament().catch((error: unknown) => {
              console.error('Das neue Turnier konnte nicht gespeichert werden.', error);
            });
          });
        break;
      case 'load':
        void this.exportService.loadTournamentFromDatabase();
        break;
      case 'import':
        void this.exportService.importJsonFromFile();
        break;
      case 'export':
        void this.exportService.exportJsonToFile();
        break;
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
