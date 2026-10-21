import { Player } from './player';

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

export interface MatchExport {
  id: number;
  round: number;
  field: number;
  teamA: [number, number];
  teamB: [number, number];
  prob: { A: string; B: string };
  score?: Score;
  completed: boolean;
}

export function mapMatchToMatchExport(match: Match): MatchExport {
  return {
    ...match,
    teamA: [match.teamA[0].id, match.teamA[1].id],
    teamB: [match.teamB[0].id, match.teamB[1].id],
  } as MatchExport;
}

export function mapMatchExportToMatch(match: MatchExport, player: Player[]): Match | undefined {
  const teamA = [
    player.find((p) => p.id === match.teamA[0]),
    player.find((p) => p.id === match.teamA[1]),
  ];
  const teamB = [
    player.find((p) => p.id === match.teamB[0]),
    player.find((p) => p.id === match.teamB[1]),
  ];
  if (teamA.includes(undefined) || teamB.includes(undefined)) {
    return undefined;
  } else {
    return {
      ...match,
      teamA: teamA as Team,
      teamB: teamB as Team,
    };
  }
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
