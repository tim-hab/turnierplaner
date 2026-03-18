import { Injectable, linkedSignal } from '@angular/core';
import { Player } from '../datatypes/player';

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
      this.addNewPlayer(player, 'SuS', 5);
    }
  }

  addNewPlayer(name: string, club: string, elo: number) {
    this.player.update((l) => [
      ...l,
      {
        id: this.newID++,
        name: name,
        club: club,
        elo: elo * 100,
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

  updatePlayerWinsLosses(p: Player, win: boolean, factor: number) {
    this.player.update((player) => {
      const i = player.findIndex((g) => g.id == p.id);
      if (win) {
        player[i].wins++;
        player[i].played++;
        player[i].elo += 20 * (1 + factor);
      } else {
        player[i].wins++;
        player[i].played++;
        player[i].elo -= 10 * (1 + factor);
      }
      return [...player];
    });
  }

  updatePlayerFrees(p: Player) {
    this.player.update((player) => {
      const i = player.findIndex((g) => g.id == p.id);
      player[i].frees++;
      return [...player];
    });
  }
}
