import { DatabaseSync } from 'node:sqlite';
import { migrations } from './migrations';

interface Player {
  id: number;
  name: string;
  club: string;
  elo: number;
  wins: number;
  losses: number;
  frees: number;
  played: number;
  points: number;
  active: boolean;
}

interface MatchExport {
  id: number;
  round: number;
  field: number;
  teamA: [number, number];
  teamB: [number, number];
  prob: { A: string; B: string };
  score?: { A: number; B: number };
  completed: boolean;
}

interface TournamentSnapshot {
  version: string;
  player: Player[];
  clubs: string[];
  matches: MatchExport[];
  history: MatchExport[];
  round: number;
  totalRounds: number;
  running: boolean;
}

interface TournamentRow {
  id: number;
  version: string;
  round: number;
  total_rounds: number;
  running: number;
}

export interface TournamentSummary {
  id: number;
  updatedAt: string;
  round: number;
  running: boolean;
}

interface PlayerRow extends Omit<Player, 'active'> {
  tournament_id: number;
  active: number;
}

interface MatchRow extends Omit<MatchExport, 'teamA' | 'teamB' | 'score' | 'completed'> {
  tournament_id: number;
  is_history: number;
  team_a_player_1: number;
  team_a_player_2: number;
  team_b_player_1: number;
  team_b_player_2: number;
  probability_a: string;
  probability_b: string;
  score_a: number | null;
  score_b: number | null;
  completed: number;
}

export class TournamentDatabase {
  private readonly database: DatabaseSync;

  constructor(path: string) {
    this.database = new DatabaseSync(path);
    this.database.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
    this.migrate();
    this.migrateLegacySnapshots();
    this.assertIntegrity();
  }

  load(): string | null {
    return this.loadById();
  }

  list(): TournamentSummary[] {
    const tournaments = this.database
      .prepare(
        `SELECT id, round, running, updated_at
         FROM tournaments ORDER BY updated_at DESC, id DESC`,
      )
      .all() as { id: number; round: number; running: number; updated_at: string }[];
    return tournaments.map((tournament) => ({
      id: tournament.id,
      updatedAt: tournament.updated_at,
      round: tournament.round,
      running: Boolean(tournament.running),
    }));
  }

  loadById(id?: number): string | null {
    const tournament = this.database
      .prepare(
        `SELECT id, version, round, total_rounds, running
         FROM tournaments
         ${id === undefined ? 'ORDER BY updated_at DESC, id DESC LIMIT 1' : 'WHERE id = ?'}`,
      )
      .get(...(id === undefined ? [] : [id])) as TournamentRow | undefined;
    if (!tournament) {
      return null;
    }

    const players = this.database
      .prepare(
        `SELECT id, name, club, elo, wins, losses, frees, played, points, active
         FROM players WHERE tournament_id = ? ORDER BY id`,
      )
      .all(tournament.id) as unknown as PlayerRow[];
    const clubs = this.database
      .prepare('SELECT name FROM clubs WHERE tournament_id = ? ORDER BY id')
      .all(tournament.id) as { name: string }[];
    const matches = this.loadMatches(tournament.id, false);
    const history = this.loadMatches(tournament.id, true);

    return JSON.stringify({
      version: tournament.version,
      player: players.map(({ active, ...player }) => ({
        ...player,
        active: Boolean(active),
      })),
      clubs: clubs.map((club) => club.name),
      matches,
      history,
      round: tournament.round,
      totalRounds: tournament.total_rounds,
      running: Boolean(tournament.running),
    } satisfies TournamentSnapshot);
  }

  save(snapshot: string, tournamentId?: number): void {
    const parsed = JSON.parse(snapshot) as TournamentSnapshot;
    this.database.exec('BEGIN IMMEDIATE');
    try {
      const current = this.database
        .prepare('SELECT id FROM tournaments ORDER BY updated_at DESC, id DESC LIMIT 1')
        .get() as { id: number } | undefined;
      const id = tournamentId ?? current?.id ?? this.nextTournamentId();

      this.database
        .prepare(
          `INSERT INTO tournaments (id, version, round, total_rounds, running, updated_at)
           VALUES (?, ?, ?, ?, ?, datetime('now'))
           ON CONFLICT(id) DO UPDATE SET
             version = excluded.version,
             round = excluded.round,
             total_rounds = excluded.total_rounds,
             running = excluded.running,
             updated_at = excluded.updated_at`,
        )
        .run(id, parsed.version, parsed.round, parsed.totalRounds, parsed.running ? 1 : 0);
      this.replaceTournamentData(id, parsed);
      this.database.exec('COMMIT');
    } catch (error: unknown) {
      this.database.exec('ROLLBACK');
      throw error;
    }
  }

  saveAsNew(snapshot: string): void {
    this.save(snapshot, this.nextTournamentId());
  }

  createTournament(snapshot: string): number {
    const id = this.nextTournamentId();
    this.save(snapshot, id);
    return id;
  }

  close(): void {
    this.database.close();
  }

  private loadMatches(tournamentId: number, history: boolean): MatchExport[] {
    const rows = this.database
      .prepare(
        `SELECT id, round, field, team_a_player_1, team_a_player_2,
                team_b_player_1, team_b_player_2, probability_a, probability_b,
                score_a, score_b, completed
         FROM matches WHERE tournament_id = ? AND is_history = ? ORDER BY id`,
      )
      .all(tournamentId, history ? 1 : 0) as unknown as MatchRow[];
    return rows.map((match) => ({
      id: match.id,
      round: match.round,
      field: match.field,
      teamA: [match.team_a_player_1, match.team_a_player_2],
      teamB: [match.team_b_player_1, match.team_b_player_2],
      prob: { A: match.probability_a, B: match.probability_b },
      ...(match.score_a !== null && match.score_b !== null
        ? { score: { A: match.score_a, B: match.score_b } }
        : {}),
      completed: Boolean(match.completed),
    }));
  }

  private replaceTournamentData(tournamentId: number, snapshot: TournamentSnapshot): void {
    this.database.prepare('DELETE FROM matches WHERE tournament_id = ?').run(tournamentId);
    this.database.prepare('DELETE FROM players WHERE tournament_id = ?').run(tournamentId);
    this.database.prepare('DELETE FROM clubs WHERE tournament_id = ?').run(tournamentId);

    const insertClub = this.database.prepare(
      'INSERT INTO clubs (tournament_id, name) VALUES (?, ?)',
    );
    snapshot.clubs.forEach((club) => insertClub.run(tournamentId, club));

    const insertPlayer = this.database.prepare(
      `INSERT INTO players
       (tournament_id, id, name, club, elo, wins, losses, frees, played, points, active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    snapshot.player.forEach((player) =>
      insertPlayer.run(
        tournamentId,
        player.id,
        player.name,
        player.club,
        player.elo,
        player.wins,
        player.losses,
        player.frees,
        player.played,
        player.points,
        player.active ? 1 : 0,
      ),
    );

    const insertMatch = this.database.prepare(
      `INSERT INTO matches
       (tournament_id, id, round, field, is_history, team_a_player_1, team_a_player_2,
        team_b_player_1, team_b_player_2, probability_a, probability_b, score_a, score_b, completed)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    const insertMatches = (matches: MatchExport[], history: boolean) => {
      matches.forEach((match) =>
        insertMatch.run(
          tournamentId,
          match.id,
          match.round,
          match.field,
          history ? 1 : 0,
          match.teamA[0],
          match.teamA[1],
          match.teamB[0],
          match.teamB[1],
          match.prob.A,
          match.prob.B,
          match.score?.A ?? null,
          match.score?.B ?? null,
          match.completed ? 1 : 0,
        ),
      );
    };
    insertMatches(snapshot.matches, false);
    insertMatches(snapshot.history, true);
  }

  private nextTournamentId(): number {
    const row = this.database
      .prepare('SELECT COALESCE(MAX(id), 0) + 1 AS id FROM tournaments')
      .get() as {
      id: number;
    };
    return row.id;
  }

  private migrate(): void {
    const versionRow = this.database.prepare('PRAGMA user_version').get() as {
      user_version: number;
    };
    const currentVersion = versionRow.user_version;
    for (const migration of migrations.filter((item) => item.version > currentVersion)) {
      this.database.exec('BEGIN IMMEDIATE');
      try {
        migration.statements.forEach((statement) => this.database.exec(statement));
        this.database.exec(`PRAGMA user_version = ${migration.version}`);
        this.database.exec('COMMIT');
      } catch (error: unknown) {
        this.database.exec('ROLLBACK');
        throw error;
      }
    }
  }

  private migrateLegacySnapshots(): void {
    const legacy = this.database
      .prepare('SELECT snapshot_json FROM tournament_state WHERE id = 1')
      .get() as { snapshot_json: string } | undefined;
    const count = this.database.prepare('SELECT COUNT(*) AS count FROM tournaments').get() as {
      count: number;
    };
    if (!legacy || count.count > 0) {
      return;
    }
    this.save(legacy.snapshot_json);
  }

  private assertIntegrity(): void {
    const result = this.database.prepare('PRAGMA integrity_check').get() as {
      integrity_check: string;
    };
    if (result.integrity_check !== 'ok') {
      throw new Error(`SQLite integrity check failed: ${result.integrity_check}`);
    }
  }
}
