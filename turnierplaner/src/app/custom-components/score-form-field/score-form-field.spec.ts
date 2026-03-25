import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoreFormField } from './score-form-field';

describe('ScoreFormField', () => {
  let component: ScoreFormField;
  let fixture: ComponentFixture<ScoreFormField>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScoreFormField],
    }).compileComponents();

    fixture = TestBed.createComponent(ScoreFormField);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
