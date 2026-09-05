import { Component, inject } from '@angular/core';
import { PlayerService } from '../../services/player.service';
import { sortByPointsThenWins } from '../../datatypes/player';

@Component({
  selector: 'app-tournament-evaluation',
  imports: [],
  templateUrl: './tournament-evaluation.html',
  styleUrl: './tournament-evaluation.css',
})
export class TournamentEvaluation {
  private readonly playerService = inject(PlayerService);

  protected readonly winners = this.playerService.player().sort(sortByPointsThenWins).slice(0, 3);
}
