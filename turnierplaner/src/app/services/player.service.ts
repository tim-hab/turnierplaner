import { Injectable, linkedSignal, signal, Signal } from '@angular/core';

export interface Player {
  id: number;
  name: string;
  club: string;
  elo: number;
  wins: number;
  losses: number;
  frees: number;
  played: number;
}

const mockPlayer = ['Armin', 'Tim', 'TEssa', 'Jan'];

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  private newID = 0;
  player = linkedSignal<Player[]>(() => []);
  clubs = linkedSignal<string[]>(() => []);

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

  updatePlayer(p: Player, win: boolean, factor: number) {
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
}
