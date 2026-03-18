import { Component, inject } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatAnchor } from '@angular/material/button';
import { TournamentService } from '../../services/tournament.service';
import { Player } from '../../datatypes/player';
import { Match } from '../../datatypes/Match';

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
  tournamentService = inject(TournamentService);
  displayedColumns = ['round', 'field', 'teamA', 'teamB', 'score', 'action'];
  dataSource = TEST_DATA;

  changeScore(match: Match) {
    const score = prompt('Neuen Score eingeben:');
    if (score) {
      if (/^\d+:\d+$/.test(score)) {
        const values = score.split(':').map((value) => Number(value));
        if (values[0] <= 21 && values[1] <= 21) {
          this.tournamentService.changeScore(match, { A: values[0], B: values[1] });
        }
      } else {
        alert('Bitte Score korrekt eingeben, z.B. 21:15');
      }
    }
  }

  concatPlayerToString(list: Player[]) {
    return list[0].name + ', ' + list[1].name;
  }

  scoreObjectToString(score: { A: number; B: number }) {
    return score.A + ':' + score.B;
  }
}
