import { Injectable, linkedSignal } from '@angular/core';
import { Player } from '../datatypes/player';
import { Match } from '../datatypes/Match';

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  private newID = 0;
  player = linkedSignal<Player[]>(() => []);
  clubs = linkedSignal<string[]>(() => []);

  addNewPlayer(name: string, club: string, elo: number) {
    this.player.update((l) => [
      ...l,
      {
        id: this.newID++,
        name: name,
        club: club,
        elo: elo,
        wins: 0,
        losses: 0,
        frees: 0,
        played: 0,
        points: 0,
        active: true,
      },
    ]);
  }

  addNewClub(name: string) {
    this.clubs.update((l) => [...l, name]);
  }

  updatePlayerAndCalculateElo(match: Match, teamA: number, teamB: number, Kbasis: number) {
    const eloGesamtA = (match.teamA[0].elo + match.teamA[1].elo) / 2;
    const eloGesamtB = (match.teamB[0].elo + match.teamB[1].elo) / 2;

    const probA = 1.0 / (1.0 + 10 ** ((eloGesamtB - eloGesamtA) / 400.0));
    const probB = 1.0 / (1.0 + 10 ** ((eloGesamtA - eloGesamtB) / 400.0));

    let ergebnisA, ergebnisB;
    if (teamA > teamB) {
      ergebnisA = 1;
      ergebnisB = 0;
    } else {
      ergebnisA = 0;
      ergebnisB = 1;
    }

    const Keff = Kbasis * (1 + Math.abs(teamA - teamB) / 10);

    const eloAenderungA = Keff * (ergebnisA - probA);
    const eloAenderungB = Keff * (ergebnisB - probB);

    match.teamA.forEach((p) => {
      if (ergebnisA) {
        p.wins++;
        p.points += 21;
      } else {
        p.losses++;
        if (teamA >= 19) p.points += 19;
        else p.points += teamA;
      }
      p.played++;
      p.elo += eloAenderungA;
    });

    match.teamB.forEach((p) => {
      if (ergebnisB) {
        p.wins++;
        p.points += 21;
      } else {
        p.losses++;
        if (teamB >= 19) p.points += 19;
        else p.points += teamB;
      }
      p.played++;
      p.elo += eloAenderungB;
    });

    this.player.update((l) => [...l]);
  }

  updatePlayerFrees(list: Player[]) {
    list.forEach((p) => {
      p.frees++;
    });
    this.player.update((l) => [...l]);
  }

  toggleActivePlayer(p: Player) {
    p.active = !p.active;
    this.player.update((l) => [...l]);
  }
}
