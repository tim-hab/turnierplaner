import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { TournamentDatabase } from './database';

const snapshot = {
  version: 'v1.0.0',
  player: [
    {
      id: 1,
      name: 'Alice',
      club: 'Club A',
      elo: 600,
      wins: 1,
      losses: 0,
      frees: 0,
      played: 1,
      points: 3,
      active: true,
    },
    {
      id: 2,
      name: 'Bob',
      club: 'Club B',
      elo: 590,
      wins: 0,
      losses: 1,
      frees: 0,
      played: 1,
      points: 0,
      active: true,
    },
  ],
  clubs: ['Club A', 'Club B'],
  matches: [
    {
      id: 1,
      round: 1,
      field: 1,
      teamA: [1, 2],
      teamB: [1, 2],
      prob: { A: '50%', B: '50%' },
      score: { A: 21, B: 18 },
      completed: true,
    },
  ],
  history: [],
  round: 1,
  totalRounds: 5,
  running: true,
};

const createTempDatabasePath = (): { directory: string; path: string } => {
  const directory = mkdtempSync(join(tmpdir(), 'turnierplaner-'));
  return { directory, path: join(directory, 'turnierplaner.sqlite') };
};

describe('TournamentDatabase', () => {
  let directory: string;

  afterEach(() => {
    if (directory) {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it('migrates a new database and round-trips all tournament data', () => {
    const temporary = createTempDatabasePath();
    directory = temporary.directory;
    const database = new TournamentDatabase(temporary.path);

    database.save(JSON.stringify(snapshot));

    expect(JSON.parse(database.load()!)).toEqual(snapshot);
    expect(database.list()).toHaveLength(1);
    database.close();
  });

  it('keeps the previous snapshot when a save violates database constraints', () => {
    const temporary = createTempDatabasePath();
    directory = temporary.directory;
    const database = new TournamentDatabase(temporary.path);
    database.save(JSON.stringify(snapshot));

    const invalidSnapshot = {
      ...snapshot,
      matches: [{ ...snapshot.matches[0], teamA: [1, 999] }],
    };

    expect(() => database.save(JSON.stringify(invalidSnapshot))).toThrow();
    expect(JSON.parse(database.load()!)).toEqual(snapshot);
    database.close();
  });

  it('migrates the legacy tournament_state table without losing data', () => {
    const temporary = createTempDatabasePath();
    directory = temporary.directory;
    const legacyDatabase = new DatabaseSync(temporary.path);
    legacyDatabase.exec(`
      CREATE TABLE tournament_state (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        snapshot_json TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      INSERT INTO tournament_state (id, snapshot_json, updated_at)
      VALUES (1, '${JSON.stringify(snapshot).replaceAll("'", "''")}', datetime('now'));
      PRAGMA user_version = 1;
    `);
    legacyDatabase.close();

    const database = new TournamentDatabase(temporary.path);

    expect(JSON.parse(database.load()!)).toEqual(snapshot);
    expect(database.list()).toHaveLength(1);
    database.close();
  });
});
