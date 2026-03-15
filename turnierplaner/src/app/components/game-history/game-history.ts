import { Component } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatAnchor } from "@angular/material/button";

export interface Game {
  round: number;
  field: number;
  teamA: string;
  teamB: string;
  score: string;
}

const TEST_DATA: Game[] = [
  { round: 1, field: 1, teamA: 'Tim, Tessa', teamB: 'Jan, Armin', score: '5:21' },
  { round: 2, field: 1, teamA: 'Tim, Tessa', teamB: 'Jan, Armin', score: '5:21' },
  { round: 3, field: 1, teamA: 'Tim, Tessa', teamB: 'Jan, Armin', score: '5:21' },
  { round: 4, field: 1, teamA: 'Tim, Tessa', teamB: 'Jan, Armin', score: '5:21' },
];

@Component({
  selector: 'app-game-history',
  imports: [MatTableModule, MatAnchor],
  templateUrl: './game-history.html',
  styleUrl: './game-history.css',
})
export class GameHistory {
  displayedColumns = ['round', 'field', 'teamA', 'teamB', 'score', 'action'];
  dataSource = TEST_DATA;

  test(elem: Game) {
    alert(elem.score)
  }
}
