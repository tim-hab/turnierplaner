import { Component, effect, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from './layout/sidebar/sidebar';
import { TournamentControl } from './layout/tournament-control/tournament-control';
import { ExportJsonService } from './core/services/export-json.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Sidebar, TournamentControl],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly exportService = inject(ExportJsonService);
  private readonly storageKey = 'turnierplaner-state';

  constructor() {
    const savedState = localStorage.getItem(this.storageKey);
    if (savedState) {
      this.exportService.importJsonString(savedState);
    }

    effect(() => {
      localStorage.setItem(this.storageKey, this.exportService.generateJsonString());
    });
  }
}
