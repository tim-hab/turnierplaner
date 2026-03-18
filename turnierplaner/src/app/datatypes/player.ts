export interface Player {
  id: number;
  name: string;
  club: string;
  elo: number;
  wins: number;
  losses: number;
  frees: number;
  played: number;
}

export function sortByFrees(a: Player, b: Player) {
  const first = b.frees - a.frees;
  return first;
}

export function sortByElo(a: Player, b: Player) {
  return b.elo - a.elo;
}
