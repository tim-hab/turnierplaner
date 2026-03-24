import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { PlayerService } from '../../services/player.service';
import { sortByWinsTheanElo } from '../../datatypes/player';

@Component({
  selector: 'app-live-table',
  imports: [MatTableModule, MatButtonModule],
  templateUrl: './live-table.html',
  styleUrl: './live-table.css',
})
export class LiveTable {
  displayedColumns = ['player', 'club', 'elo', 'wins', 'losses', 'frees', 'played'];
  playerService = inject(PlayerService);
  sortByElo = sortByWinsTheanElo;
  round = Math.round;
}
