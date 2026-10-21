import { Component, inject, linkedSignal, signal } from '@angular/core';
import { Control } from './components/control/control';
import { Sidebar } from './components/sidebar/sidebar';
import { TournamentControl } from './components/tournament-control/tournament-control';
import { RoutingService } from './core/services/routing.service';

@Component({
  selector: 'app-root',
  imports: [Control, Sidebar, TournamentControl],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly routingService = inject(RoutingService);
  protected readonly title = signal('turnierplaner');
  activeRoute = linkedSignal(() => this.routingService.activeRoute());
}
