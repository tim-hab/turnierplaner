import { inject, Injectable, linkedSignal } from '@angular/core';
import { Player, PlayerService } from './player.service';

export interface Match {
  id: number;
  round: number;
  field: number;
  teamA: Player[];
  teamB: Player[];
  prob: { A: string; B: string };
  score: null | { A: number; B: number };
  completed: boolean;
}

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
    this.round.set(1);
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
    this.generateMatches();
    alert('Runde ' + this.round + ' gestartet!');
  }

  calcProbability(teamA: Player[], teamB: Player[]) {
    let eloA = teamA[0].elo + teamA[1].elo;
    let eloB = teamB[0].elo + teamB[1].elo;
    let probA = 1 / (1 + 10 ** ((eloB - eloA) / 400));
    return { A: (probA * 100).toFixed(0), B: ((1 - probA) * 100).toFixed(0) };
  }

  generateMatches() {
    const newMatches: Match[] = [];
    const activePlayers = [...this.playerService.player()].sort((a, b) => a.frees - b.frees);
    while (activePlayers.length >= 4 && newMatches.length < this.fields) {
      let teamA = [activePlayers.shift()!, activePlayers.pop()!];
      let teamB = [activePlayers.shift()!, activePlayers.pop()!];
      newMatches.push({
        id: this.newID++,
        round: this.round(),
        field: newMatches.length + 1,
        teamA,
        teamB,
        prob: this.calcProbability(teamA, teamB),
        score: null,
        completed: false,
      });
    }
    this.matches.update((l) => [...newMatches]);
    this.freePlayers.update((l) => [...activePlayers]);
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
        this.playerService.updatePlayer(p, true, factor);
      });
      loserTeam.forEach((p) => {
        this.playerService.updatePlayer(p, false, factor);
      });
      this.updateHistory(l[i]);
      return [...l];
    });
  }

  updateHistory(match: Match) {
    this.history.update((h) => [...h, match]);
  }

  changeScore(match: Match, newScore: { A: number; B: number }) {}

  toggleProb() {
    this.showProb.update((prob) => !prob);
  }
}
