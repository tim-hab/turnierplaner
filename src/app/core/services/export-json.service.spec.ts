import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { PlayerService } from './player.service';
import { TournamentService } from './tournament.service';

import { ExportJsonService } from './export-json.service';

describe('ExportJsonService', () => {
  let service: ExportJsonService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: MatDialog, useValue: { open: vi.fn() } }],
    });
    service = TestBed.inject(ExportJsonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('generates JSON containing player and tournament state', () => {
    TestBed.inject(PlayerService).addNewPlayer('Alice', 'Club', 600);

    const content = JSON.parse(service.generateJsonString());

    expect(content).toMatchObject({
      version: 'v1.0.0',
      player: [expect.objectContaining({ name: 'Alice' })],
      clubs: [],
      matches: [],
      history: [],
      round: 0,
      totalRounds: 5,
      running: true,
    });
  });

  it('imports player data and resets match statistics', () => {
    const input = JSON.stringify({
      player: [
        {
          id: 4,
          name: 'Alice',
          club: 'Club',
          elo: 600,
          wins: 3,
          losses: 2,
          frees: 1,
          played: 5,
          points: 80,
          active: true,
        },
      ],
      clubs: ['Club'],
      totalRounds: 6,
    });

    service.importPlayerData(input);

    expect(TestBed.inject(PlayerService).player()[0]).toMatchObject({
      id: 4,
      wins: 0,
      losses: 0,
      frees: 0,
      played: 0,
      points: 0,
    });
    expect(TestBed.inject(TournamentService).totalRounds()).toBe(6);
  });

  it('imports a valid exported tournament', () => {
    const input = JSON.stringify({
      version: 'v1.0.0',
      player: [],
      clubs: [],
      matches: [],
      history: [],
      round: 2,
      totalRounds: 5,
      running: false,
    });

    service.importJsonString(input);

    expect(TestBed.inject(TournamentService).round()).toBe(2);
    expect(TestBed.inject(TournamentService).running()).toBe(false);
  });

  it('reports invalid JSON through the dialog service', () => {
    const dialog = TestBed.inject(MatDialog);

    service.importJsonString('{invalid');

    expect(dialog.open).toHaveBeenCalled();
  });
});
