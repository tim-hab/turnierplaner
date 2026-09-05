import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { PlayerService } from './player.service';
import { Player, sortByElo, sortByEloWithMod, sortByPlayedThenFrees } from '../datatypes/player';
import { Algorithm, Match, newMatch, Team } from '../datatypes/Match';
import { DialogService } from './dialog.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RoutingService } from './routing.service';
import { Route } from '../app.routes';

@Injectable({
  providedIn: 'root',
})
export class TournamentService {
  private readonly dialogService = inject(DialogService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly routingService = inject(RoutingService);
  private newID = 0;
  private playerService = inject(PlayerService);
  private fields = 4;
  private Kbasis = 32;

  totalRounds = signal<number>(5);
  round = signal<number>(0);
  matches = signal<Match[]>([]);
  freePlayers = signal<Player[]>([]);
  history = signal<Match[]>([]);
  showProb = signal<boolean>(false);
  running = signal<boolean>(true);

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
    if (this.matches().some((m) => !m.completed)) {
      this.dialogService.openMessageDialog(
        'Die nächste Runde kann erst gestartet werden, wenn alle Spiele der aktuellen Runde beendet wurden.',
      );
    } else {
      this.totalRounds.update(() => round);
      if (this.round() >= this.totalRounds()) {
        this.dialogService
          .openMessageDialog(
            'Die maximale Anzahl der Runden ist erreicht. Möchtest du das Turnier Beenden?',
            'Beenden',
          )
          .afterClosed()
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe((accepted: boolean) => {
            if (accepted) {
              this.endTournament();
              this.routingService.activeRoute.set(Route.TableView);
            }
          });
      } else {
        this.round.set(this.round() + 1);
        this.fields = fields;
        this.playerService.updatePlayerFrees(this.freePlayers());
        this.generateMatches(eloMod, algorithm, Kbasis);
      }
    }
  }

  generateMatches(eloMod?: number, algorithm?: Algorithm, Kbasis?: number) {
    this.Kbasis = Kbasis ?? 32;
    const activePlayers = [...this.playerService.player().filter((p) => p.active)].sort(
      sortByPlayedThenFrees,
    );
    if (activePlayers.length / 4 < this.fields) {
      this.fields = Math.floor(activePlayers.length / 4);
    }
    const player = sortByEloWithMod(activePlayers.slice(undefined, 4 * this.fields), eloMod);
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

    this.matches.update(() => this.shuffleArray(data.newMatches));
    this.freePlayers.update(() => [...data.player, ...frees]);
  }

  shuffleArray<T>(array: T[]): T[] {
    // Create a copy so we don't mutate the original array
    const shuffled = [...array];

    for (let i = shuffled.length - 1; i > 0; i--) {
      // Pick a random index from 0 to i
      const j = Math.floor(Math.random() * (i + 1));

      // Swap elements array[i] and array[j]
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
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
      const averageScorePerMatch = Math.round(player.points / player.played) ?? 0;
      player.points += averageScorePerMatch * player.frees;
    });
  }
}
