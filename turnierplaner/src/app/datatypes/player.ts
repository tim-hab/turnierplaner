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

export function sortByElo(eloMod?: number) {
  eloMod = eloMod ?? 50;
  return (a: Player, b: Player) => {
    return b.elo - a.elo + Math.random() * eloMod;
  };
}

export function sortByWinsTheanElo(a: Player, b: Player) {
  const first = b.wins - a.wins;
  if (first) return first;
  else return b.elo - a.elo;
}
