import { MatchExport } from '../datatypes/match';
import { Player } from '../datatypes/player';

export interface TournamentSnapshot {
  version: string;
  player: Player[];
  clubs: string[];
  matches: MatchExport[];
  history: MatchExport[];
  round: number;
  totalRounds: number;
  running: boolean;
}

export interface TournamentSummary {
  id: number;
  updatedAt: string;
  round: number;
  running: boolean;
}

export abstract class TournamentRepository {
  abstract load(): Promise<TournamentSnapshot | null>;
  abstract list(): Promise<TournamentSummary[]>;
  abstract loadById(id: number): Promise<TournamentSnapshot | null>;
  abstract save(snapshot: TournamentSnapshot): Promise<void>;
  abstract saveAsNew(snapshot: TournamentSnapshot): Promise<void>;
}
