import { Component, effect, input, output, viewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CustomScoreInput, Score } from './score-input/score-input';

@Component({
  selector: 'app-score-form-field',
  imports: [MatFormFieldModule, ReactiveFormsModule, CustomScoreInput],
  templateUrl: './score-form-field.html',
  styleUrl: './score-form-field.css',
})
export class ScoreFormField {
  readonly score = input.required<Score | null>();
  readonly control = input.required<FormControl<Score | null>>();
  readonly readonly = input<boolean>(false);
  readonly inputElement = viewChild.required<CustomScoreInput>('input');
  enter = output<Event>();

  constructor() {
    effect(() => {
      this.control().setValue(this.inputElement()._value());
      this.control().setErrors(this.inputElement().score.errors);
    });

    effect(() => {
      this.inputElement()._value.set(this.score());
    });
  }
}
