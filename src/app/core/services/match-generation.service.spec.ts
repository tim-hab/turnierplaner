import { TestBed } from '@angular/core/testing';

import { Algorithm } from '../datatypes/match';
import { MatchGenerationService } from './match-generation.service';

function createPlayers(count: number) {
  return Array.from({ length: count }, (_, id) => ({
    id,
    name: `Player ${id}`,
    club: 'Club',
    elo: 500 + id,
    wins: 0,
    losses: 0,
    frees: 0,
    played: 0,
    points: 0,
    active: true,
  }));
}

describe('MatchGenerationService', () => {
  let service: MatchGenerationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MatchGenerationService);
  });

  it.each([[Algorithm.firstWithLast], [Algorithm.heterogen], [Algorithm.homogen]])(
    'generates a match for algorithm %s',
    (algorithm) => {
      const result = service.generate(createPlayers(6), 1, 2, 10, 0, algorithm);

      expect(result.matches).toHaveLength(1);
      expect(result.matches[0]).toMatchObject({ id: 10, round: 2, field: 1 });
      expect(result.matches[0].teamA).toHaveLength(2);
      expect(result.matches[0].teamB).toHaveLength(2);
      expect(result.freePlayers).toHaveLength(2);
      expect(result.nextId).toBe(11);
      expect(result.fields).toBe(1);
    },
  );

  it('ignores inactive players and limits the number of fields', () => {
    const players = createPlayers(10);
    players[0].active = false;
    players[1].active = false;

    const result = service.generate(players, 4, 1, 0, 0, Algorithm.firstWithLast);

    expect(result.matches).toHaveLength(2);
    expect(result.fields).toBe(2);
    expect(result.matches.flatMap((match) => [...match.teamA, ...match.teamB])).not.toContain(
      players[0],
    );
    expect(result.matches.map((match) => match.field).sort()).toEqual([1, 2]);
  });
});
