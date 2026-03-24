import { Component, effect, inject } from '@angular/core';
import { MatCard, MatCardHeader, MatCardContent, MatCardActions } from '@angular/material/card';
import { MatList, MatListItem } from '@angular/material/list';
import { MatFormField } from '@angular/material/form-field';
import { MatAnchor } from '@angular/material/button';
import { TournamentService } from '../../services/tournament.service';
import { Match } from '../../datatypes/Match';
import { CustomScoreInput, Score } from './score-input/score-input';
import {
  FormArray,
  FormBuilder,
  FormControl,
  ɵInternalFormsSharedModule,
  ReactiveFormsModule,
} from '@angular/forms';

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
    MatAnchor,
    ɵInternalFormsSharedModule,
    ReactiveFormsModule,
    CustomScoreInput,
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

  setWinner(match: Match, input: CustomScoreInput) {
    const score = input.value;
    const values = [Number(score?.teamA), Number(score?.teamB)] as number[];
    if (values[0] < 21 && values[1] < 21)
      alert(
        'Das Spiel ist erst dann zu Ende, wenn ein Team 21 oder mehr Punkte und das andere Team min. 2 Punkte weniger hat.',
      );
    else if (values[0] == values[1]) alert('Punkte müssen unterschiedlich sein');
    else if (
      (values[0] > 21 || values[1] > 21) &&
      (Math.abs(values[0] - values[1]) < 2 || Math.abs(values[0] - values[1]) > 2)
    )
      alert('Wenn eine Punktzahl über 21 ist, muss die andere 2 Punkte niedriger sein');
    else if (values[0] > 19 && values[1] > 19 && (values[0] == 21 || values[1] == 21))
      alert(
        'Wenn das Gewinner Team 21 Punkte hat, darf das Verlierer Team maximal 19 Punkte haben, bzw. muss solange weitergespielt werden, bis der Punktestand um 2 Punkte auseinanderliegt',
      );
    else this.tournamentService.setWinner(match, values[0], values[1]);
  }
}
