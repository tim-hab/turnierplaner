import { Injectable, linkedSignal } from '@angular/core';
import { Player } from '../datatypes/player';
import { Match } from '../datatypes/Match';

const mockPlayer = [
  'Armin',
  'Tim',
  'TEssa',
  'Jan',
  'Jana',
  'Martin',
  'Felix',
  'Tom',
  'Sonja',
  'Emily',
  'Celine',
  'Tobias',
  'Andreas',
];

const mockClubs = ['SuS Westenholz', 'Boke'];

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  private newID = 0;
  player = linkedSignal<Player[]>(() => []);
  clubs = linkedSignal<string[]>(() => mockClubs);

  constructor() {
    for (const player of mockPlayer) {
      this.addNewPlayer(player, 'SuS', Math.random() * 100 + 500);
    }
  }

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
      } else {
        p.losses++;
      }
      p.played++;
      p.elo += eloAenderungA;
    });

    match.teamB.forEach((p) => {
      if (ergebnisB) {
        p.wins++;
      } else {
        p.losses++;
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
}
