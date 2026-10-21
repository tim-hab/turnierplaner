import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomScoreInput } from './score-input';

describe('ScoreInput', () => {
  let component: CustomScoreInput;
  let fixture: ComponentFixture<CustomScoreInput>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomScoreInput],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomScoreInput);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
