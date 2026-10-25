import { Component, inject } from '@angular/core';
import { FieldView } from '../../components/field-view/field-view';
import { GameHistory } from '../../components/game-history/game-history';
import { TournamentService } from '@core/services/tournament.service';

@Component({
  selector: 'app-fields-page',
  imports: [FieldView, GameHistory],
  template: `
    <div class="app-control-wrapper">
      @if (tournamentService.round() === 0) {
        <p class="info">Noch nichts zu sehen. Bitte starte ein Turnier.</p>
      } @else {
        <app-field-view />
        <app-game-history />
      }
    </div>
  `,
})
export class FieldsPage {
  protected readonly tournamentService = inject(TournamentService);
}
