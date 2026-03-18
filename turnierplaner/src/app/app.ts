import { Component, linkedSignal, signal } from '@angular/core';
import { Control } from './components/control/control';
import { Sidebar } from './components/sidebar/sidebar';
import { Route } from './app.routes';
import { TournamentControl } from './components/tournement-control/tournament-control';

@Component({
  selector: 'app-root',
  imports: [Control, Sidebar, TournamentControl],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('turnierplaner');
  activeRoute = linkedSignal(() => Route.Settings);
}
