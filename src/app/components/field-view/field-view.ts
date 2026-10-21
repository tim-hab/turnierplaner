import { Component, effect, inject } from '@angular/core';
import { MatCard, MatCardHeader, MatCardContent, MatCardActions } from '@angular/material/card';
import { MatList, MatListItem } from '@angular/material/list';
import { MatAnchor } from '@angular/material/button';
import { TournamentService } from '@core/services/tournament.service';
import { Match } from '@core/datatypes/Match';
import { Score } from '@shared/score-form-field/score-input/score-input';
import {
  FormArray,
  FormBuilder,
  FormControl,
  ɵInternalFormsSharedModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { ScoreFormField } from '@shared/score-form-field/score-form-field';

@Component({
  selector: 'app-field-view',
  imports: [
    MatCard,
    MatCardHeader,
    MatCardContent,
    MatList,
    MatListItem,
    MatCardActions,
    MatAnchor,
    ɵInternalFormsSharedModule,
    ReactiveFormsModule,
    ScoreFormField,
  ],
  templateUrl: './field-view.html',
  styleUrl: './field-view.css',
})
export class FieldView {
  tournamentService = inject(TournamentService);
  round = Math.round;

  matches: FormArray<FormControl<Score | null>>;

  constructor() {
    this.matches = inject(FormBuilder).array([] as FormControl<Score | null>[]);
    effect(() => {
      this.matches.clear();
      this.tournamentService.matches().forEach((m) => {
        this.matches.push(
          new FormControl<Score | null>(
            m.score
              ? ({ teamA: m.score.A.toString(), teamB: m.score.B.toString() } as Score)
              : null,
          ),
        );
      });
    });
  }

  setWinner(match: Match, index: number, event?: Event) {
    if (event) event.preventDefault();
    const control = this.matches.controls[index];
    if (control.valid) {
      const score = control.value;
      const values = [Number(score?.teamA), Number(score?.teamB)] as number[];
      this.tournamentService.setWinner(match, values[0], values[1]);
    }
  }
}
