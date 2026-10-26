import { Component, effect, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from './layout/sidebar/sidebar';
import { TournamentControl } from './layout/tournament-control/tournament-control';
import { ExportJsonService } from './core/services/export-json.service';
import { JsonTournamentRepository } from './core/repositories/json-tournament-repository';
import { TournamentRepository } from './core/repositories/tournament-repository';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Sidebar, TournamentControl],
  providers: [
    { provide: TournamentRepository, useClass: JsonTournamentRepository },
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly exportService = inject(ExportJsonService);
  private readonly repository = inject(TournamentRepository);
  private readonly loaded = signal(false);

  constructor() {
    void this.restoreState();

    effect(() => {
      if (this.loaded()) {
        void this.repository.save(this.exportService.createSnapshot());
      }
    });
  }

  private async restoreState(): Promise<void> {
    const snapshot = await this.repository.load();
    if (snapshot) {
      this.exportService.importJsonString(JSON.stringify(snapshot));
    }
    this.loaded.set(true);
  }
}
