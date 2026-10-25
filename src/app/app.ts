import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from './components/sidebar/sidebar';
import { TournamentControl } from './components/tournament-control/tournament-control';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Sidebar, TournamentControl],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
}
