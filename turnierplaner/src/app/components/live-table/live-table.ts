import { AfterViewInit, Component, inject, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { PlayerService } from '../../services/player.service';
import { sortByPointsThenWins } from '../../datatypes/player';
import { MatSort, MatSortModule } from '@angular/material/sort';

@Component({
  selector: 'app-live-table',
  imports: [MatTableModule, MatButtonModule, MatSortModule],
  templateUrl: './live-table.html',
  styleUrl: './live-table.css',
})
export class LiveTable implements AfterViewInit {
  displayedColumns = ['player', 'club', 'elo', 'points', 'wins', 'losses', 'frees', 'played'];
  playerService = inject(PlayerService);
  round = Math.round;

  dataSource = new MatTableDataSource([...this.playerService.player()].sort(sortByPointsThenWins));

  sort = viewChild(MatSort);

  ngAfterViewInit() {
    this.dataSource.sort = this.sort(); // Sortierung aktivieren
  }
}
