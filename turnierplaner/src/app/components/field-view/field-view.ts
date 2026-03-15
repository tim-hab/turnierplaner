import { Component, inject } from '@angular/core';
import { MatCard, MatCardHeader, MatCardContent, MatCardActions } from '@angular/material/card';
import { MatList, MatListItem } from '@angular/material/list';
import { MatFormField, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatAnchor } from '@angular/material/button';
import { Match, TournamentService } from '../../services/tournament.service';
import { MatCheckbox } from '@angular/material/checkbox';

@Component({
  selector: 'app-field-view',
  imports: [
    MatCard,
    MatCardHeader,
    MatCardContent,
    MatList,
    MatListItem,
    MatCardActions,
    MatFormField,
    MatInput,
    MatAnchor,
  ],
  templateUrl: './field-view.html',
  styleUrl: './field-view.css',
})
export class FieldView {
  tournamentService = inject(TournamentService);

  setWinner(match: Match, input: HTMLInputElement) {
    const score = input.value;
    console.log(score);
    if (/^\d+:\d+$/.test(score)) {
      const values = score.split(':').map((value) => Number(value));
      if (values[0] <= 21 && values[1] <= 21) {
        this.tournamentService.setWinner(match, values[0], values[1]);
      }
    } else {
      alert('Bitte Score korrekt eingeben, z.B. 21:15');
    }
  }
}
