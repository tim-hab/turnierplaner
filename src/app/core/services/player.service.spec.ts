import { TestBed } from '@angular/core/testing';

import { PlayerService } from './player.service';
import { Match } from '../datatypes/match';

const player = (id: number, overrides: Partial<ReturnType<typeof createPlayer>> = {}) => ({
  ...createPlayer(id),
  ...overrides,
});

function createPlayer(id: number) {
  return {
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
  };
}

describe('PlayerService', () => {
  let service: PlayerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlayerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('adds players and clubs and tracks active players', () => {
    service.addNewPlayer('Alice', 'Club A', 600);
    service.addNewPlayer('Bob', 'Club B', 550);
    service.addNewClub('Club A');

    expect(service.player()).toMatchObject([
      expect.objectContaining({ id: 0, name: 'Alice', club: 'Club A', elo: 600 }),
      expect.objectContaining({ id: 1, name: 'Bob', club: 'Club B', elo: 550 }),
    ]);
    expect(service.clubs()).toEqual(['Club A']);
    expect(service.activePlayerCount()).toBe(2);
  });

  it('toggles active state and updates a player name', () => {
    const alice = player(0);
    service.loadPlayerData([alice], []);

    service.toggleActivePlayer(alice);
    service.updatePlayerName('Updated', alice);

    expect(service.player()[0]).toMatchObject({ name: 'Updated', active: false });
    expect(service.activePlayerCount()).toBe(0);
  });

  it('updates free-player counts', () => {
    const players = [player(0), player(1)];
    service.loadPlayerData(players, []);

    service.updatePlayerFrees(players);

    expect(service.player().map((p) => p.frees)).toEqual([1, 1]);
  });

  it('updates match statistics and elo for the winning team', () => {
    const players = [player(0), player(1), player(2), player(3)];
    service.loadPlayerData(players, []);
    const match: Match = {
      id: 1,
      round: 1,
      field: 1,
      teamA: [players[0], players[1]],
      teamB: [players[2], players[3]],
      prob: { A: '50', B: '50' },
      completed: false,
    };

    service.updatePlayerAndCalculateElo(match, 21, 10, 32);

    expect(players[0]).toMatchObject({ wins: 1, played: 1, points: 21 });
    expect(players[2]).toMatchObject({ losses: 1, played: 1, points: 10 });
    expect(players[0].elo).toBeGreaterThan(500);
    expect(players[2].elo).toBeLessThan(500);
  });
});
