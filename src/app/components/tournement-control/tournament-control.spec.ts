import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TournamentControl } from './tournament-control';

describe('TournementControl', () => {
  let component: TournamentControl;
  let fixture: ComponentFixture<TournamentControl>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TournamentControl],
    }).compileComponents();

    fixture = TestBed.createComponent(TournamentControl);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
