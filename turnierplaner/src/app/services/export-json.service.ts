import { inject, Injectable } from '@angular/core';
import { PlayerService } from './player.service';
import { TournamentService } from './tournament.service';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { devPlayers, Player } from '../datatypes/player';
import { Match } from '../datatypes/Match';

interface Content {
  player: Player[];
  clubs: string[];
  matches: Match[];
  history: Match[];
  round: number;
  totalRounds: number;
  running: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ExportJsonService {
  private playerService = inject(PlayerService);
  private tournamentService = inject(TournamentService);

  //dev settings
  // constructor() {
  //   this.importPlayerData(JSON.stringify(devPlayers));
  // }

  generateJsonString(): string {
    const player = this.playerService.player();
    const clubs = this.playerService.clubs();
    const matches = this.tournamentService.matches();
    const history = this.tournamentService.history();
    const round = this.tournamentService.round();
    const totalRounds = this.tournamentService.totalRounds();
    const running = this.tournamentService.running();

    return JSON.stringify({
      player: player,
      clubs: clubs,
      matches: matches,
      history: history,
      round: round,
      totalRounds: totalRounds,
      running: running,
    });
  }

  generateJsonFile() {
    return URL.createObjectURL(
      new File([this.generateJsonString()], 'turnier.json', {
        type: 'application/json',
      }),
    );
  }

  importJsonString(input: string) {
    const content: Content = this.connectObjects(JSON.parse(input));
    this.playerService.player.set(content.player);
    this.playerService.clubs.set(content.clubs);
    this.tournamentService.matches.set(content.matches);
    this.tournamentService.history.set(content.history);
    this.tournamentService.round.set(content.round);
    this.tournamentService.totalRounds.set(content.totalRounds);
    this.tournamentService.running.set(content.running == null ? true : content.running);
    this.tournamentService['newID'] = this.tournamentService.matches().length;
  }

  /* eslint-disable @typescript-eslint/prefer-for-of */
  connectObjects(content: Content) {
    for (let p = 0; p < content.player.length; p++) {
      for (let i = 0; i < content.matches.length; i++) {
        let found = false;
        for (let j = 0; j < content.matches[j].teamA.length; j++) {
          if (content.matches[i].teamA[j].id == content.player[p].id) {
            content.matches[i].teamA[j] = content.player[p];
            found = true;
            break;
          }
        }
        if (found) break;
        for (let j = 0; j < content.matches[j].teamB.length; j++) {
          if (content.matches[i].teamB[j].id == content.player[p].id) {
            content.matches[i].teamB[j] = content.player[p];
            break;
          }
        }
      }
      for (let i = 0; i < content.history.length; i++) {
        let found = false;
        for (let j = 0; j < content.history[j].teamA.length; j++) {
          if (content.history[i].teamA[j].id == content.player[p].id) {
            content.history[i].teamA[j] = content.player[p];
            found = true;
            break;
          }
        }
        if (found) break;
        for (let j = 0; j < content.history[j].teamB.length; j++) {
          if (content.history[i].teamB[j].id == content.player[p].id) {
            content.history[i].teamB[j] = content.player[p];
            break;
          }
        }
      }
    }

    return content;
  }

  importPlayerData(input: string) {
    const content: Content = JSON.parse(input);
    content.player.forEach((p) => {
      p.frees = 0;
      p.losses = 0;
      p.wins = 0;
      p.played = 0;
      p.points = 0;
    });
    this.playerService.player.set(content.player);
    this.playerService.clubs.set(content.clubs);
    this.tournamentService.matches.set([]);
    this.tournamentService.history.set([]);
    this.tournamentService.round.set(0);
    this.tournamentService.totalRounds.set(content.totalRounds);
    this.tournamentService.running.set(true);
  }
}
