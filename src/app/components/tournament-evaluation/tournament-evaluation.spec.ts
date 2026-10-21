import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TournamentEvaluation } from './tournament-evaluation';

describe('TournamentEvaluation', () => {
  let component: TournamentEvaluation;
  let fixture: ComponentFixture<TournamentEvaluation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TournamentEvaluation],
    }).compileComponents();

    fixture = TestBed.createComponent(TournamentEvaluation);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
