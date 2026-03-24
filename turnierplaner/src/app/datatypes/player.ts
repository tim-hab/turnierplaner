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
}

export function sortByFrees(a: Player, b: Player) {
  const first = b.frees - a.frees;
  return first;
}

/**
 *
 * @param eloMod Defines the randomness sorting by elo, a higher value means a lower elo could be at a higher position in the list. Standard Value is 50;
 * @returns
 */
export function sortByElo(eloMod?: number) {
  eloMod = eloMod ?? 50;
  return (a: Player, b: Player) => {
    return b.elo - a.elo + Math.random() * eloMod;
  };
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
