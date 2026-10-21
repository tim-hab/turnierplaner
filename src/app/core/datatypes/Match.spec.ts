import { mapMatchExportToMatch, MatchExport } from './Match';
import { Player } from './player';

describe('mapMatchExportToMatch', () => {
  it('maps player IDs to the matching player objects without changing IDs', () => {
    const players: Player[] = [
      {
        id: 1,
        name: 'Alice',
        club: 'Club A',
        elo: 500,
        wins: 0,
        losses: 0,
        frees: 0,
        played: 0,
        points: 0,
        active: true,
      },
      {
        id: 2,
        name: 'Bob',
        club: 'Club B',
        elo: 500,
        wins: 0,
        losses: 0,
        frees: 0,
        played: 0,
        points: 0,
        active: true,
      },
      {
        id: 3,
        name: 'Cara',
        club: 'Club C',
        elo: 500,
        wins: 0,
        losses: 0,
        frees: 0,
        played: 0,
        points: 0,
        active: true,
      },
      {
        id: 4,
        name: 'Dan',
        club: 'Club D',
        elo: 500,
        wins: 0,
        losses: 0,
        frees: 0,
        played: 0,
        points: 0,
        active: true,
      },
    ];
    const exportedMatch: MatchExport = {
      id: 10,
      round: 1,
      field: 1,
      teamA: [3, 1],
      teamB: [4, 2],
      prob: { A: '50', B: '50' },
      completed: false,
    };

    const match = mapMatchExportToMatch(exportedMatch, players);

    expect(match?.teamA.map((player) => player.id)).toEqual([3, 1]);
    expect(match?.teamB.map((player) => player.id)).toEqual([4, 2]);
    expect(players.map((player) => player.id)).toEqual([1, 2, 3, 4]);
  });

  it('returns undefined when an exported player does not exist', () => {
    const players: Player[] = [
      {
        id: 1,
        name: 'Alice',
        club: 'Club A',
        elo: 500,
        wins: 0,
        losses: 0,
        frees: 0,
        played: 0,
        points: 0,
        active: true,
      },
    ];
    const exportedMatch: MatchExport = {
      id: 10,
      round: 1,
      field: 1,
      teamA: [1, 2],
      teamB: [1, 2],
      prob: { A: '50', B: '50' },
      completed: false,
    };

    expect(mapMatchExportToMatch(exportedMatch, players)).toBeUndefined();
  });
});
