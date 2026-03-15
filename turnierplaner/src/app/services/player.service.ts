import { Injectable, linkedSignal, signal, Signal } from '@angular/core';

export interface Player {
  name: string;
  club: string;
  elo: number;
  wins: number;
  losses: number;
}

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  player = linkedSignal<Player[]>(() => []);
  clubs = linkedSignal<string[]>(() => []);

  addNewPlayer(name: string, club: string, elo: number) {
    this.player.update((l) => [ ...l, { name: name, club: club, elo: elo, wins: 0, losses: 0 }]);
  }

  addNewClub(name: string) {
    this.clubs.update((l) => [ ...l, name]);
  }
}
