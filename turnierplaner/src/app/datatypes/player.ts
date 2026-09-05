export interface Player {
  id: number;
  name: string;
  club: string;
  elo: number;
  wins: number;
  losses: number;
  frees: number;
  played: number;
  points: number;
  active: boolean;
}

export function sortByName(a: Player, b: Player) {
  if (a.name < b.name) {
    return -1;
  } else if (a.name == b.name) {
    return 0;
  } else {
    return 1;
  }
}

export function sortByFrees(a: Player, b: Player) {
  const first = b.frees - a.frees;
  return first;
}

export function sortByPlayedThenFrees(a: Player, b: Player) {
  const first = a.played - b.played;
  if (first) return first;
  else return sortByFrees(a, b);
}

export function sortByElo(a: { elo: number }, b: { elo: number }) {
  return b.elo - a.elo;
}

export function sortByEloWithMod(player: Player[], eleMod = 50): Player[] {
  const idsAndElo = player.map((p) => {
    return { id: p.id, elo: p.elo + Math.random() * eleMod };
  });
  idsAndElo.sort(sortByElo);
  return idsAndElo.map<Player>((ie) => player.find((p) => p.id === ie.id)!);
}

export function sortByPointsThenWins(a: Player, b: Player) {
  const first = b.points - a.points;
  if (first) return first;
  else return b.wins - a.wins;
}

export function sortByWinsThenElo(a: Player, b: Player) {
  const first = b.wins - a.wins;
  if (first) return first;
  else return b.elo - a.elo;
}

export const devPlayers = {
  player: [
    {
      id: 0,
      name: 'Armin',
      club: 'SuS',
      elo: 535.9416308912531,
      wins: 0,
      losses: 0,
      frees: 0,
      played: 0,
      points: 0,
      active: true,
    },
    {
      id: 1,
      name: 'Tim',
      club: 'SuS',
      elo: 588.7568223737906,
      wins: 1,
      losses: 1,
      frees: 1,
      played: 2,
      points: 33,
      active: true,
    },
    {
      id: 2,
      name: 'TEssa',
      club: 'SuS',
      elo: 560.1525427859219,
      wins: 1,
      losses: 1,
      frees: 0,
      played: 2,
      points: 33,
      active: true,
    },
    {
      id: 3,
      name: 'Jan',
      club: 'SuS',
      elo: 537.4707957659083,
      wins: 0,
      losses: 0,
      frees: 0,
      played: 0,
      points: 0,
      active: true,
    },
    {
      id: 4,
      name: 'Jana',
      club: 'SuS',
      elo: 631.0656983648337,
      wins: 2,
      losses: 1,
      frees: 1,
      played: 3,
      points: 54,
      active: true,
    },
    {
      id: 5,
      name: 'Martin',
      club: 'SuS',
      elo: 554.9135663853631,
      wins: 0,
      losses: 1,
      frees: 1,
      played: 1,
      points: 12,
      active: true,
    },
    {
      id: 6,
      name: 'Felix',
      club: 'SuS',
      elo: 488.51503813702897,
      wins: 0,
      losses: 1,
      frees: 0,
      played: 1,
      points: 12,
      active: true,
    },
    {
      id: 7,
      name: 'Tom',
      club: 'SuS',
      elo: 539.3252601874184,
      wins: 0,
      losses: 0,
      frees: 0,
      played: 0,
      points: 0,
      active: true,
    },
    {
      id: 8,
      name: 'Sonja',
      club: 'SuS',
      elo: 550.185344476062,
      wins: 0,
      losses: 0,
      frees: 0,
      played: 0,
      points: 0,
      active: true,
    },
    {
      id: 9,
      name: 'Emily',
      club: 'SuS',
      elo: 571.7587398435335,
      wins: 0,
      losses: 0,
      frees: 0,
      played: 0,
      points: 0,
      active: true,
    },
    {
      id: 10,
      name: 'Celine',
      club: 'SuS',
      elo: 603.87343444102,
      wins: 1,
      losses: 0,
      frees: 0,
      played: 1,
      points: 21,
      active: true,
    },
    {
      id: 11,
      name: 'Tobias',
      club: 'SuS',
      elo: 596.4511522635688,
      wins: 1,
      losses: 1,
      frees: 1,
      played: 2,
      points: 33,
      active: true,
    },
    {
      id: 12,
      name: 'Andreas',
      club: 'SuS',
      elo: 502.73189878142847,
      wins: 0,
      losses: 0,
      frees: 1,
      played: 0,
      points: 0,
      active: true,
    },
  ],
  matches: [
    {
      id: 15,
      round: 6,
      field: 1,
      teamA: [
        {
          id: 10,
          name: 'Celine',
          club: 'SuS',
          elo: 603.87343444102,
          wins: 1,
          losses: 0,
          frees: 0,
          played: 1,
          points: 21,
          active: true,
        },
        {
          id: 4,
          name: 'Jana',
          club: 'SuS',
          elo: 631.0656983648337,
          wins: 2,
          losses: 1,
          frees: 1,
          played: 3,
          points: 54,
          active: true,
        },
      ],
      teamB: [
        {
          id: 1,
          name: 'Tim',
          club: 'SuS',
          elo: 588.7568223737906,
          wins: 1,
          losses: 1,
          frees: 1,
          played: 2,
          points: 33,
          active: true,
        },
        {
          id: 2,
          name: 'TEssa',
          club: 'SuS',
          elo: 560.1525427859219,
          wins: 1,
          losses: 1,
          frees: 0,
          played: 2,
          points: 33,
          active: true,
        },
      ],
      prob: {
        A: '47',
        B: '53',
      },
      completed: true,
      score: {
        A: 21,
        B: 12,
      },
    },
    {
      id: 16,
      round: 6,
      field: 2,
      teamA: [
        {
          id: 5,
          name: 'Martin',
          club: 'SuS',
          elo: 554.9135663853631,
          wins: 0,
          losses: 1,
          frees: 1,
          played: 1,
          points: 12,
          active: true,
        },
        {
          id: 3,
          name: 'Jan',
          club: 'SuS',
          elo: 537.4707957659083,
          wins: 0,
          losses: 0,
          frees: 0,
          played: 0,
          points: 0,
          active: true,
        },
      ],
      teamB: [
        {
          id: 12,
          name: 'Andreas',
          club: 'SuS',
          elo: 502.73189878142847,
          wins: 0,
          losses: 0,
          frees: 1,
          played: 0,
          points: 0,
          active: true,
        },
        {
          id: 0,
          name: 'Armin',
          club: 'SuS',
          elo: 535.9416308912531,
          wins: 0,
          losses: 0,
          frees: 0,
          played: 0,
          points: 0,
          active: true,
        },
      ],
      prob: {
        A: '54',
        B: '46',
      },
      completed: false,
    },
    {
      id: 17,
      round: 6,
      field: 3,
      teamA: [
        {
          id: 7,
          name: 'Tom',
          club: 'SuS',
          elo: 539.3252601874184,
          wins: 0,
          losses: 0,
          frees: 0,
          played: 0,
          points: 0,
          active: true,
        },
        {
          id: 6,
          name: 'Felix',
          club: 'SuS',
          elo: 488.51503813702897,
          wins: 0,
          losses: 1,
          frees: 0,
          played: 1,
          points: 12,
          active: true,
        },
      ],
      teamB: [
        {
          id: 8,
          name: 'Sonja',
          club: 'SuS',
          elo: 550.185344476062,
          wins: 0,
          losses: 0,
          frees: 0,
          played: 0,
          points: 0,
          active: true,
        },
        {
          id: 9,
          name: 'Emily',
          club: 'SuS',
          elo: 571.7587398435335,
          wins: 0,
          losses: 0,
          frees: 0,
          played: 0,
          points: 0,
          active: true,
        },
      ],
      prob: {
        A: '43',
        B: '57',
      },
      completed: false,
    },
  ],
  history: [
    {
      id: 0,
      round: 1,
      field: 1,
      teamA: [
        {
          id: 1,
          name: 'Tim',
          club: 'SuS',
          elo: 588.7568223737906,
          wins: 1,
          losses: 1,
          frees: 1,
          played: 2,
          points: 33,
          active: true,
        },
        {
          id: 11,
          name: 'Tobias',
          club: 'SuS',
          elo: 596.4511522635688,
          wins: 1,
          losses: 1,
          frees: 1,
          played: 2,
          points: 33,
          active: true,
        },
      ],
      teamB: [
        {
          id: 4,
          name: 'Jana',
          club: 'SuS',
          elo: 631.0656983648337,
          wins: 2,
          losses: 1,
          frees: 1,
          played: 3,
          points: 54,
          active: true,
        },
        {
          id: 5,
          name: 'Martin',
          club: 'SuS',
          elo: 554.9135663853631,
          wins: 0,
          losses: 1,
          frees: 1,
          played: 1,
          points: 12,
          active: true,
        },
      ],
      prob: {
        A: '50',
        B: '50',
      },
      completed: true,
      score: {
        A: 21,
        B: 12,
      },
    },
    {
      id: 12,
      round: 5,
      field: 1,
      teamA: [
        {
          id: 11,
          name: 'Tobias',
          club: 'SuS',
          elo: 596.4511522635688,
          wins: 1,
          losses: 1,
          frees: 1,
          played: 2,
          points: 33,
          active: true,
        },
        {
          id: 6,
          name: 'Felix',
          club: 'SuS',
          elo: 488.51503813702897,
          wins: 0,
          losses: 1,
          frees: 0,
          played: 1,
          points: 12,
          active: true,
        },
      ],
      teamB: [
        {
          id: 2,
          name: 'TEssa',
          club: 'SuS',
          elo: 560.1525427859219,
          wins: 1,
          losses: 1,
          frees: 0,
          played: 2,
          points: 33,
          active: true,
        },
        {
          id: 4,
          name: 'Jana',
          club: 'SuS',
          elo: 631.0656983648337,
          wins: 2,
          losses: 1,
          frees: 1,
          played: 3,
          points: 54,
          active: true,
        },
      ],
      prob: {
        A: '51',
        B: '49',
      },
      completed: true,
      score: {
        A: 12,
        B: 21,
      },
    },
    {
      id: 15,
      round: 6,
      field: 1,
      teamA: [
        {
          id: 10,
          name: 'Celine',
          club: 'SuS',
          elo: 603.87343444102,
          wins: 1,
          losses: 0,
          frees: 0,
          played: 1,
          points: 21,
          active: true,
        },
        {
          id: 4,
          name: 'Jana',
          club: 'SuS',
          elo: 631.0656983648337,
          wins: 2,
          losses: 1,
          frees: 1,
          played: 3,
          points: 54,
          active: true,
        },
      ],
      teamB: [
        {
          id: 1,
          name: 'Tim',
          club: 'SuS',
          elo: 588.7568223737906,
          wins: 1,
          losses: 1,
          frees: 1,
          played: 2,
          points: 33,
          active: true,
        },
        {
          id: 2,
          name: 'TEssa',
          club: 'SuS',
          elo: 560.1525427859219,
          wins: 1,
          losses: 1,
          frees: 0,
          played: 2,
          points: 33,
          active: true,
        },
      ],
      prob: {
        A: '47',
        B: '53',
      },
      completed: true,
      score: {
        A: 21,
        B: 12,
      },
    },
  ],
  clubs: ['SuS'],
  round: 6,
};
