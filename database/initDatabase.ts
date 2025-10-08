import * as SQLite from 'expo-sqlite';
import { DB_FILE_NAME, migrations, type Migration } from './migrations';

export type Db = SQLite.SQLiteDatabase;

let dbInstance: Db | null = null;
export async function getDbAsync(): Promise<Db> {
	if (!dbInstance) {
		dbInstance = await SQLite.openDatabaseAsync(DB_FILE_NAME);
	}
	return dbInstance;
}

async function runStatements(db: Db, statements: string[]): Promise<void> {
	await db.withTransactionAsync(async () => {
		for (const sql of statements) {
			await db.execAsync(sql);
		}
	});
}

async function tableExists(db: Db, tableName: string): Promise<boolean> {
	const row = await db.getFirstAsync<{ c: number }>(
		"SELECT COUNT(1) as c FROM sqlite_master WHERE type='table' AND name=?",
		[tableName]
	);
	return (row?.c ?? 0) > 0;
}

type RowMapper<T> = (row: Record<string, unknown>) => T;

async function querySingle<T>(
	db: Db,
	sql: string,
	params: (string | number | null)[] = [],
	map: RowMapper<T>
): Promise<T | undefined> {
	const rows = await queryAll<T>(db, sql, params, map);
	return rows[0];
}

async function queryAll<T>(
	db: Db,
	sql: string,
	params: (string | number | null)[] = [],
	map: RowMapper<T>
): Promise<T[]> {
	const results = await db.getAllAsync<Record<string, unknown>>(sql, params);
	return results.map(map);
}

async function getAppliedMigrationIds(db: Db): Promise<number[]> {
	const hasLedger = await tableExists(db, 'schema_migrations');
	if (!hasLedger) return [];
	const rows = await db.getAllAsync<{ id: number }>(
		'SELECT id FROM schema_migrations ORDER BY id ASC'
	);
	return rows.map((r) => Number(r.id));
}

async function recordMigration(db: Db, m: Migration): Promise<void> {
	await db.runAsync(
		'INSERT INTO schema_migrations (id, name, applied_at) VALUES (?, ?, ?)',
		[m.id, m.name, Date.now()]
	);
}

export type MigrationResult = {
	applied: number[];
};

export async function runMigrations(): Promise<MigrationResult> {
	const db = await getDbAsync();

	await runStatements(db, [
		"PRAGMA foreign_keys = ON;",
		`CREATE TABLE IF NOT EXISTS schema_migrations (
			id INTEGER PRIMARY KEY,
			name TEXT NOT NULL,
			applied_at INTEGER NOT NULL
		);`,
	]);

	const appliedIds = await getAppliedMigrationIds(db);
	const already = new Set(appliedIds);
	const toApply = migrations.filter((m) => !already.has(m.id)).sort((a, b) => a.id - b.id);

	const applied: number[] = [];
	for (const m of toApply) {
		await runStatements(db, m.statements);
		await recordMigration(db, m);
		applied.push(m.id);
	}

	return { applied };
}

export async function initDatabase(): Promise<Db> {
	const db = await getDbAsync();
	await runMigrations();
	return db;
}

export async function __dangerous__dropAll(): Promise<void> {
	const db = await getDbAsync();
	const tables = await db.getAllAsync<{ name: string }>(
		"SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
	);

	const drops = tables
		.map((t) => t.name)
		.filter((name) => name && name !== 'schema_migrations')
		.map((name) => `DROP TABLE IF EXISTS ${name};`);

	if (drops.length) {
		await runStatements(db, ["PRAGMA foreign_keys = OFF;", ...drops, "PRAGMA foreign_keys = ON;"]);
	}
	await runStatements(db, ['DELETE FROM schema_migrations;']);
}

