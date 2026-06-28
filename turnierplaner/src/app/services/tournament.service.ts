import { inject, Injectable, linkedSignal } from '@angular/core';
import { PlayerService } from './player.service';
import { Player, sortByElo, sortByPlayedThenFrees } from '../datatypes/player';
import { Algorithm, Match, newMatch, Team } from '../datatypes/Match';

@Injectable({
  providedIn: 'root',
})
export class TournamentService {
  private newID = 0;
  private playerService = inject(PlayerService);
  private fields = 4;
  private Kbasis = 32;

  totalRounds = linkedSignal<number>(() => 5);
  round = linkedSignal<number>(() => 0);
  matches = linkedSignal<Match[]>(() => []);
  freePlayers = linkedSignal<Player[]>(() => []);
  history = linkedSignal<Match[]>(() => []);
  showProb = linkedSignal<boolean>(() => false);
  running = linkedSignal<boolean>(() => true);

  startTournament(
    totalRounds: number,
    fields: number,
    eloMod?: number,
    algorithm?: Algorithm,
    Kbasis?: number,
  ) {
    if (this.playerService.player().length < 4) return alert('Mindestens 4 Spieler!');
    this.fields = fields;
    this.totalRounds.update(() => totalRounds);
    this.round.set(1);
    this.generateMatches(eloMod, algorithm, Kbasis);
  }

  nextRound(
    round: number,
    fields: number,
    eloMod?: number,
    algorithm?: Algorithm,
    Kbasis?: number,
  ) {
    this.totalRounds.update(() => round);
    if (this.round() >= this.totalRounds()) {
      alert('Maximale Runden erreicht');
      return;
    }
    this.round.set(this.round() + 1);
    this.fields = fields;
    this.playerService.updatePlayerFrees(this.freePlayers());
    this.generateMatches(eloMod, algorithm, Kbasis);
  }

  generateMatches(eloMod?: number, algorithm?: Algorithm, Kbasis?: number) {
    this.Kbasis = Kbasis ?? 32;
    const activePlayers = [...this.playerService.player().filter((p) => p.active)].sort(
      sortByPlayedThenFrees,
    );
    if (activePlayers.length / 4 < this.fields) {
      this.fields = Math.floor(activePlayers.length / 4);
    }
    const player = activePlayers.slice(undefined, 4 * this.fields).sort(sortByElo(eloMod));
    const frees = activePlayers.slice(4 * this.fields);
    let data: { player: Player[]; newMatches: Match[] };

    let random = Math.random() * 3;

    if (algorithm) {
      random = algorithm;
    }

    if (random > 2) {
      data = this.homogenMatches(player);
      console.log('homogen');
    } else if (random > 1) {
      data = this.heterogenMatches(player);
      console.log('heterogen');
    } else {
      data = this.firstWithLastMatches(player);
      console.log('firstWithLast');
    }

    this.matches.update(() => [...data.newMatches]);
    this.freePlayers.update(() => [...data.player, ...frees]);
  }

  firstWithLastMatches(player: Player[]) {
    const newMatches: Match[] = [];
    while (player.length >= 4 && newMatches.length < this.fields) {
      const teamA: Team = [player.shift()!, player.pop()!];
      const teamB: Team = [player.shift()!, player.pop()!];
      newMatches.push(newMatch(this.newID++, this.round(), newMatches.length + 1, teamA, teamB));
    }
    return { player, newMatches };
  }

  homogenMatches(player: Player[]) {
    const newMatches: Match[] = [];
    while (player.length >= 4 && newMatches.length < this.fields) {
      const teamA: Team = [player.shift()!, player[2]];
      const teamB: Team = [player.shift()!, player.shift()!];
      player.shift();
      newMatches.push(newMatch(this.newID++, this.round(), newMatches.length + 1, teamA, teamB));
    }
    return { player, newMatches };
  }

  heterogenMatches(player: Player[]) {
    const teams: Team[] = [];
    while (player.length > 0) {
      teams.push([player.shift()!, player.pop()!]);
    }
    const newMatches: Match[] = [];
    while (teams.length > 0) {
      newMatches.push(
        newMatch(this.newID++, this.round(), newMatches.length + 1, teams.shift()!, teams.pop()!),
      );
    }
    return { player, newMatches };
  }

  setWinner(match: Match, teamA: number, teamB: number) {
    match.score = { A: teamA, B: teamB };
    match.completed = true;
    this.playerService.updatePlayerAndCalculateElo(match, teamA, teamB, this.Kbasis);
    this.updateHistory(match);
  }

  updateHistory(match: Match) {
    this.history.update((h) => [...h, match]);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  changeScore(match: Match, newScore: { A: number; B: number }) {
    /* empty */
  }

  toggleProb() {
    this.showProb.update((prob) => !prob);
  }

  endTournament() {
    this.running.set(false);
    this.playerService.player().forEach((player) => {
      const averageScorePerMatch = player.points / player.played;
      player.points += averageScorePerMatch * player.frees;
    });
  }
}
