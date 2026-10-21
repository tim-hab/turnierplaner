import { AfterViewInit, Component, effect, inject, untracked, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { PlayerService } from '@core/services/player.service';
import { sortByPointsThenWins } from '@core/datatypes/player';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { TournamentService } from '@core/services/tournament.service';
import { TournamentEvaluation } from '../tournament-evaluation/tournament-evaluation';

@Component({
  selector: 'app-live-table',
  imports: [MatTableModule, MatButtonModule, MatSortModule, TournamentEvaluation],
  templateUrl: './live-table.html',
  styleUrl: './live-table.css',
})
export class LiveTable implements AfterViewInit {
  displayedColumns = ['player', 'club', 'elo', 'points', 'wins', 'losses', 'frees', 'played'];
  playerService = inject(PlayerService);
  tournamentService = inject(TournamentService);
  round = Math.round;

  dataSource = new MatTableDataSource([...this.playerService.player()].sort(sortByPointsThenWins));

  sort = viewChild(MatSort);

  constructor() {
    effect(() => {
      this.tournamentService.running();
      untracked(() => this.sort.apply(sortByPointsThenWins));
    });
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort(); // Sortierung aktivieren
  }
}
