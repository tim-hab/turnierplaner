import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { PlayerService } from './player.service';
import { Player } from '../datatypes/player';
import { Algorithm, Match } from '../datatypes/match';
import { DialogService } from './dialog.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatchGenerationService } from './match-generation.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class TournamentService {
  private readonly dialogService = inject(DialogService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly matchGenerationService = inject(MatchGenerationService);
  private newID = 0;
  private playerService = inject(PlayerService);
  private fields = 4;
  private Kbasis = 32;

  private readonly totalRoundsSignal = signal<number>(5);
  public readonly totalRounds = this.totalRoundsSignal.asReadonly();
  private readonly roundSignal = signal<number>(0);
  public readonly round = this.roundSignal.asReadonly();
  private readonly matchesSignal = signal<Match[]>([]);
  public readonly matches = this.matchesSignal.asReadonly();
  private readonly freePlayersSignal = signal<Player[]>([]);
  public readonly freePlayers = this.freePlayersSignal.asReadonly();
  private readonly historySignal = signal<Match[]>([]);
  public readonly history = this.historySignal.asReadonly();
  private readonly showProbSignal = signal<boolean>(false);
  public readonly showProb = this.showProbSignal.asReadonly();
  private readonly runningSignal = signal<boolean>(true);
  public readonly running = this.runningSignal.asReadonly();

  startTournament(
    totalRounds: number,
    fields: number,
    eloMod?: number,
    algorithm?: Algorithm,
    Kbasis?: number,
  ) {
    if (this.playerService.player().length < 4) {
      this.dialogService.openMessageDialog('Mindestens 4 Spieler werden benötigt.');
      return;
    }
    this.fields = fields;
    this.totalRoundsSignal.update(() => totalRounds);
    this.roundSignal.set(1);
    this.generateMatches(eloMod, algorithm, Kbasis);
  }

  nextRound(
    round: number,
    fields: number,
    eloMod?: number,
    algorithm?: Algorithm,
    Kbasis?: number,
  ) {
    if (this.matchesSignal().some((m) => !m.completed)) {
      this.dialogService.openMessageDialog(
        'Die nächste Runde kann erst gestartet werden, wenn alle Spiele der aktuellen Runde beendet wurden.',
      );
    } else {
      this.totalRoundsSignal.update(() => round);
      if (this.roundSignal() >= this.totalRoundsSignal()) {
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
              void this.router.navigate(['/table']);
            }
          });
      } else {
        this.roundSignal.set(this.roundSignal() + 1);
        this.fields = fields;
        this.playerService.updatePlayerFrees(this.freePlayersSignal());
        this.generateMatches(eloMod, algorithm, Kbasis);
      }
    }
  }

  generateMatches(eloMod?: number, algorithm?: Algorithm, Kbasis?: number) {
    this.Kbasis = Kbasis ?? 32;
    const result = this.matchGenerationService.generate(
      this.playerService.player(),
      this.fields,
      this.roundSignal(),
      this.newID,
      eloMod,
      algorithm,
    );
    this.fields = result.fields;
    this.newID = result.nextId;
    this.matchesSignal.set(result.matches);
    this.freePlayersSignal.set(result.freePlayers);
  }

  setWinner(match: Match, teamA: number, teamB: number) {
    match.score = { A: teamA, B: teamB };
    match.completed = true;
    this.playerService.updatePlayerAndCalculateElo(match, teamA, teamB, this.Kbasis);
    this.updateHistory(match);
  }

  updateHistory(match: Match) {
    this.historySignal.update((h) => [...h, match]);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  changeScore(match: Match, newScore: { A: number; B: number }) {
    /* empty */
  }

  toggleProb() {
    this.showProbSignal.update((prob) => !prob);
  }

  endTournament() {
    this.runningSignal.set(false);
    this.playerService.player().forEach((player) => {
      const averageScorePerMatch =
        player.played > 0 ? Math.round(player.points / player.played) : 0;
      player.points += averageScorePerMatch * player.frees;
    });
  }

  loadTournamentData(
    matches: Match[],
    history: Match[],
    round: number,
    totalRounds: number,
    running: boolean,
  ) {
    this.matchesSignal.set(matches);
    this.historySignal.set(history);
    this.roundSignal.set(round);
    this.totalRoundsSignal.set(totalRounds);
    this.runningSignal.set(running);
    this.newID = this.matchesSignal().length;
  }

  reset() {
    this.newID = 0;
    this.matchesSignal.set([]);
    this.historySignal.set([]);
    this.roundSignal.set(0);
    this.totalRoundsSignal.set(5);
    this.runningSignal.set(true);
    this.freePlayersSignal.set([]);
  }
}
