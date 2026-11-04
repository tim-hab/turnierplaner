import { TestBed } from '@angular/core/testing';

import { TournamentService } from './tournament.service';
import { MatDialog } from '@angular/material/dialog';
import { PlayerService } from './player.service';
import { Match } from '../datatypes/match';

describe('TournamentService', () => {
  let service: TournamentService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: MatDialog, useValue: { open: vi.fn() } }],
    });
    service = TestBed.inject(TournamentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('refuses to start with fewer than four players', () => {
    const dialog = TestBed.inject(MatDialog);

    service.startTournament(5, 1);

    expect(service.round()).toBe(0);
    expect(dialog.open).toHaveBeenCalled();
  });

  it('starts a tournament and generates matches', () => {
    const playerService = TestBed.inject(PlayerService);
    playerService.addNewPlayer('A', 'Club', 500);
    playerService.addNewPlayer('B', 'Club', 500);
    playerService.addNewPlayer('C', 'Club', 500);
    playerService.addNewPlayer('D', 'Club', 500);

    service.startTournament(5, 1, 0, 1);

    expect(service.round()).toBe(1);
    expect(service.matches()).toHaveLength(1);
    expect(service.matches()[0].round).toBe(1);
  });

  it('records winners, history, and probability visibility', () => {
    const players = Array.from({ length: 4 }, (_, id) => ({
      id,
      name: `Player ${id}`,
      club: 'Club',
      elo: 500,
      wins: 0,
      losses: 0,
      frees: 0,
      played: 0,
      points: 0,
      active: true,
    }));
    TestBed.inject(PlayerService).loadPlayerData(players, []);
    service.startTournament(5, 1, 0, 1);
    const match = service.matches()[0];

    service.setWinner(match, 21, 10);
    service.toggleProb();

    expect(match).toMatchObject({ completed: true, score: { A: 21, B: 10 } });
    expect(service.history()).toEqual([match]);
    expect(service.showProb()).toBe(true);
  });

  it('loads tournament data and ends the tournament', () => {
    const playerService = TestBed.inject(PlayerService);
    const player = {
      id: 0,
      name: 'Player',
      club: 'Club',
      elo: 500,
      wins: 1,
      losses: 0,
      frees: 2,
      played: 1,
      points: 21,
      active: true,
    };
    const match = {
      id: 1,
      round: 1,
      field: 1,
      teamA: [player, player],
      teamB: [player, player],
      prob: { A: '50', B: '50' },
      completed: true,
    } as Match;
    playerService.loadPlayerData([player], []);

    service.loadTournamentData([match], [match], 2, 4, true);
    service.endTournament();

    expect(service.matches()).toEqual([match]);
    expect(service.history()).toEqual([match]);
    expect(service.round()).toBe(2);
    expect(service.totalRounds()).toBe(4);
    expect(service.running()).toBe(false);
    expect(player.points).toBe(63);
  });

  it('keeps points finite for players without played matches', () => {
    const players = [
      {
        id: 0,
        name: 'Player',
        club: 'Club',
        elo: 500,
        wins: 0,
        losses: 0,
        frees: 1,
        played: 0,
        points: 0,
        active: true,
      },
    ];
    TestBed.inject(PlayerService).loadPlayerData(players, []);

    service.endTournament();

    expect(players[0].points).toBe(0);
    expect(Number.isFinite(players[0].points)).toBe(true);
  });

  it('ends an empty current round using the previous round matches', () => {
    const playerService = TestBed.inject(PlayerService);
    const previousMatch = {
      id: 1,
      round: 1,
      field: 1,
      teamA: [],
      teamB: [],
      prob: { A: '50', B: '50' },
      completed: true,
    } as unknown as Match;
    const currentMatch = { ...previousMatch, id: 2, round: 2, completed: false };

    playerService.loadPlayerData([], []);
    service.loadTournamentData([currentMatch], [previousMatch], 2, 5, true);

    expect(service.endTournament()).toBe(true);
    expect(service.round()).toBe(1);
    expect(service.matches()).toEqual([previousMatch]);
    expect(service.history()).toEqual([previousMatch]);
  });

  it('refuses to end when only some current round matches are completed', () => {
    const dialog = TestBed.inject(MatDialog);
    const previousMatch = {
      id: 1,
      round: 1,
      field: 1,
      teamA: [],
      teamB: [],
      prob: { A: '50', B: '50' },
      completed: true,
    } as unknown as Match;
    const completedMatch = { ...previousMatch, id: 2, round: 2 };
    const incompleteMatch = { ...previousMatch, id: 3, round: 2, completed: false };

    service.loadTournamentData([completedMatch, incompleteMatch], [previousMatch], 2, 5, true);

    expect(service.endTournament()).toBe(false);
    expect(service.running()).toBe(true);
    expect(dialog.open).toHaveBeenCalled();
  });
});
