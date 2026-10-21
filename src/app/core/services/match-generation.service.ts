import { Injectable } from '@angular/core';
import { Algorithm, Match, newMatch, Team } from '../datatypes/match';
import { Player, sortByEloWithMod, sortByPlayedThenFrees } from '../datatypes/player';

export interface MatchGenerationResult {
  matches: Match[];
  freePlayers: Player[];
  nextId: number;
  fields: number;
}

@Injectable({
  providedIn: 'root',
})
export class MatchGenerationService {
  generate(
    players: Player[],
    fields: number,
    round: number,
    nextId: number,
    eloMod?: number,
    algorithm?: Algorithm,
  ): MatchGenerationResult {
    const activePlayers = [...players.filter((player) => player.active)].sort(
      sortByPlayedThenFrees,
    );
    const availableFields = Math.min(fields, Math.floor(activePlayers.length / 4));
    const selectedPlayers = sortByEloWithMod(
      activePlayers.slice(undefined, 4 * availableFields),
      eloMod,
    );
    const freePlayers = activePlayers.slice(4 * availableFields);
    const data = this.selectAlgorithm(selectedPlayers, availableFields, round, nextId, algorithm);
    const matches = this.shuffleArray(data.matches);

    matches.forEach((match, index) => (match.field = index + 1));

    return {
      matches,
      freePlayers: [...data.players, ...freePlayers],
      nextId: data.nextId,
      fields: availableFields,
    };
  }

  private selectAlgorithm(
    players: Player[],
    fields: number,
    round: number,
    nextId: number,
    algorithm?: Algorithm,
  ) {
    let selectedAlgorithm = Math.random() * 3;
    if (algorithm) {
      selectedAlgorithm = algorithm;
    }

    if (selectedAlgorithm > 2) {
      return this.homogenMatches(players, fields, round, nextId);
    } else if (selectedAlgorithm > 1) {
      return this.heterogenMatches(players, fields, round, nextId);
    } else {
      return this.firstWithLastMatches(players, fields, round, nextId);
    }
  }

  private firstWithLastMatches(players: Player[], fields: number, round: number, nextId: number) {
    const matches: Match[] = [];
    while (players.length >= 4 && matches.length < fields) {
      const teamA: Team = [players.shift()!, players.pop()!];
      const teamB: Team = [players.shift()!, players.pop()!];
      matches.push(newMatch(nextId++, round, matches.length + 1, teamA, teamB));
    }
    return { players, matches, nextId };
  }

  private homogenMatches(players: Player[], fields: number, round: number, nextId: number) {
    const matches: Match[] = [];
    while (players.length >= 4 && matches.length < fields) {
      const teamA: Team = [players.shift()!, players[2]];
      const teamB: Team = [players.shift()!, players.shift()!];
      players.shift();
      matches.push(newMatch(nextId++, round, matches.length + 1, teamA, teamB));
    }
    return { players, matches, nextId };
  }

  private heterogenMatches(players: Player[], fields: number, round: number, nextId: number) {
    const teams: Team[] = [];
    while (players.length > 0) {
      teams.push([players.shift()!, players.pop()!]);
    }
    const matches: Match[] = [];
    while (teams.length > 0 && matches.length < fields) {
      matches.push(newMatch(nextId++, round, matches.length + 1, teams.shift()!, teams.pop()!));
    }
    return { players, matches, nextId };
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
  }
}
