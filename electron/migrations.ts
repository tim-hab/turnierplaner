export interface DatabaseMigration {
  version: number;
  statements: readonly string[];
}

export const migrations: readonly DatabaseMigration[] = [
  {
    version: 1,
    statements: [
      `CREATE TABLE IF NOT EXISTS tournament_state (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        snapshot_json TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`,
    ],
  },
  {
    version: 2,
    statements: [
      `CREATE TABLE IF NOT EXISTS tournaments (
        id INTEGER PRIMARY KEY,
        version TEXT NOT NULL,
        round INTEGER NOT NULL,
        total_rounds INTEGER NOT NULL,
        running INTEGER NOT NULL CHECK (running IN (0, 1)),
        updated_at TEXT NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS clubs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tournament_id INTEGER NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        UNIQUE (tournament_id, name)
      )`,
      `CREATE TABLE IF NOT EXISTS players (
        tournament_id INTEGER NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
        id INTEGER NOT NULL,
        name TEXT NOT NULL,
        club TEXT NOT NULL,
        elo REAL NOT NULL,
        wins INTEGER NOT NULL,
        losses INTEGER NOT NULL,
        frees INTEGER NOT NULL,
        played INTEGER NOT NULL,
        points REAL NOT NULL,
        active INTEGER NOT NULL CHECK (active IN (0, 1)),
        PRIMARY KEY (tournament_id, id)
      )`,
      `CREATE TABLE IF NOT EXISTS matches (
        tournament_id INTEGER NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
        id INTEGER NOT NULL,
        round INTEGER NOT NULL,
        field INTEGER NOT NULL,
        is_history INTEGER NOT NULL CHECK (is_history IN (0, 1)),
        team_a_player_1 INTEGER NOT NULL,
        team_a_player_2 INTEGER NOT NULL,
        team_b_player_1 INTEGER NOT NULL,
        team_b_player_2 INTEGER NOT NULL,
        probability_a TEXT NOT NULL,
        probability_b TEXT NOT NULL,
        score_a INTEGER,
        score_b INTEGER,
        completed INTEGER NOT NULL CHECK (completed IN (0, 1)),
        PRIMARY KEY (tournament_id, id, is_history),
        FOREIGN KEY (tournament_id, team_a_player_1) REFERENCES players(tournament_id, id),
        FOREIGN KEY (tournament_id, team_a_player_2) REFERENCES players(tournament_id, id),
        FOREIGN KEY (tournament_id, team_b_player_1) REFERENCES players(tournament_id, id),
        FOREIGN KEY (tournament_id, team_b_player_2) REFERENCES players(tournament_id, id)
      )`,
    ],
  },
];
