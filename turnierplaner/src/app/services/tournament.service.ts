import { inject, Injectable, linkedSignal } from '@angular/core';
import { PlayerService } from './player.service';
import { Player, sortByElo, sortByFrees } from '../datatypes/player';
import { Match, newMatch, Team } from '../datatypes/Match';

@Injectable({
  providedIn: 'root',
})
export class TournamentService {
  private newID = 0;
  private playerService = inject(PlayerService);
  private totalRounds = 5;
  private fields = 4;
  round = linkedSignal<number>(() => 1);
  matches = linkedSignal<Match[]>(() => []);
  freePlayers = linkedSignal<Player[]>(() => []);
  history = linkedSignal<Match[]>(() => []);
  showProb = linkedSignal<boolean>(() => false);

  startTournament(totalRounds: number, fields: number) {
    if (this.playerService.player().length < 4) return alert('Mindestens 4 Spieler!');
    this.fields = fields;
    this.totalRounds = totalRounds;
    this.generateMatches();
  }

  nextRound(fields: number) {
    if (this.round() >= this.totalRounds) {
      alert('Maximale Runden erreicht');
      return;
    }
    this.round.set(this.round() + 1);
    this.fields = fields;
    this.freePlayers().forEach((p) => this.playerService.updatePlayerFrees(p));
    this.generateMatches();
    alert('Runde ' + this.round + ' gestartet!');
  }

  generateMatches() {
    const activePlayers = [...this.playerService.player()].sort(sortByFrees);
    if (activePlayers.length / 4 < this.fields) {
      this.fields = Math.floor(activePlayers.length / 4);
    }
    const player = activePlayers.slice(undefined, 4 * this.fields).sort(sortByElo);
    const frees = activePlayers.slice(4 * this.fields);
    let data: { player: Player[]; newMatches: Match[] };

    const random = Math.random() * 3;
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
    this.matches.update((l) => {
      const i = l.findIndex((m) => m.id == match.id);
      l[i].score = { A: teamA, B: teamB };
      l[i].completed = true;
      const factor = Math.abs(teamA - teamB) / 21;
      let winnerTeam, loserTeam;
      if (teamA > teamB) {
        winnerTeam = match.teamA;
        loserTeam = match.teamB;
      } else {
        winnerTeam = match.teamB;
        loserTeam = match.teamA;
      }
      winnerTeam.forEach((p) => {
        this.playerService.updatePlayerWinsLosses(p, true, factor);
      });
      loserTeam.forEach((p) => {
        this.playerService.updatePlayerWinsLosses(p, false, factor);
      });
      this.updateHistory(l[i]);
      return [...l];
    });
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
}
