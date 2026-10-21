import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { Score } from './score-input/score-input';

import { ScoreFormField } from './score-form-field';

describe('ScoreFormField', () => {
  let component: ScoreFormField;
  let fixture: ComponentFixture<ScoreFormField>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScoreFormField],
    }).compileComponents();

    fixture = TestBed.createComponent(ScoreFormField);
    fixture.componentRef.setInput('score', null);
    fixture.componentRef.setInput('control', new FormControl<Score | null>(null));
    fixture.componentRef.setInput('readonly', false);
    fixture.detectChanges();
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
