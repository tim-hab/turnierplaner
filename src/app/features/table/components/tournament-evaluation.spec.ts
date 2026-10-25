import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TournamentEvaluation } from './tournament-evaluation';
import { PlayerService } from '@core/services/player.service';
import { Player } from '@core/datatypes/player';

describe('TournamentEvaluation', () => {
  let component: TournamentEvaluation;
  let fixture: ComponentFixture<TournamentEvaluation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TournamentEvaluation],
    }).compileComponents();

    const players: Player[] = [1, 2, 3].map((id) => ({
      id,
      name: `Player ${id}`,
      club: 'Test club',
      elo: 1000,
      wins: id === 1 ? 3 : 0,
      losses: 0,
      frees: 0,
      played: 3,
      points: id === 1 ? 63 : 21 - id,
      active: true,
    }));
    TestBed.inject(PlayerService).loadPlayerData(players, ['Test club']);

    fixture = TestBed.createComponent(TournamentEvaluation);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
