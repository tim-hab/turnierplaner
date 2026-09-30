import { inject, Injectable } from '@angular/core';
import { PlayerService } from './player.service';
import { TournamentService } from './tournament.service';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { devPlayers, Player } from '../datatypes/player';
import {
  mapMatchExportToMatch,
  mapMatchToMatchExport,
  Match,
  MatchExport,
} from '../datatypes/Match';
import { DialogService } from './dialog.service';

interface Content {
  player: Player[];
  clubs: string[];
  matches: Match[];
  history: Match[];
  round: number;
  totalRounds: number;
  running: boolean;
}

interface JsonContent {
  version: string;
  player: Player[];
  clubs: string[];
  matches: MatchExport[];
  history: MatchExport[];
  round: number;
  totalRounds: number;
  running: boolean;
}

class MatchLoadingError extends Error {
  constructor() {
    super('Matches could not be loaded');
  }
}
class FileVersionError extends Error {
  constructor() {
    super('File not readable because of wrong version');
  }
}
class DuplicateIdError extends Error {
  constructor() {
    super(
      'Matches could not be loaded because there is a duplicate player id. Please consider to only load player data.',
    );
  }
}

@Injectable({
  providedIn: 'root',
})
export class ExportJsonService {
  private playerService = inject(PlayerService);
  private tournamentService = inject(TournamentService);
  private readonly dialogService = inject(DialogService);
  private readonly EXPORT_VERSION = 'v1.0.0';

  //dev settings
  // constructor() {
  //   this.importPlayerData(JSON.stringify(devPlayers));
  // }

  generateJsonString(): string {
    const player = this.playerService.player();
    const clubs = this.playerService.clubs();
    const matches = this.tournamentService.matches().map((m) => mapMatchToMatchExport(m));
    const history = this.tournamentService.history().map((m) => mapMatchToMatchExport(m));
    const round = this.tournamentService.round();
    const totalRounds = this.tournamentService.totalRounds();
    const running = this.tournamentService.running();

    return JSON.stringify({
      version: this.EXPORT_VERSION,
      player: player,
      clubs: clubs,
      matches: matches,
      history: history,
      round: round,
      totalRounds: totalRounds,
      running: running,
    } as JsonContent);
  }

  generateJsonFile() {
    return URL.createObjectURL(
      new File([this.generateJsonString()], 'turnier.json', {
        type: 'application/json',
      }),
    );
  }

  importJsonString(input: string) {
    try {
      const content: Content = this.connectObjects(JSON.parse(input));

      const ids = new Set<number>();
      content.player.forEach((p) => ids.add(p.id));
      if (ids.size !== content.player.length) {
        throw new DuplicateIdError();
      }
      this.playerService.loadPlayerData(content.player, content.clubs);
      this.tournamentService.loadTournamentData(
        content.matches,
        content.history,
        content.round,
        content.totalRounds,
        content.running,
      );
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Unknown error';
      console.error(e);
      this.dialogService.openMessageDialog(message);
    }
  }

  connectObjects(content: JsonContent | Content): Content {
    if ('version' in content) {
      if (content.version && content.version <= this.EXPORT_VERSION) {
        const matches = content.matches.map((m) => {
          const match = mapMatchExportToMatch(m, content.player);
          if (match) {
            return match;
          } else {
            throw new MatchLoadingError();
          }
        });
        const history = content.history.map((m) => {
          const match = mapMatchExportToMatch(m, content.player);
          if (match) {
            return match;
          } else {
            throw new MatchLoadingError();
          }
        });
        return {
          ...content,
          matches,
          history,
        };
      } else {
        throw new FileVersionError();
      }
    } else {
      return this.oldConnectObjects(content);
    }
  }

  /* eslint-disable @typescript-eslint/prefer-for-of */
  oldConnectObjects(content: Content) {
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

    const ids = new Set<number>();
    content.player.forEach((p) => {
      p.frees = 0;
      p.losses = 0;
      p.wins = 0;
      p.played = 0;
      p.points = 0;
      ids.add(p.id);
    });
    if (ids.size !== content.player.length) {
      console.warn('Duplicate player id. Reseting ids...');
      let newId = 0;
      content.player.forEach((p) => {
        p.id = newId++;
      });
    }
    this.playerService.loadPlayerData(content.player, content.clubs);
    this.tournamentService.loadTournamentData([], [], 0, content.totalRounds, true);
  }
}
