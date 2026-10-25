import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from './layout/sidebar/sidebar';
import { TournamentControl } from './layout/tournament-control/tournament-control';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Sidebar, TournamentControl],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
}
