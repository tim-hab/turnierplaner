import { Player } from '../datatypes/player';

export interface Match {
  id: number;
  round: number;
  field: number;
  teamA: Team;
  teamB: Team;
  prob: { A: string; B: string };
  score: null | { A: number; B: number };
  completed: boolean;
}

export type Team = [Player, Player];

export function newMatch(id: number, round: number, field: number, teamA: Team, teamB: Team) {
  return {
    id: id,
    round: round,
    field: field,
    teamA: teamA,
    teamB: teamB,
    prob: calcProbability(teamA, teamB),
    score: null,
    completed: false,
  } as Match;
}

function calcProbability(teamA: Player[], teamB: Player[]) {
  const eloA = teamA[0].elo + teamA[1].elo;
  const eloB = teamB[0].elo + teamB[1].elo;
  const probA = 1 / (1 + 10 ** ((eloB - eloA) / 400));
  return { A: (probA * 100).toFixed(0), B: ((1 - probA) * 100).toFixed(0) };
}
