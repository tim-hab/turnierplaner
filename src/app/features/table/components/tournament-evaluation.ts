import { Component, inject } from '@angular/core';
import { PlayerService } from '@core/services/player.service';
import { sortByPointsThenWins } from '@core/datatypes/player';

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
