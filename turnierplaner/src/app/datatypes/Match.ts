import { Player } from '../datatypes/player';

export interface Match {
  id: number;
  round: number;
  field: number;
  teamA: Team;
  teamB: Team;
  prob: { A: string; B: string };
  score?: Score;
  completed: boolean;
}

export type Team = [Player, Player];

export interface Score {
  A: number;
  B: number;
}

export function newMatch(id: number, round: number, field: number, teamA: Team, teamB: Team) {
  return {
    id: id,
    round: round,
    field: field,
    teamA: teamA,
    teamB: teamB,
    prob: calcProbability(teamA, teamB),
    completed: false,
  } as Match;
}

export enum Algorithm {
  random,
  firstWithLast,
  heterogen,
  homogen,
}

function calcProbability(teamA: Player[], teamB: Player[]) {
  const eloA = (teamA[0].elo + teamA[1].elo) / 2;
  const eloB = (teamB[0].elo + teamB[1].elo) / 2;
  const probA = 1 / (1 + 10 ** ((eloB - eloA) / 400));
  return { A: (probA * 100).toFixed(0), B: ((1 - probA) * 100).toFixed(0) };
}
